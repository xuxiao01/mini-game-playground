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
    id: 'poem-grid',
    name: '古诗词九宫格',
    type: '诗词类',
    desc: '根据提示选择正确诗句或字词',
    status: 'todo',
  },
  {
    id: 'idiom-match',
    name: '成语配对',
    type: '成语类',
    desc: '匹配成语释义与答案',
    status: 'placeholder',
  },
  {
    id: 'word-link',
    name: '字词连线',
    type: '识字类',
    desc: '连接相关字词或释义',
    status: 'placeholder',
  },
  {
    id: 'listen-choice',
    name: '听音选字',
    type: '听力类',
    desc: '听语音选择对应汉字',
    status: 'placeholder',
  },
]
