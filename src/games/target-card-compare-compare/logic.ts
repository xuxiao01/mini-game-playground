import type { AnswerRecord, GameResult } from './types'

export function checkAnswer(selectedAnswer: string, correctAnswer: string): boolean {
  return selectedAnswer === correctAnswer
}

export function createAnswerRecord(params: {
  questionId: string
  selectedAnswer: string
  correctAnswer: string
}): AnswerRecord {
  const { questionId, selectedAnswer, correctAnswer } = params
  return {
    questionId,
    selectedAnswer,
    correctAnswer,
    isCorrect: checkAnswer(selectedAnswer, correctAnswer),
    answeredAt: Date.now(),
  }
}

export function calculateGameResult(records: AnswerRecord[], total: number): GameResult {
  const correctCount = records.filter((r) => r.isCorrect).length
  return {
    total,
    correctCount,
    wrongCount: records.length - correctCount,
    answerRecords: records,
  }
}
