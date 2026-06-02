import type { HideWordQuestion } from './types'

export const hideWordQuestions: HideWordQuestion[] = [
  {
    id: 'q1',
    words: ['春', '风', '花', '月', '山', '水'],
    hiddenWord: '月',
    options: ['春', '月', '云', '木'],
    prompt: '谁躲起来了？',
    difficulty: 'easy',
  },
  {
    id: 'q2',
    words: ['日', '云', '雨', '田', '木', '火'],
    hiddenWord: '雨',
    options: ['雨', '雪', '风', '石'],
    prompt: '少了哪个字？',
    difficulty: 'easy',
  },
  {
    id: 'q3',
    words: ['大', '小', '多', '少', '上', '下'],
    hiddenWord: '少',
    options: ['多', '少', '左', '右'],
    prompt: '找出躲起来的字',
    difficulty: 'easy',
  },
  {
    id: 'q4',
    words: ['红', '黄', '蓝', '绿', '黑', '白'],
    hiddenWord: '绿',
    options: ['紫', '绿', '灰', '粉'],
    prompt: '看看少了哪个颜色字？',
    difficulty: 'easy',
  },
  {
    id: 'q5',
    words: ['鱼', '鸟', '虫', '马', '牛', '羊'],
    hiddenWord: '鸟',
    options: ['鸟', '虎', '猫', '狗'],
    prompt: '谁躲起来了？',
    difficulty: 'easy',
  },
]

