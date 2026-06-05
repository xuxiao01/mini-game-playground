<template>
  <div ref="rootRef" class="flip-card-game">
    <header class="flip-card-game__header">
      <h3 class="flip-card-game__title">翻翻卡记忆挑战</h3>
      <p class="flip-card-game__subtitle">翻开卡片，找到一样的汉字朋友</p>
    </header>

    <template v-if="!isFinished">
      <div class="flip-card-game__stats">
        <p>当前分数：{{ score }}</p>
        <p>已找到：{{ matchedCount }} / {{ totalPairCount }} 对</p>
      </div>

      <div ref="gridRef" class="flip-card-game__grid">
        <button
          v-for="card in cards"
          :key="card.id"
          type="button"
          class="flip-card"
          :class="{
            'flip-card--matched': card.isMatched,
          }"
          :data-card-id="card.id"
          :disabled="!canClickCard(card, selectedCards.length, isChecking) || isEntering"
          @click="handleCardClick(card)"
        >
          <div class="flip-card__inner">
            <div class="flip-card__face flip-card__face--back">
              <img class="flip-card__back-img" :src="cardBackImg" alt="" />
            </div>
            <div class="flip-card__face flip-card__face--front">
              <span class="flip-card__word">{{ card.word }}</span>
            </div>
          </div>
        </button>
      </div>
    </template>

    <template v-else>
      <div ref="resultRef" class="flip-card-game__result">
        <h4>挑战完成！</h4>
        <p>本次得分：{{ score }}</p>
        <p>你找到了全部汉字朋友</p>
        <button type="button" class="flip-card-game__btn" @click="handleRestart">
          重新开始
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { flipCardWords } from './data'
import {
  canClickCard,
  createFlipCards,
  getPairCount,
  isMatchedPair,
  wait,
} from './logic'
import type { FlipCardItem } from './types'
import { useSpeech } from '../../composables/useSpeech'
import flipCardMp3 from '../../assets/audio/flipcard.mp3'
import wrongnnMp3 from '../../assets/audio/wrongnn.mp3'
import finishSuccessMp3 from '../../assets/audio/finish-success.mp3'
import shuffleCardMp3 from '../../assets/audio/shufflecard.mp3'
import cardBackImg from '../../assets/images/card-back.png'

const rootRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const resultRef = ref<HTMLElement | null>(null)

const cards = ref<FlipCardItem[]>([])
const selectedCards = ref<FlipCardItem[]>([])
const score = ref(0)
const matchedCount = ref(0)
const isChecking = ref(false)
const isFinished = ref(false)
const isEntering = ref(false)

let gsapCtx: gsap.Context | null = null
let reducedMotion = false

const sfxFlip = new Audio(flipCardMp3)
const sfxWrong = new Audio(wrongnnMp3)
const sfxFinish = new Audio(finishSuccessMp3)
const sfxShuffle = new Audio(shuffleCardMp3)

/** shufflecard.mp3 时长，洗牌动画与之对齐 */
const SHUFFLE_SFX_DURATION = 0.914

function playSfx(audio: HTMLAudioElement) {
  audio.currentTime = 0
  audio.play().catch(() => {})
}

function stopShuffleSfx() {
  sfxShuffle.pause()
  sfxShuffle.currentTime = 0
}

const { speak, cancel: cancelSpeech } = useSpeech({
  lang: 'zh-CN',
  rate: 0.65,
  delayMs: 450,
})

const totalPairCount = computed(() => getPairCount(cards.value.length))

function getInnerEl(cardId: string): HTMLElement | null {
  return gridRef.value?.querySelector(
    `[data-card-id="${cardId}"] .flip-card__inner`,
  ) as HTMLElement | null
}

function getCardEl(cardId: string): HTMLElement | null {
  return gridRef.value?.querySelector(`[data-card-id="${cardId}"]`) as HTMLElement | null
}

function resetCardTransforms() {
  const cardEls = gridRef.value?.querySelectorAll('.flip-card')
  if (!cardEls?.length) return
  gsap.set(cardEls, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, clearProps: 'zIndex' })
}

function animateCardsEnter(): Promise<void> {
  const cardEls = gridRef.value?.querySelectorAll('.flip-card')
  if (!cardEls?.length) return Promise.resolve()

  if (reducedMotion || !gsapCtx) {
    resetCardTransforms()
    return Promise.resolve()
  }

  const grid = gridRef.value
  if (!grid) return Promise.resolve()

  isEntering.value = true
  const gridRect = grid.getBoundingClientRect()
  const centerX = gridRect.width / 2
  const centerY = gridRect.height / 2

  const stackData = Array.from(cardEls).map((el, index) => {
    const rect = el.getBoundingClientRect()
    const cardCenterX = rect.left + rect.width / 2 - gridRect.left
    const cardCenterY = rect.top + rect.height / 2 - gridRect.top
    return {
      el,
      dx: centerX - cardCenterX,
      dy: centerY - cardCenterY,
      rot: gsap.utils.random(-5, 5),
      z: index,
    }
  })

  return new Promise((resolve) => {
    gsapCtx!.add(() => {
      stackData.forEach(({ el, dx, dy, rot, z }) => {
        gsap.set(el, {
          x: dx,
          y: dy,
          rotation: rot,
          scale: 0.94,
          autoAlpha: 1,
          zIndex: z,
        })
      })

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(cardEls, { clearProps: 'zIndex' })
          isEntering.value = false
          resolve()
        },
      })

      // 轻洗牌：牌堆轻晃，时长与 shufflecard 音效一致（约 0.91s）
      const settleDuration = 0.08
      const wiggleDuration = SHUFFLE_SFX_DURATION - settleDuration
      const wiggleSteps = 7
      const stepDur = wiggleDuration / wiggleSteps

      tl.call(() => playSfx(sfxShuffle))
      for (let step = 0; step < wiggleSteps; step++) {
        const dir = step % 2 === 0 ? 1 : -1
        tl.to(cardEls, {
          x: (i) => stackData[i].dx + dir * gsap.utils.random(5, 8),
          rotation: (i) => stackData[i].rot + dir * gsap.utils.random(2, 5),
          duration: stepDur,
          ease: 'power1.inOut',
        })
      }
      tl.to(cardEls, {
        x: (i) => stackData[i].dx,
        rotation: (i) => stackData[i].rot,
        duration: settleDuration,
        ease: 'power2.out',
      })

      // 发牌落位
      tl.to(cardEls, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.4,
        stagger: {
          each: 0.045,
          from: 'random',
        },
        ease: 'back.out(1.15)',
      })
    })
  })
}

function flipOpen(card: FlipCardItem): Promise<void> {
  card.isFlipped = true
  const inner = getInnerEl(card.id)
  if (!inner || reducedMotion) return Promise.resolve()
  return new Promise((resolve) => {
    gsapCtx?.add(() => {
      gsap.to(inner, {
        rotateY: 180,
        duration: 0.45,
        ease: 'back.out(1.2)',
        onComplete: () => resolve(),
      })
    })
  })
}

function flipClose(card: FlipCardItem): Promise<void> {
  const inner = getInnerEl(card.id)
  if (!inner || reducedMotion) {
    card.isFlipped = false
    gsap.set(inner ?? {}, { rotateY: 0 })
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    gsapCtx?.add(() => {
      gsap.to(inner, {
        rotateY: 0,
        duration: 0.38,
        ease: 'power2.inOut',
        onComplete: () => {
          card.isFlipped = false
          resolve()
        },
      })
    })
  })
}

function animateMatched(cardIds: string[]) {
  if (!gsapCtx || reducedMotion) return
  gsapCtx.add(() => {
    cardIds.forEach((id) => {
      const el = getCardEl(id)
      if (!el) return
      gsap.fromTo(
        el,
        { scale: 1 },
        { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' },
      )
    })
  })
}

function animateWrong(cardIds: string[]): Promise<void> {
  if (!gsapCtx || reducedMotion) {
    playSfx(sfxWrong)
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    playSfx(sfxWrong)
    gsapCtx?.add(() => {
      const els = cardIds
        .map((id) => getCardEl(id))
        .filter((el): el is HTMLElement => Boolean(el))
      if (!els.length) {
        resolve()
        return
      }
      gsap.to(els, {
        x: 6,
        duration: 0.08,
        repeat: 3,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: () => {
          gsap.set(els, { x: 0 })
          resolve()
        },
      })
    })
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
        { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      )
    })
  })
}

async function checkSelectedCards() {
  isChecking.value = true

  const [first, second] = selectedCards.value

  if (isMatchedPair(first, second)) {
    first.isMatched = true
    second.isMatched = true
    score.value += 10
    matchedCount.value += 1
    animateMatched([first.id, second.id])
    await speak(first.word)
  } else {
    await wait(700)
    await animateWrong([first.id, second.id])
    await Promise.all([flipClose(first), flipClose(second)])
  }

  selectedCards.value = []
  isChecking.value = false

  if (matchedCount.value === totalPairCount.value && totalPairCount.value > 0) {
    isFinished.value = true
    playSfx(sfxFinish)
    animateResultEnter()
  }
}

async function handleCardClick(card: FlipCardItem) {
  if (!canClickCard(card, selectedCards.value.length, isChecking.value)) return

  playSfx(sfxFlip)
  await flipOpen(card)
  selectedCards.value.push(card)

  if (selectedCards.value.length === 2) {
    await checkSelectedCards()
  }
}

function resetGame() {
  cancelSpeech()
  cards.value = createFlipCards(flipCardWords)
  selectedCards.value = []
  score.value = 0
  matchedCount.value = 0
  isChecking.value = false
  isFinished.value = false
}

function handleRestart() {
  resetGame()
  nextTick(async () => {
    cards.value.forEach((card) => {
      const inner = getInnerEl(card.id)
      if (inner) gsap.set(inner, { rotateY: 0 })
    })
    resetCardTransforms()
    await animateCardsEnter()
  })
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resetGame()
  if (!rootRef.value) return
  gsapCtx = gsap.context(() => {}, rootRef.value)
  nextTick(() => {
    void animateCardsEnter()
  })
})

onUnmounted(() => {
  stopShuffleSfx()
  gsapCtx?.revert()
  gsapCtx = null
})
</script>

<style scoped>
.flip-card-game {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 8px 4px;
  background: linear-gradient(180deg, #f3f8ff 0%, #eaf4ff 100%);
  border-radius: 12px;
}

.flip-card-game__header {
  text-align: center;
}

.flip-card-game__title {
  margin: 0;
  color: #1f3b66;
  font-size: 22px;
  font-weight: 800;
}

.flip-card-game__subtitle {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 15px;
}

.flip-card-game__stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.flip-card-game__stats p {
  margin: 0;
  color: #334155;
  font-size: 16px;
  font-weight: 600;
}

.flip-card-game__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-width: 420px;
  margin: 0 auto;
  width: 100%;
}

.flip-card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  perspective: 1000px;
  will-change: transform;
}

.flip-card:disabled {
  cursor: default;
}

.flip-card__inner {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform: rotateY(0deg);
}

.flip-card__face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 18px;
  overflow: hidden;
  backface-visibility: hidden;
}

.flip-card__face--back {
  display: block;
  padding: 0;
  background-color: transparent;
}

.flip-card__back-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  pointer-events: none;
  user-select: none;
}

.flip-card__face--front {
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotateY(180deg);
  background: linear-gradient(180deg, #fff9eb 0%, #fdeec8 48%, #fae5b0 100%);
  border: 2px solid #f5d78a;
  box-shadow: 0 10px 22px rgb(15 23 42 / 0.08);
}

.flip-card__word {
  color: #1f3b66;
  font-size: clamp(34px, 10vw, 48px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
}

.flip-card--matched .flip-card__face--front {
  background: linear-gradient(180deg, #f0fff4 0%, #dcfce7 100%);
  border-color: #22c55e;
}

.flip-card--matched .flip-card__word {
  color: #166534;
}

.flip-card-game__result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
}

.flip-card-game__result h4 {
  margin: 0;
  color: #1f2937;
  font-size: 22px;
}

.flip-card-game__result p {
  margin: 0;
  color: #475569;
  font-size: 17px;
}

.flip-card-game__btn {
  min-width: 140px;
  margin-top: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.flip-card-game__btn:hover {
  background: #2563eb;
}

@media (max-width: 480px) {
  .flip-card-game__grid {
    gap: 8px;
  }

  .flip-card__word {
    font-size: clamp(30px, 9vw, 40px);
  }
}
</style>
