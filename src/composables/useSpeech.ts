import { onUnmounted } from 'vue'

export interface SpeechOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  /** 开始朗读前的等待毫秒数 */
  delayMs?: number
}

const DEFAULT_OPTIONS: Required<Omit<SpeechOptions, 'delayMs'>> = {
  lang: 'zh-CN',
  rate: 0.85,
  pitch: 1,
  volume: 1,
}

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null
  }
  return window.speechSynthesis
}

export function useSpeech(defaultOptions?: SpeechOptions) {
  const isSupported = getSpeechSynthesis() !== null
  let pendingTimer: number | null = null
  let pendingResolve: (() => void) | null = null

  function finishPending() {
    if (pendingResolve) {
      pendingResolve()
      pendingResolve = null
    }
  }

  function cancel() {
    if (pendingTimer !== null) {
      window.clearTimeout(pendingTimer)
      pendingTimer = null
    }
    finishPending()
    getSpeechSynthesis()?.cancel()
  }

  function speakNow(text: string, options?: SpeechOptions): Promise<void> {
    const synthesis = getSpeechSynthesis()
    const trimmed = text.trim()
    if (!synthesis || !trimmed) return Promise.resolve()

    synthesis.cancel()

    return new Promise((resolve) => {
      pendingResolve = resolve

      const merged = { ...DEFAULT_OPTIONS, ...defaultOptions, ...options }
      const utterance = new SpeechSynthesisUtterance(trimmed)
      utterance.lang = merged.lang
      utterance.rate = merged.rate
      utterance.pitch = merged.pitch
      utterance.volume = merged.volume

      const done = () => {
        if (pendingResolve === resolve) pendingResolve = null
        resolve()
      }

      utterance.onend = done
      utterance.onerror = done
      synthesis.speak(utterance)
    })
  }

  function speak(text: string, options?: SpeechOptions): Promise<void> {
    const trimmed = text.trim()
    if (!trimmed || !isSupported) return Promise.resolve()

    cancel()

    const delayMs = options?.delayMs ?? defaultOptions?.delayMs ?? 0
    if (delayMs <= 0) {
      return speakNow(text, options)
    }

    return new Promise((resolve) => {
      pendingResolve = resolve
      pendingTimer = window.setTimeout(() => {
        pendingTimer = null
        pendingResolve = null
        speakNow(text, options).then(resolve)
      }, delayMs)
    })
  }

  onUnmounted(cancel)

  return {
    isSupported,
    speak,
    cancel,
  }
}
