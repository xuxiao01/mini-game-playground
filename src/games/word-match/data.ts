import type { WordMatchQuestion } from './types'

export const wordMatchQuestions: WordMatchQuestion[] = [
  {
    id: 'q1',
    targetWord: '小猫',
    prompt: '哪个词最适合和“小猫”搭配？',
    options: ['可爱的', '辣辣的', '冰冷的', '方方的'],
    correctOption: '可爱的',
    resultPhrase: '可爱的小猫',
    explanation: '“可爱的”可以用来形容小猫。',
  },
  {
    id: 'q2',
    targetWord: '太阳',
    prompt: '哪个词最适合和“太阳”搭配？',
    options: ['明亮的', '香香的', '软软的', '矮矮的'],
    correctOption: '明亮的',
    resultPhrase: '明亮的太阳',
    explanation: '“明亮的”可以用来形容太阳。',
  },
  {
    id: 'q3',
    targetWord: '苹果',
    prompt: '哪个词最适合和“苹果”搭配？',
    options: ['红红的', '会飞的', '高高的', '热闹的'],
    correctOption: '红红的',
    resultPhrase: '红红的苹果',
    explanation: '“红红的”可以用来描述苹果的颜色。',
  },
  {
    id: 'q4',
    targetWord: '小鸟',
    prompt: '哪个词最适合和“小鸟”搭配？',
    options: ['会飞的', '甜甜的', '圆圆的', '安静的'],
    correctOption: '会飞的',
    resultPhrase: '会飞的小鸟',
    explanation: '小鸟会飞，所以“会飞的”更合适。',
  },
  {
    id: 'q5',
    targetWord: '花朵',
    prompt: '哪个词最适合和“花朵”搭配？',
    options: ['美丽的', '咸咸的', '沉重的', '方方的'],
    correctOption: '美丽的',
    resultPhrase: '美丽的花朵',
    explanation: '“美丽的”可以用来形容花朵。',
  },
]
