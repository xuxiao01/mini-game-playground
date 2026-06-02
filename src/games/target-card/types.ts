export interface TargetCardQuestion {
  id: string
  prompt: string
  target: string
  options: string[]
}

export interface AnswerRecord {
  questionId: string
  selectedAnswer: string
  correctAnswer: string
  isCorrect: boolean
  answeredAt: number
}

export interface GameResult {
  total: number
  correctCount: number
  wrongCount: number
  answerRecords: AnswerRecord[]
}
