# 小游戏玩法文档

本目录存放**小游戏玩法原型文档**，用于团队内部复用与其他项目参考。

文档内容侧重：玩法规则、交互流程、音效使用、动效设计、视觉样式、数据结构和可复用点。  
**不是**项目 README，也**不是**纯 API 技术文档。

## 目录结构

```
doc/
├── README.md                              # 本说明
├── templates/
│   └── game-prototype-template.md         # 空模板（14 节骨架）
└── games/
    ├── README.md                          # 游戏文档索引
    └── {gameId}.md                        # 各游戏玩法文档
```

## 命名规则

| 规则 | 说明 |
|------|------|
| 文件名 | 与 `src/games/registry.ts` 中 `gameRegistry[].id` 完全一致 |
| 存放路径 | `doc/games/{id}.md` |
| 代码目录 | `src/games/{id}/`（文档与代码 id 一一对应） |

## 如何生成文档

1. 使用 Skill：`.agents/skills/game-prototype-doc-skill/SKILL.md`
2. 分析目标游戏源码：`src/games/{id}/`（组件、data、logic、types、音效等）
3. 复制模板：`doc/templates/game-prototype-template.md`
4. 按 Skill 定义的 14 节结构填写，基于真实代码，不确定处标记「待补充」
5. 写入 `doc/games/{id}.md`
6. 更新 `doc/games/README.md` 中对应行的文档状态

## 文档索引

详见 [games/README.md](./games/README.md)。
