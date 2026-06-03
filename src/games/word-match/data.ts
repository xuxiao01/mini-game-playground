import type { WordMatchQuestion } from './types'

export const wordMatchQuestions: WordMatchQuestion[] = [
  {
    id: 'q1',
    targetWord: '小猫',
    prompt: '哪个词最适合和“小猫”搭配？',
    options: ['可爱的', '高大的', '清凉的', '明亮的'],
    correctOption: '可爱的',
    resultPhrase: '可爱的小猫',
    explanation: '“可爱的”常用来形容小猫；“高大的”更适合大树，“清凉的”更适合风，“明亮的”更适合灯光。',
  },
  {
    id: 'q2',
    targetWord: '太阳',
    prompt: '哪个词最适合和“太阳”搭配？',
    options: ['明亮的', '柔软的', '香甜的', '安静的'],
    correctOption: '明亮的',
    resultPhrase: '明亮的太阳',
    explanation: '“明亮的”常用来形容太阳；“柔软的”更适合棉花，“香甜的”更适合水果，“安静的”更适合环境。',
  },
  {
    id: 'q3',
    targetWord: '苹果',
    prompt: '哪个词最适合和“苹果”搭配？',
    options: ['红红的', '响亮的', '沉重的', '凶猛的'],
    correctOption: '红红的',
    resultPhrase: '红红的苹果',
    explanation: '“红红的”可以形容苹果的颜色；“响亮的”更适合声音，“沉重的”更适合石头，“凶猛的”更适合动物。',
  },
  {
    id: 'q4',
    targetWord: '小鸟',
    prompt: '哪个词最适合和“小鸟”搭配？',
    options: ['会飞的', '滚烫的', '香甜的', '高大的'],
    correctOption: '会飞的',
    resultPhrase: '会飞的小鸟',
    explanation: '“会飞的”常用来形容小鸟；“滚烫的”更适合热水，“香甜的”更适合水果，“高大的”更适合树木。',
  },
  {
    id: 'q5',
    targetWord: '花朵',
    prompt: '哪个词最适合和“花朵”搭配？',
    options: ['美丽的', '沉重的', '响亮的', '酸酸的'],
    correctOption: '美丽的',
    resultPhrase: '美丽的花朵',
    explanation: '“美丽的”常用来形容花朵；“沉重的”更适合石头，“响亮的”更适合声音，“酸酸的”更适合味道。',
  },
]