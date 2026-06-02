export interface WordMatchQuestion {
  id: string
  targetWord: string
  prompt: string
  options: string[]
  correctOption: string
  resultPhrase: string
  explanation?: string
}

export interface WordMatchAnswerRecord {
  questionId: string
  targetWord: string
  selectedOption: string
  correctOption: string
  isCorrect: boolean
  answeredAt: number
}

export interface WordMatchGameResult {
  total: number
  correctCount: number
  wrongCount: number
  answerRecords: WordMatchAnswerRecord[]
}
