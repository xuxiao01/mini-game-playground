import type { FlipCardItem, FlipCardWordItem } from './types'

export function shuffleCards<T>(list: T[]): T[] {
  const arr = list.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function createFlipCards(words: FlipCardWordItem[]): FlipCardItem[] {
  const pairs = words.flatMap((item) => [
    {
      id: `${item.id}-a`,
      pairId: item.id,
      word: item.word,
      isFlipped: false,
      isMatched: false,
    },
    {
      id: `${item.id}-b`,
      pairId: item.id,
      word: item.word,
      isFlipped: false,
      isMatched: false,
    },
  ])
  return shuffleCards(pairs)
}

export function isMatchedPair(cardA: FlipCardItem, cardB: FlipCardItem): boolean {
  return cardA.pairId === cardB.pairId
}

export function getMaxScore(pairCount: number): number {
  return pairCount * 10
}

export function getPairCount(cardCount: number): number {
  return cardCount / 2
}

export function canClickCard(
  card: FlipCardItem,
  selectedCount: number,
  isChecking: boolean,
): boolean {
  if (isChecking) return false
  if (card.isMatched) return false
  if (card.isFlipped) return false
  if (selectedCount >= 2) return false
  return true
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
