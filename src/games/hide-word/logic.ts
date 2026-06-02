import type {
  HideWordAnswerRecord,
  HideWordGameResult,
  HideWordQuestion,
} from './types'

export function checkAnswer(selectedAnswer: string, hiddenWord: string): boolean {
  return selectedAnswer === hiddenWord
}

export function createAnswerRecord(params: {
  questionId: string
  hiddenWord: string
  selectedAnswer: string
}): HideWordAnswerRecord {
  const { questionId, hiddenWord, selectedAnswer } = params
  return {
    questionId,
    hiddenWord,
    selectedAnswer,
    isCorrect: checkAnswer(selectedAnswer, hiddenWord),
    answeredAt: Date.now(),
  }
}

export function calculateGameResult(
  records: HideWordAnswerRecord[],
  total: number,
): HideWordGameResult {
  const correctCount = records.filter((r) => r.isCorrect).length
  return {
    total,
    correctCount,
    wrongCount: records.length - correctCount,
    answerRecords: records,
  }
}

export function shuffle<T>(list: T[]): T[] {
  const arr = list.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function buildRevealSlots(
  question: HideWordQuestion,
  params?: { shuffleVisible?: boolean },
): Array<string | null> {
  const shuffleVisible = params?.shuffleVisible ?? true

  const hiddenIndex = question.words.findIndex((w) => w === question.hiddenWord)
  const visible = question.words.filter((w) => w !== question.hiddenWord)
  const visibleSorted = shuffleVisible ? shuffle(visible) : visible

  let cursor = 0
  return question.words.map((_, idx) => {
    if (idx === hiddenIndex) return null
    const next = visibleSorted[cursor]
    cursor += 1
    return next ?? null
  })
}

