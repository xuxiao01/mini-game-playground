import type { TargetCardQuestion } from './types'

export const targetCardQuestions: TargetCardQuestion[] = [
  {
    id: 'q1',
    prompt: '找出“春”字',
    target: '春',
    options: ['春', '风', '花', '月', '山', '水'],
  },
  {
    id: 'q2',
    prompt: '找出“月”字',
    target: '月',
    options: ['日', '月', '云', '雨', '田', '木'],
  },
  {
    id: 'q3',
    prompt: '找出“山”字',
    target: '山',
    options: ['石', '土', '山', '川', '林', '火'],
  },
  {
    id: 'q4',
    prompt: '找出“花”字',
    target: '花',
    options: ['草', '树', '叶', '花', '果', '种'],
  },
  {
    id: 'q5',
    prompt: '找出“水”字',
    target: '水',
    options: ['江', '河', '湖', '海', '水', '泉'],
  },
]
