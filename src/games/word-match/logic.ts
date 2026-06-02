import type { WordMatchAnswerRecord, WordMatchGameResult } from './types'

export function checkAnswer(selectedOption: string, correctOption: string): boolean {
  return selectedOption === correctOption
}

export function createAnswerRecord(params: {
  questionId: string
  targetWord: string
  selectedOption: string
  correctOption: string
}): WordMatchAnswerRecord {
  const { questionId, targetWord, selectedOption, correctOption } = params
  return {
    questionId,
    targetWord,
    selectedOption,
    correctOption,
    isCorrect: checkAnswer(selectedOption, correctOption),
    answeredAt: Date.now(),
  }
}

export function calculateGameResult(
  records: WordMatchAnswerRecord[],
  total: number,
): WordMatchGameResult {
  const correctCount = records.filter((r) => r.isCorrect).length
  return {
    total,
    correctCount,
    wrongCount: records.length - correctCount,
    answerRecords: records,
  }
}
