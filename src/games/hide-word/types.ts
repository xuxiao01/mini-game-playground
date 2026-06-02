export interface HideWordQuestion {
  id: string
  words: string[]
  hiddenWord: string
  options: string[]
  prompt?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export type GamePhase =
  | 'memorize'
  | 'hiding'
  | 'reveal'
  | 'answering'
  | 'feedback'
  | 'finished'

export interface HideWordAnswerRecord {
  questionId: string
  hiddenWord: string
  selectedAnswer: string
  isCorrect: boolean
  answeredAt: number
}

export interface HideWordGameResult {
  total: number
  correctCount: number
  wrongCount: number
  answerRecords: HideWordAnswerRecord[]
}

