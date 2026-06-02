<template>
  <div ref="rootRef" class="target-card-compare">
    <h3 class="target-card-compare__title">目标卡片挑战</h3>

    <template v-if="!isFinished">
      <p class="target-card-compare__progress">
        第 {{ currentIndex + 1 }} / {{ totalQuestions }} 题
      </p>
      <p ref="promptRef" class="target-card-compare__prompt">{{ currentQuestion.prompt }}</p>

      <div ref="gridRef" class="target-card-compare__grid">
        <button
          v-for="option in currentQuestion.options"
          :key="`${currentQuestion.id}-${option}`"
          type="button"
          class="target-card-compare__option"
          :class="getOptionClass(option)"
          :data-option="option"
          :disabled="hasAnswered"
          @click="handleSelect(option)"
        >
          {{ option }}
        </button>
      </div>

      <p
        v-if="feedbackText"
        ref="feedbackRef"
        class="target-card-compare__feedback"
      >
        {{ feedbackText }}
      </p>

      <button
        v-if="hasAnswered"
        ref="nextBtnRef"
        type="button"
        class="target-card-compare__btn"
        @click="handleNext"
      >
        {{ isLastQuestion ? '查看结果' : '下一题' }}
      </button>
    </template>

    <template v-else>
      <div ref="resultRef" class="target-card-compare__result">
        <h4>挑战完成！</h4>
        <p>总题数：{{ gameResult.total }}</p>
        <p>答对：{{ gameResult.correctCount }}</p>
        <p>答错：{{ gameResult.wrongCount }}</p>
        <button type="button" class="target-card-compare__btn" @click="handleRestart">
          重新开始
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { targetCardQuestions } from './data'
import { calculateGameResult, createAnswerRecord } from './logic'
import type { AnswerRecord, GameResult } from './types'
import clickSuccessMp3 from '../../assets/audio/click-success.mp3'
import clickWrongMp3 from '../../assets/audio/click-wrong.mp3'
import finishSuccessMp3 from '../../assets/audio/finish-success.mp3'

const totalQuestions = targetCardQuestions.length

const rootRef = ref<HTMLElement | null>(null)
const promptRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const feedbackRef = ref<HTMLElement | null>(null)
const nextBtnRef = ref<HTMLElement | null>(null)
const resultRef = ref<HTMLElement | null>(null)

const currentIndex = ref(0)
const selectedAnswer = ref('')
const hasAnswered = ref(false)
const feedbackText = ref('')
const answerRecords = ref<AnswerRecord[]>([])
const isFinished = ref(false)

let gsapCtx: gsap.Context | null = null
let reducedMotion = false

const currentQuestion = computed(() => targetCardQuestions[currentIndex.value])

const isLastQuestion = computed(
  () => currentIndex.value === totalQuestions - 1,
)

const gameResult = computed<GameResult>(() =>
  calculateGameResult(answerRecords.value, totalQuestions),
)

const sfxCorrect = new Audio(clickSuccessMp3)
const sfxWrong = new Audio(clickWrongMp3)
const sfxFinish = new Audio(finishSuccessMp3)

function playSfx(audio: HTMLAudioElement) {
  audio.currentTime = 0
  audio.play().catch(() => {})
}

function getOptionClass(option: string): Record<string, boolean> {
  if (!hasAnswered.value) return {}
  const target = currentQuestion.value.target
  if (option === target) return { 'target-card-compare__option--correct': true }
  if (option === selectedAnswer.value && option !== target) {
    return { 'target-card-compare__option--wrong': true }
  }
  return {}
}

function animateQuestionEnter() {
  if (!gsapCtx || reducedMotion) return
  gsapCtx.add(() => {
    const prompt = promptRef.value
    const options = gridRef.value?.querySelectorAll('.target-card-compare__option')
    if (prompt) {
      gsap.fromTo(prompt, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' })
    }
    if (options?.length) {
      gsap.fromTo(
        options,
        { autoAlpha: 0, scale: 0.92 },
        { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.06, ease: 'back.out(1.4)' },
      )
    }
  })
}

function animateAnswerFeedback(isCorrect: boolean, optionEl: HTMLElement | null) {
  if (!gsapCtx || reducedMotion || !optionEl) return
  gsapCtx.add(() => {
    gsap.fromTo(
      optionEl,
      { scale: 1 },
      {
        scale: isCorrect ? 1.08 : 0.95,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: isCorrect ? 'back.out(2)' : 'power2.inOut',
      },
    )
    const feedback = feedbackRef.value
    if (feedback) {
      gsap.fromTo(feedback, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' })
    }
    const nextBtn = nextBtnRef.value
    if (nextBtn) {
      gsap.fromTo(nextBtn, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.25, delay: 0.15, ease: 'power2.out' })
    }
  })
}

function animateResultEnter() {
  if (!gsapCtx || reducedMotion) return
  nextTick(() => {
    const result = resultRef.value
    if (!result) return
    gsapCtx?.add(() => {
      gsap.fromTo(
        result,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' },
      )
    })
  })
}

function handleSelect(option: string) {
  if (hasAnswered.value) return

  selectedAnswer.value = option
  hasAnswered.value = true

  const record = createAnswerRecord({
    questionId: currentQuestion.value.id,
    selectedAnswer: option,
    correctAnswer: currentQuestion.value.target,
  })
  answerRecords.value.push(record)

  feedbackText.value = record.isCorrect ? '答对啦！' : '再试试看'
  playSfx(record.isCorrect ? sfxCorrect : sfxWrong)

  nextTick(() => {
    const optionEl = gridRef.value?.querySelector(
      `[data-option="${option}"]`,
    ) as HTMLElement | null
    animateAnswerFeedback(record.isCorrect, optionEl)
  })
}

function handleNext() {
  if (isLastQuestion.value) {
    isFinished.value = true
    playSfx(sfxFinish)
    animateResultEnter()
    return
  }

  currentIndex.value += 1
  selectedAnswer.value = ''
  feedbackText.value = ''
  hasAnswered.value = false

  nextTick(() => animateQuestionEnter())
}

function handleRestart() {
  currentIndex.value = 0
  selectedAnswer.value = ''
  hasAnswered.value = false
  feedbackText.value = ''
  answerRecords.value = []
  isFinished.value = false

  nextTick(() => animateQuestionEnter())
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!rootRef.value) return
  gsapCtx = gsap.context(() => {}, rootRef.value)
  nextTick(() => animateQuestionEnter())
})

onUnmounted(() => {
  gsapCtx?.revert()
  gsapCtx = null
})

</script>

<style scoped>
.target-card-compare {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 4px;
}

.target-card-compare__title {
  margin: 0;
  color: #1e40af;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}

.target-card-compare__progress {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  text-align: center;
}

.target-card-compare__prompt {
  margin: 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.target-card-compare__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  max-width: 360px;
  margin: 0 auto;
}

.target-card-compare__option {
  min-height: 72px;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #1f2937;
  font-size: 24px;
  cursor: pointer;
}

.target-card-compare__option:hover:not(:disabled) {
  border-color: #93c5fd;
  background: #f8fafc;
}

.target-card-compare__option:disabled {
  cursor: default;
}

.target-card-compare__option--correct {
  border-color: #22c55e;
  background: #dcfce7;
}

.target-card-compare__option--wrong {
  border-color: #ef4444;
  background: #fee2e2;
}

.target-card-compare__feedback {
  margin: 0;
  color: #334155;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.target-card-compare__btn {
  align-self: center;
  min-width: 140px;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.target-card-compare__btn:hover {
  background: #2563eb;
}

.target-card-compare__result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
}

.target-card-compare__result h4 {
  margin: 0;
  color: #1f2937;
  font-size: 22px;
}

.target-card-compare__result p {
  margin: 0;
  color: #475569;
  font-size: 17px;
}
</style>
