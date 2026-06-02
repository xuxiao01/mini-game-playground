<template>
  <div class="target-card">
    <h3 class="target-card__title">目标卡片挑战</h3>

    <template v-if="!isFinished">
      <p class="target-card__progress">
        第 {{ currentIndex + 1 }} / {{ totalQuestions }} 题
      </p>
      <p class="target-card__prompt">{{ currentQuestion.prompt }}</p>

      <div class="target-card__grid">
        <button
          v-for="option in currentQuestion.options"
          :key="option"
          type="button"
          class="target-card__option"
          :class="getOptionClass(option)"
          :disabled="hasAnswered"
          @click="handleSelect(option)"
        >
          {{ option }}
        </button>
      </div>

      <p v-if="feedbackText" class="target-card__feedback">{{ feedbackText }}</p>

      <button
        v-if="hasAnswered"
        type="button"
        class="target-card__btn"
        @click="handleNext"
      >
        {{ isLastQuestion ? '查看结果' : '下一题' }}
      </button>
    </template>

    <template v-else>
      <div class="target-card__result">
        <h4>挑战完成！</h4>
        <p>总题数：{{ gameResult.total }}</p>
        <p>答对：{{ gameResult.correctCount }}</p>
        <p>答错：{{ gameResult.wrongCount }}</p>
        <button type="button" class="target-card__btn" @click="handleRestart">
          重新开始
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { targetCardQuestions } from './data'
import { calculateGameResult, createAnswerRecord } from './logic'
import type { AnswerRecord, GameResult } from './types'
import clickSuccessMp3 from '../../assets/audio/click-success.mp3'
import clickWrongMp3 from '../../assets/audio/click-wrong.mp3'
import finishSuccessMp3 from '../../assets/audio/finish-success.mp3'

const totalQuestions = targetCardQuestions.length

const currentIndex = ref(0)
const selectedAnswer = ref('')
const hasAnswered = ref(false)
const feedbackText = ref('')
const answerRecords = ref<AnswerRecord[]>([])
const isFinished = ref(false)

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
  if (option === target) return { 'target-card__option--correct': true }
  if (option === selectedAnswer.value && option !== target) {
    return { 'target-card__option--wrong': true }
  }
  return {}
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
}

function handleNext() {
  if (isLastQuestion.value) {
    isFinished.value = true
    playSfx(sfxFinish)
    return
  }

  currentIndex.value += 1
  selectedAnswer.value = ''
  feedbackText.value = ''
  hasAnswered.value = false
}

function handleRestart() {
  currentIndex.value = 0
  selectedAnswer.value = ''
  hasAnswered.value = false
  feedbackText.value = ''
  answerRecords.value = []
  isFinished.value = false
}
</script>

<style scoped>
.target-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 4px;
}

.target-card__title {
  margin: 0;
  color: #1e40af;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}

.target-card__progress {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  text-align: center;
}

.target-card__prompt {
  margin: 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.target-card__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  max-width: 360px;
  margin: 0 auto;
}

.target-card__option {
  min-height: 72px;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #1f2937;
  font-size: 24px;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
}

.target-card__option:hover:not(:disabled) {
  border-color: #93c5fd;
  background: #f8fafc;
}

.target-card__option:disabled {
  cursor: default;
}

.target-card__option--correct {
  border-color: #22c55e;
  background: #dcfce7;
}

.target-card__option--wrong {
  border-color: #ef4444;
  background: #fee2e2;
}

.target-card__feedback {
  margin: 0;
  color: #334155;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.target-card__btn {
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

.target-card__btn:hover {
  background: #2563eb;
}

.target-card__result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
}

.target-card__result h4 {
  margin: 0;
  color: #1f2937;
  font-size: 22px;
}

.target-card__result p {
  margin: 0;
  color: #475569;
  font-size: 17px;
}
</style>
