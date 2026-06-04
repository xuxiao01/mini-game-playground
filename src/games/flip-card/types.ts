export interface FlipCardWordItem {
  id: string
  word: string
}

export interface FlipCardItem {
  id: string
  pairId: string
  word: string
  isFlipped: boolean
  isMatched: boolean
}
