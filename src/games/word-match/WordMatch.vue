<template>
  <div ref="rootRef" class="word-match">
    <header class="word-match__header">
      <h3 class="word-match__title">词语搭配挑战</h3>
      <p class="word-match__subtitle">帮词语找到最合适的朋友</p>
    </header>

    <template v-if="!isFinished">
      <p class="word-match__progress">
        第 {{ currentIndex + 1 }} / {{ totalQuestions }} 题
      </p>

      <div ref="targetRef" class="word-match__target-card">
        {{ currentQuestion.targetWord }}
      </div>

      <p ref="promptRef" class="word-match__prompt">{{ currentQuestion.prompt }}</p>

      <div ref="gridRef" class="word-match__grid">
        <button
          v-for="option in currentQuestion.options"
          :key="`${currentQuestion.id}-${option}`"
          type="button"
          class="word-match__option"
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
        class="word-match__feedback"
      >
        {{ feedbackText }}
      </p>

      <button
        v-if="hasAnswered"
        ref="nextBtnRef"
        type="button"
        class="word-match__btn"
        @click="handleNext"
      >
        {{ isLastQuestion ? '查看结果' : '下一题' }}
      </button>
    </template>

    <template v-else>
      <div ref="resultRef" class="word-match__result">
        <h4>挑战完成！</h4>
        <p>总题数：{{ gameResult.total }}</p>
        <p>答对：{{ gameResult.correctCount }}</p>
        <p>答错：{{ gameResult.wrongCount }}</p>
        <button type="button" class="word-match__btn" @click="handleRestart">
          重新开始
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { wordMatchQuestions } from './data'
import { calculateGameResult, createAnswerRecord } from './logic'
import type { WordMatchAnswerRecord, WordMatchGameResult } from './types'
import clickSuccessMp3 from '../../assets/audio/click-success.mp3'
import clickWrongMp3 from '../../assets/audio/click-wrong.mp3'
import finishSuccessMp3 from '../../assets/audio/finish-success.mp3'

const totalQuestions = wordMatchQuestions.length

const rootRef = ref<HTMLElement | null>(null)
const targetRef = ref<HTMLElement | null>(null)
const promptRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const feedbackRef = ref<HTMLElement | null>(null)
const nextBtnRef = ref<HTMLElement | null>(null)
const resultRef = ref<HTMLElement | null>(null)

const currentIndex = ref(0)
const selectedOption = ref('')
const hasAnswered = ref(false)
const feedbackText = ref('')
const answerRecords = ref<WordMatchAnswerRecord[]>([])
const isFinished = ref(false)

let gsapCtx: gsap.Context | null = null
let reducedMotion = false

const currentQuestion = computed(() => wordMatchQuestions[currentIndex.value])

const isLastQuestion = computed(
  () => currentIndex.value === totalQuestions - 1,
)

const gameResult = computed<WordMatchGameResult>(() =>
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
  const correct = currentQuestion.value.correctOption
  if (option === correct) return { 'word-match__option--correct': true }
  if (option === selectedOption.value && option !== correct) {
    return { 'word-match__option--wrong': true }
  }
  return {}
}

function animateQuestionEnter() {
  if (!gsapCtx || reducedMotion) return
  gsapCtx.add(() => {
    const target = targetRef.value
    const prompt = promptRef.value
    const options = gridRef.value?.querySelectorAll('.word-match__option')
    if (target) {
      gsap.fromTo(
        target,
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.6)' },
      )
    }
    if (prompt) {
      gsap.fromTo(
        prompt,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.35, delay: 0.1, ease: 'power2.out' },
      )
    }
    if (options?.length) {
      gsap.fromTo(
        options,
        { autoAlpha: 0, scale: 0.92 },
        { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.08, delay: 0.15, ease: 'back.out(1.4)' },
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
        scale: isCorrect ? 1.06 : 0.96,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: isCorrect ? 'back.out(2)' : 'power2.inOut',
      },
    )
    const feedback = feedbackRef.value
    if (feedback) {
      gsap.fromTo(
        feedback,
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      )
    }
    const nextBtn = nextBtnRef.value
    if (nextBtn) {
      gsap.fromTo(
        nextBtn,
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.25, delay: 0.15, ease: 'power2.out' },
      )
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

function buildFeedback(isCorrect: boolean): string {
  const q = currentQuestion.value
  if (isCorrect) {
    return `答对啦！${q.resultPhrase}`
  }
  return `再想想，哪个词更适合“${q.targetWord}”？`
}

function handleSelect(option: string) {
  if (hasAnswered.value) return

  selectedOption.value = option
  hasAnswered.value = true

  const record = createAnswerRecord({
    questionId: currentQuestion.value.id,
    targetWord: currentQuestion.value.targetWord,
    selectedOption: option,
    correctOption: currentQuestion.value.correctOption,
  })
  answerRecords.value.push(record)

  feedbackText.value = buildFeedback(record.isCorrect)
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
  selectedOption.value = ''
  feedbackText.value = ''
  hasAnswered.value = false

  nextTick(() => animateQuestionEnter())
}

function handleRestart() {
  currentIndex.value = 0
  selectedOption.value = ''
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
.word-match {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 4px;
}

.word-match__header {
  text-align: center;
}

.word-match__title {
  margin: 0;
  color: #7c3aed;
  font-size: 22px;
  font-weight: 700;
}

.word-match__subtitle {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 15px;
}

.word-match__progress {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  text-align: center;
}

.word-match__target-card {
  align-self: center;
  min-width: 160px;
  padding: 20px 32px;
  border: 2px solid #ddd6fe;
  border-radius: 16px;
  background: linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%);
  color: #5b21b6;
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
}

.word-match__prompt {
  margin: 0;
  color: #334155;
  font-size: 17px;
  font-weight: 500;
  text-align: center;
  line-height: 1.5;
}

.word-match__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  max-width: 320px;
  margin: 0 auto;
  width: 100%;
}

.word-match__option {
  min-height: 64px;
  padding: 14px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #1f2937;
  font-size: 18px;
  cursor: pointer;
}

.word-match__option:hover:not(:disabled) {
  border-color: #c4b5fd;
  background: #faf5ff;
}

.word-match__option:disabled {
  cursor: default;
}

.word-match__option--correct {
  border-color: #22c55e;
  background: #dcfce7;
}

.word-match__option--wrong {
  border-color: #ef4444;
  background: #fee2e2;
}

.word-match__feedback {
  margin: 0;
  color: #334155;
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  line-height: 1.5;
}

.word-match__btn {
  align-self: center;
  min-width: 140px;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  background: #8b5cf6;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.word-match__btn:hover {
  background: #7c3aed;
}

.word-match__result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
}

.word-match__result h4 {
  margin: 0;
  color: #1f2937;
  font-size: 22px;
}

.word-match__result p {
  margin: 0;
  color: #475569;
  font-size: 17px;
}
</style>
