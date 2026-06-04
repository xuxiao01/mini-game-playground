export interface GameMeta {
  id: string
  name: string
  type: string
  desc: string
  status: 'ready' | 'todo' | 'placeholder'
}

export const statusTextMap: Record<GameMeta['status'], string> = {
  ready: '已接入',
  todo: '待开发',
  placeholder: '占位',
}

export const gameRegistry: GameMeta[] = [
  {
    id: 'target-card',
    name: '目标卡片挑战-未使用动画库',
    type: '识字类',
    desc: '根据提示找出目标汉字',
    status: 'ready',
  },
  {
    id: 'target-card-compare',
    name: '目标卡片挑战-使用GASP 动画库以及 GASP-skill',
    type: '识字类',
    desc: '根据提示找出目标汉字',
    status: 'ready',
  },
  {
    id: 'word-match',
    name: '词语搭配挑战',
    type: '语言类',
    desc: '帮词语找到最合适的朋友',
    status: 'ready',
  },
  {
    id: 'hide-word',
    name: '文字躲猫猫',
    type: '记忆类',
    desc: '记住 6 个汉字，找出躲起来的那个',
    status: 'ready',
  },
  {
    id: 'flip-card',
    name: '翻翻卡记忆挑战',
    type: '记忆类',
    desc: '翻开卡片，找到一样的汉字朋友',
    status: 'ready',
  },
  {
    id: 'poem-grid',
    name: '古诗词九宫格',
    type: '诗词类',
    desc: '根据提示选择正确诗句或字词',
    status: 'todo',
  },
  {
    id: 'listen-choice',
    name: '听音选字',
    type: '听力类',
    desc: '听语音选择对应汉字',
    status: 'placeholder',
  },
]
