<p align="center">
  <img src="https://typorabucket0308.oss-cn-beijing.aliyuncs.com/images/20260603103934962.jpg" alt="项目预览图" width="800" />
</p>

<h1 align="center">mini-game-playground</h1>
<p align="center">
  面向儿童识字与语言学习的 Vue 3 小游戏试玩平台，支持多款小游戏接入与 GSAP 动效对比实验。
</p>

## 项目简介

`mini-game-playground` 是一个基于 **Vue 3 + Vite + TypeScript** 的前端 Web 项目，用于组内试玩与演示儿童向小游戏。

平台采用「左侧游戏列表 + 右侧试玩区」布局：在 `games/registry.ts` 中注册游戏元信息，通过 `GamePreviewPanel` 按 `gameId` 渲染对应玩法组件。题目与判题逻辑拆分为 `types` / `data` / `logic` / 组件，便于后续扩展与维护。

当前已接入 4 款可玩小游戏，并预留古诗词九宫格、听音选字等占位入口。

## 功能特性

- 左侧游戏列表切换，右侧实时预览试玩
- 游戏注册表统一管理名称、类型、描述与接入状态（`ready` / `todo` / `placeholder`）
- **目标卡片挑战**：根据提示从 6 张卡片中找出目标汉字（普通版 / GSAP 动效版对比）
- **词语搭配挑战**：为目标词选择最合适的描述词，支持作答反馈与结果统计
- **文字躲猫猫**：先记忆 6 个汉字，再找出「躲起来」的那个；含分阶段流程与 GSAP 动效，支持背景音乐开关
- 多款小游戏接入点击正确 / 错误 / 完成挑战音效
- 本地 mock 题目数据，无需后端
- 构建产物可部署为静态站点（Vite `base` 配置为 `/minigames/`）

## 技术栈

- Vue 3（Composition API + `<script setup>`）
- TypeScript
- Vite 6
- GSAP 3（部分小游戏动效）
- 原生 CSS（无大型 UI 库）

## 已接入小游戏

| ID | 名称 | 类型 | 状态 |
| --- | --- | --- | --- |
| `target-card` | 目标卡片挑战（未使用动画库） | 识字类 | 已接入 |
| `target-card-compare` | 目标卡片挑战（GSAP 版） | 识字类 | 已接入 |
| `word-match` | 词语搭配挑战 | 语言类 | 已接入 |
| `hide-word` | 文字躲猫猫 | 记忆类 | 已接入 |
| `poem-grid` | 古诗词九宫格 | 诗词类 | 待开发 |
| `listen-choice` | 听音选字 | 听力类 | 占位 |

## 目录结构

```text
mini-game-playground/
├── src/
│   ├── assets/
│   │   └── audio/              # 音效与背景音乐
│   ├── components/
│   │   ├── GameSidebar.vue     # 左侧游戏列表
│   │   ├── GamePreviewPanel.vue
│   │   └── EmptyGamePlaceholder.vue
│   ├── games/
│   │   ├── registry.ts         # 游戏注册表
│   │   ├── target-card/        # 目标卡片挑战（普通版）
│   │   ├── target-card-compare-compare/  # 目标卡片挑战（GSAP 版）
│   │   ├── word-match/         # 词语搭配挑战
│   │   ├── hide-word/          # 文字躲猫猫
│   │   └── poem-grid/          # 古诗词九宫格（待完善）
│   ├── pages/
│   │   └── Playground.vue      # 主页面
│   ├── App.vue
│   ├── main.ts
│   ├── style.css
│   └── env.d.ts
├── index.html
├── vite.config.ts
├── package.json
└── tsconfig.json
```

每个小游戏目录通常包含：

- `types.ts`：类型定义
- `data.ts`：本地 mock 题目
- `logic.ts`：判题与结果计算
- `*.vue`：UI 与交互

## 本地运行

项目使用 **npm**（存在 `package-lock.json`）。

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建项目：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

## 环境变量

当前项目未提供 `.env` / `.env.example`，运行不依赖环境变量配置。

## 部署说明

构建后会生成静态资源，可部署到 Nginx、对象存储或任意静态资源服务器。

```bash
npm run build
```

构建产物目录：

```text
dist/
```

`vite.config.ts` 中配置了 `base: '/minigames/'`，部署时需保证站点路径与 `base` 一致，或在部署前按实际路径调整该配置。

## 新增小游戏（简要）

1. 在 `src/games/<game-id>/` 下新增 `types.ts`、`data.ts`、`logic.ts` 与 Vue 组件
2. 在 `src/games/registry.ts` 的 `gameRegistry` 中注册元信息
3. 在 `src/components/GamePreviewPanel.vue` 中按 `game.id` 挂载对应组件

## 后续计划

- 接入古诗词九宫格（`poem-grid`）
- 接入听音选字（`listen-choice`）
- 统一音效与背景音乐接入方式（可选抽公共 composable）
- 补充项目封面图至 `docs/images/readme-cover.png`（可选）
- 补充部署与环境说明文档

## License

待补充
