<template>
  <div ref="rootRef" class="hide-word">
    <header class="hide-word__header">
      <h3 class="hide-word__title">文字躲猫猫</h3>
      <p class="hide-word__subtitle">记住这些字，找出躲起来的那个！</p>
    </header>

    <button
      type="button"
      class="hide-word__bgm-toggle"
      @click="toggleBgm"
    >
      {{ isBgmOn ? '关闭音乐' : '开启音乐' }}
    </button>

    <template v-if="phase !== 'finished'">
      <p class="hide-word__progress">第 {{ currentIndex + 1 }} / {{ totalQuestions }} 题</p>

      <div class="hide-word__hint">
        <p class="hide-word__hint-title">{{ phaseHintTitle }}</p>
        <p v-if="phase === 'memorize'" class="hide-word__hint-sub">
          {{ memorizeCountdown }} 秒后开始躲猫猫
        </p>
      </div>

      <section class="hide-word__board" aria-label="记忆区">
        <div ref="wordsGridRef" class="hide-word__words-grid">
          <div
            v-for="(word, idx) in visibleWords"
            :key="`${currentQuestion.id}-${idx}`"
            class="hide-word__word-card"
            :class="{ 'hide-word__word-card--empty': !word }"
          >
            {{ word ?? '' }}
          </div>
        </div>
      </section>

      <section class="hide-word__prompt" aria-label="提示区">
        <span v-if="phase !== 'memorize' && phase !== 'hiding'">
          {{ currentPrompt }}
        </span>
      </section>

      <section class="hide-word__options" aria-label="选项区">
        <div
          v-if="phase !== 'memorize' && phase !== 'hiding'"
          ref="optionsGridRef"
          class="hide-word__options-grid"
        >
          <button
            v-for="option in currentQuestion.options"
            :key="`${currentQuestion.id}-${option}`"
            type="button"
            class="hide-word__option-card"
            :class="getOptionClass(option)"
            :disabled="phase !== 'answering'"
            :data-option="option"
            @click="handleSelect(option)"
          >
            {{ option }}
          </button>
        </div>
      </section>

      <section class="hide-word__footer" aria-label="反馈区">
        <p v-if="feedbackText" ref="feedbackRef" class="hide-word__feedback">
          {{ feedbackText }}
        </p>

        <button
          v-if="phase === 'feedback'"
          ref="nextBtnRef"
          type="button"
          class="hide-word__btn"
          @click="handleNext"
        >
          {{ isLastQuestion ? '查看结果' : '下一题' }}
        </button>
      </section>
    </template>

    <template v-else>
      <div ref="resultRef" class="hide-word__result">
        <h4>挑战完成！</h4>
        <p>总题数：{{ gameResult.total }}</p>
        <p>答对：{{ gameResult.correctCount }}</p>
        <p>答错：{{ gameResult.wrongCount }}</p>
        <button type="button" class="hide-word__btn" @click="handleRestart">
          重新开始
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { hideWordQuestions } from './data'
import { buildRevealSlots, calculateGameResult, createAnswerRecord, shuffle } from './logic'
import type { GamePhase, HideWordAnswerRecord, HideWordGameResult } from './types'
import clickSuccessMp3 from '../../assets/audio/click-success.mp3'
import clickWrongMp3 from '../../assets/audio/click-wrong.mp3'
import finishSuccessMp3 from '../../assets/audio/finish-success.mp3'
import cuteBgmMp3 from '../../assets/audio/cute-bgm-web.mp3'

const totalQuestions = hideWordQuestions.length

const rootRef = ref<HTMLElement | null>(null)
const wordsGridRef = ref<HTMLElement | null>(null)
const optionsGridRef = ref<HTMLElement | null>(null)
const feedbackRef = ref<HTMLElement | null>(null)
const nextBtnRef = ref<HTMLElement | null>(null)
const resultRef = ref<HTMLElement | null>(null)

const currentIndex = ref(0)
const phase = ref<GamePhase>('memorize')
const visibleWords = ref<Array<string | null>>([])
const memorizeCountdown = ref(5)
const selectedAnswer = ref('')
const feedbackText = ref('')
const answerRecords = ref<HideWordAnswerRecord[]>([])

let gsapCtx: gsap.Context | null = null
let reducedMotion = false
let timers: number[] = []
let detachBgmUnlock: (() => void) | null = null

const sfxCorrect = new Audio(clickSuccessMp3)
const sfxWrong = new Audio(clickWrongMp3)
const sfxFinish = new Audio(finishSuccessMp3)
const bgm = new Audio(cuteBgmMp3)
bgm.loop = true

function playSfx(audio: HTMLAudioElement) {
  audio.currentTime = 0
  audio.play().catch(() => {})
}

const isBgmOn = ref(true)

function tryPlayBgm() {
  if (!isBgmOn.value) return
  bgm.volume = 0.35
  bgm.play().catch(() => {})
}

function stopBgm() {
  bgm.pause()
  bgm.currentTime = 0
}

function toggleBgm() {
  isBgmOn.value = !isBgmOn.value
  if (isBgmOn.value) {
    tryPlayBgm()
  } else {
    stopBgm()
  }
}

const currentQuestion = computed(() => hideWordQuestions[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === totalQuestions - 1)

const gameResult = computed<HideWordGameResult>(() =>
  calculateGameResult(answerRecords.value, totalQuestions),
)

const currentPrompt = computed(() => currentQuestion.value.prompt ?? '谁躲起来了？')

const phaseHintTitle = computed(() => {
  switch (phase.value) {
    case 'memorize':
      return '先记住这些字'
    case 'hiding':
      return '汉字正在躲起来……'
    case 'reveal':
      return '看看少了哪个字？'
    case 'answering':
      return '谁躲起来了？'
    case 'feedback':
      return '做得不错！'
    default:
      return ''
  }
})

function clearAllTimers() {
  timers.forEach((t) => window.clearTimeout(t))
  timers = []
}

function getOptionClass(option: string): Record<string, boolean> {
  if (phase.value !== 'feedback') return {}
  const correct = currentQuestion.value.hiddenWord
  if (option === correct) return { 'hide-word__option-card--correct': true }
  if (option === selectedAnswer.value && option !== correct) {
    return { 'hide-word__option-card--wrong': true }
  }
  return {}
}

function animateWordsEnter() {
  if (!gsapCtx || reducedMotion) return
  gsapCtx.add(() => {
    const cards = wordsGridRef.value?.querySelectorAll('.hide-word__word-card')
    if (!cards?.length) return
    gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 12, scale: 0.94 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.06, ease: 'power2.out' },
    )
  })
}

function animateWordsHide() {
  if (!gsapCtx || reducedMotion) return Promise.resolve()
  return new Promise<void>((resolve) => {
    gsapCtx?.add(() => {
      const cards = wordsGridRef.value?.querySelectorAll('.hide-word__word-card')
      if (!cards?.length) {
        resolve()
        return
      }
      gsap.to(cards, {
        autoAlpha: 0,
        y: 10,
        scale: 0.88,
        duration: 0.35,
        stagger: 0.05,
        ease: 'power2.in',
        onComplete: () => resolve(),
      })
    })
  })
}

function animateWordsReveal() {
  if (!gsapCtx || reducedMotion) return
  gsapCtx.add(() => {
    const cards = wordsGridRef.value?.querySelectorAll('.hide-word__word-card')
    if (!cards?.length) return
    gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 10, scale: 0.92 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.07, ease: 'back.out(1.4)' },
    )
  })
}

function animateOptionsEnter() {
  if (!gsapCtx || reducedMotion) return
  gsapCtx.add(() => {
    const options = optionsGridRef.value?.querySelectorAll('.hide-word__option-card')
    if (!options?.length) return
    gsap.fromTo(
      options,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' },
    )
  })
}

function animateCorrect(optionEl: HTMLElement) {
  if (!gsapCtx || reducedMotion) return
  gsapCtx.add(() => {
    gsap.fromTo(
      optionEl,
      { scale: 1 },
      { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: 'back.out(2)' },
    )
  })
}

function animateWrong(optionEl: HTMLElement) {
  if (!gsapCtx || reducedMotion) return
  gsapCtx.add(() => {
    gsap.fromTo(
      optionEl,
      { x: 0 },
      { x: 8, duration: 0.08, yoyo: true, repeat: 5, ease: 'power1.inOut' },
    )
  })
}

function animateFeedbackEnter() {
  if (!gsapCtx || reducedMotion) return
  gsapCtx.add(() => {
    const feedback = feedbackRef.value
    if (feedback) {
      gsap.fromTo(
        feedback,
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' },
      )
    }
    const nextBtn = nextBtnRef.value
    if (nextBtn) {
      gsap.fromTo(
        nextBtn,
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.22, delay: 0.1, ease: 'power2.out' },
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

async function startRound() {
  clearAllTimers()

  phase.value = 'memorize'
  selectedAnswer.value = ''
  feedbackText.value = ''
  memorizeCountdown.value = 5

  const isFirstTwo = currentIndex.value < 2
  visibleWords.value = isFirstTwo
    ? currentQuestion.value.words.slice()
    : shuffle(currentQuestion.value.words)
  await nextTick()
  animateWordsEnter()

  // 倒计时 + 自动进入躲藏
  timers.push(
    window.setTimeout(() => (memorizeCountdown.value = 4), 1000),
    window.setTimeout(() => (memorizeCountdown.value = 3), 2000),
    window.setTimeout(() => (memorizeCountdown.value = 2), 3000),
    window.setTimeout(() => (memorizeCountdown.value = 1), 4000),
    window.setTimeout(() => void runHidingAndReveal(), 5000),
  )
}

async function runHidingAndReveal() {
  phase.value = 'hiding'
  await nextTick()

  if (!reducedMotion) {
    await animateWordsHide()
  }

  phase.value = 'reveal'
  const isFirstTwo = currentIndex.value < 2
  visibleWords.value = buildRevealSlots(currentQuestion.value, {
    shuffleVisible: !isFirstTwo,
  })
  await nextTick()
  animateWordsReveal()

  phase.value = 'answering'
  await nextTick()
  animateOptionsEnter()
}

function handleSelect(option: string) {
  if (phase.value !== 'answering') return

  selectedAnswer.value = option
  const record = createAnswerRecord({
    questionId: currentQuestion.value.id,
    hiddenWord: currentQuestion.value.hiddenWord,
    selectedAnswer: option,
  })
  answerRecords.value.push(record)
  playSfx(record.isCorrect ? sfxCorrect : sfxWrong)

  phase.value = 'feedback'
  feedbackText.value = record.isCorrect
    ? `找对啦！躲起来的是「${currentQuestion.value.hiddenWord}」`
    : '再想想，刚刚躲起来的是哪个字？'

  nextTick(() => {
    const optionEl = optionsGridRef.value?.querySelector(
      `[data-option="${option}"]`,
    ) as HTMLElement | null
    if (optionEl) {
      record.isCorrect ? animateCorrect(optionEl) : animateWrong(optionEl)
    }
    animateFeedbackEnter()
  })
}

function handleNext() {
  if (!isLastQuestion.value) {
    currentIndex.value += 1
    void startRound()
    return
  }
  phase.value = 'finished'
  playSfx(sfxFinish)
  animateResultEnter()
}

function handleRestart() {
  currentIndex.value = 0
  answerRecords.value = []
  phase.value = 'memorize'
  void startRound()
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!rootRef.value) return
  gsapCtx = gsap.context(() => {}, rootRef.value)
  tryPlayBgm()

  // 兼容部分浏览器的自动播放限制：首次用户交互时再尝试播放一次
  const unlock = () => {
    if (isBgmOn.value) tryPlayBgm()
  }
  window.addEventListener('pointerdown', unlock, { once: true })
  detachBgmUnlock = () => window.removeEventListener('pointerdown', unlock)

  void startRound()
})

onUnmounted(() => {
  clearAllTimers()
  detachBgmUnlock?.()
  detachBgmUnlock = null
  stopBgm()
  gsapCtx?.revert()
  gsapCtx = null
})
</script>

<style scoped>
.hide-word {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 8px 4px;
}

.hide-word__header {
  text-align: center;
}

.hide-word__title {
  margin: 0;
  color: #0f4c81;
  font-size: 22px;
  font-weight: 800;
}

.hide-word__subtitle {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 15px;
}

.hide-word__bgm-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  background: #ffffff;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 22px rgb(15 23 42 / 0.08);
}

.hide-word__bgm-toggle:hover {
  background: #eff6ff;
}

.hide-word__progress {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  text-align: center;
}

.hide-word__hint {
  text-align: center;
}

.hide-word__hint-title {
  margin: 0;
  color: #334155;
  font-size: 16px;
  font-weight: 700;
}

.hide-word__hint-sub {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.hide-word__board {
  padding: 14px;
  border-radius: 14px;
  background: #f0f7ff;
  border: 1px solid #dbeafe;
}

.hide-word__words-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 360px;
  margin: 0 auto;
}

.hide-word__word-card {
  display: grid;
  place-items: center;
  min-height: 72px;
  border-radius: 14px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  box-shadow: 0 10px 22px rgb(15 23 42 / 0.06);
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
}

.hide-word__word-card--empty {
  background: transparent;
  border-style: dashed;
  color: transparent;
  box-shadow: none;
}

.hide-word__prompt {
  min-height: 26px;
  text-align: center;
  color: #334155;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.5;
}

.hide-word__options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  max-width: 320px;
  margin: 0 auto;
  width: 100%;
}

.hide-word__option-card {
  min-height: 64px;
  padding: 14px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
  cursor: pointer;
}

.hide-word__option-card:hover:not(:disabled) {
  border-color: #93c5fd;
  background: #f8fafc;
}

.hide-word__option-card:disabled {
  cursor: default;
}

.hide-word__option-card--correct {
  border-color: #22c55e;
  background: #dcfce7;
}

.hide-word__option-card--wrong {
  border-color: #ef4444;
  background: #fee2e2;
}

.hide-word__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}

.hide-word__feedback {
  margin: 0;
  color: #334155;
  font-size: 17px;
  font-weight: 700;
  text-align: center;
  line-height: 1.5;
}

.hide-word__btn {
  min-width: 140px;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.hide-word__btn:hover {
  background: #2563eb;
}

.hide-word__result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
}

.hide-word__result h4 {
  margin: 0;
  color: #1f2937;
  font-size: 22px;
}

.hide-word__result p {
  margin: 0;
  color: #475569;
  font-size: 17px;
}
</style>

