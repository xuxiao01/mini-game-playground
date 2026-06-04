---
gameId: target-card
gameName: 目标卡片挑战-未使用动画库
status: ready
sourceCode: src/games/target-card/
lastUpdated: 2026-06-03
---

# 目标卡片挑战

## 一、游戏定位

- **游戏类型**：识字类、选择题
- **面向用户**：儿童、低龄学习用户、组内试玩人员
- **核心训练目标**：汉字识别、阅读理解（根据提示找出目标字）
- **适合场景**：儿童教育小程序、识字 App、H5 活动页中的趣味练习模块

> 本游戏是一个识字选择题小游戏，用户根据文字提示从 6 张卡片中找出目标汉字。当前版本未使用 GSAP，仅依赖 CSS 过渡反馈，适合作为「无动画库」基线实现与其他版本对比。

---

## 二、核心玩法规则

1. 页面展示当前题进度（第 N/5 题）、题干 `prompt` 和 6 个汉字选项（3×2 网格）。
2. 用户点击一个选项后，系统立即判定对错，选项按钮禁用，不可改选。
3. 答对显示「答对啦！」，答错显示「再试试看」，并分别播放成功/错误音效。
4. 已答后显示「下一题」按钮；最后一题显示「查看结果」。
5. 全部 5 题完成后进入结算页，展示总题数、答对数、答错数。
6. 结算页可点击「重新开始」，重置全部状态从头作答。

---

## 三、游戏流程

### 1. 初始化阶段

- 组件挂载后 `currentIndex = 0`，直接进入第 1 题。
- 题库来自静态 mock：`src/games/target-card/data.ts`，共 5 题。
- 初始化 `selectedAnswer`、`hasAnswered`、`feedbackText`、`answerRecords`、`isFinished`。
- 无独立 loading 或入场动画。

### 2. 游戏进行阶段

- 用户点击选项 → `handleSelect` 记录答案、更新反馈、播放音效、禁用选项。
- 用户点击「下一题」→ `handleNext` 递增题号并重置单题状态。
- 无防连点逻辑（已答后按钮 disabled 即不可再选）。

### 3. 结算阶段

- 最后一题点「查看结果」→ `isFinished = true`，播放完成音效。
- 展示「挑战完成！」及 `correctCount` / `wrongCount` / `total`。
- 「重新开始」调用 `handleRestart` 重置所有 ref。

---

## 四、交互状态说明

| 状态 | 代码变量 | 触发时机 | 页面表现 | 后续行为 |
| ---- | -------- | -------- | -------- | -------- |
| 进行中 | `!isFinished` | 页面加载 / 重启 | 显示题干与选项 | 等待用户选择 |
| 已作答 | `hasAnswered` | 点击选项后 | 选项禁用，显示对错样式与反馈 | 显示下一题按钮 |
| 游戏完成 | `isFinished` | 最后一题查看结果 | 结算区域 | 可重新开始 |

---

## 五、计分与奖励规则

- **无运行时分数**，仅统计答对/答错数量。
- 单题判定：`selectedAnswer === target`（`checkAnswer`）。
- 结算：`correctCount` = 答对记录数；`wrongCount` = 总记录数 - 答对数；`total` 固定为 5。
- 无星级、连击、用时加权。

---

## 六、音效设计说明

| 音效名称 | 文件路径 | 触发时机 | 作用 | 备注 |
| -------- | -------- | -------- | ---- | ---- |
| 答对音效 | `src/assets/audio/click-success.mp3` | 选对选项时 | 正向反馈 | — |
| 答错音效 | `src/assets/audio/click-wrong.mp3` | 选错选项时 | 错误提示 | — |
| 完成音效 | `src/assets/audio/finish-success.mp3` | 进入结算页时 | 通关庆祝 | — |

播放方式：`new Audio()` + `playSfx()`（重置 `currentTime` 后播放）。

---

## 七、动效设计说明

| 动效名称 | 触发时机 | 实现方式 | 页面表现 | 备注 |
| -------- | -------- | -------- | -------- | ---- |
| 选项 hover | 鼠标悬停 | CSS transition 0.15s | 边框/背景色变化 | — |
| 对错样式 | 作答后 | CSS class | 绿边/红边 + 浅底色 | 无动画过渡 |

> 当前代码中**未使用 GSAP**，无入场、反馈、结算动画。

---

## 八、视觉样式说明

### 当前视觉特征

- 整体浅色布局，纵向 flex，居中标题。
- 主色 `#1e40af`（标题）、`#3b82f6`（按钮）。
- 选项：白底、12px 圆角、24px 大字、3 列网格 max-width 360px。
- 答对绿（`#22c55e`）、答错红（`#ef4444`）边框反馈。
- 按钮 pill 形（`border-radius: 999px`）。

### 可优化建议

- 可增加题干朗读（TTS）辅助识字。
- 答错后可考虑允许重试或展示正确答案。
- 可增加入场/切题过渡动画（参考 GSAP 版）。

---

## 九、数据结构说明

| 数据字段 | 类型 | 含义 | 示例 |
| -------- | ---- | ---- | ---- |
| `TargetCardQuestion.id` | string | 题目 ID | `q1` |
| `TargetCardQuestion.prompt` | string | 题干提示 | `请找出表示「春天」的字` |
| `TargetCardQuestion.target` | string | 正确答案 | `春` |
| `TargetCardQuestion.options` | string[] | 6 个选项 | `['春','夏','秋',...]` |
| `AnswerRecord.isCorrect` | boolean | 是否答对 | `true` |
| `GameResult.correctCount` | number | 答对数 | `4` |

题库 5 题：找「春」「月」「山」「花」「水」。

---

## 十、关键代码逻辑说明

| 函数名 | 文件 | 作用 | 触发时机 |
| ------ | ---- | ---- | -------- |
| `checkAnswer` | logic.ts | 字符串相等判对错 | 作答时 |
| `createAnswerRecord` | logic.ts | 构建答题记录 | 作答时 |
| `calculateGameResult` | logic.ts | 聚合统计结果 | 结算 computed |
| `handleSelect` | TargetCard.vue | 处理选项点击 | 用户点击 |
| `handleNext` | TargetCard.vue | 切题或进入结算 | 点下一题 |
| `handleRestart` | TargetCard.vue | 重置游戏 | 重新开始 |

---

## 十一、可复用能力总结

| 可复用模块 | 复用价值 | 适用场景 |
| ---------- | -------- | -------- |
| `logic.ts` 判题/统计 | 选择题通用逻辑 | 识字、听音选字等 |
| 选项 grid + 对错样式 | UI 模式可复用 | 四选一/六选一题型 |
| 音效播放模式 | 轻量 SFX 封装 | 所有小游戏 |
| `data.ts` 题库结构 | 静态 mock 模板 | 快速原型 |

---

## 十二、接入其他项目时需要注意

- 需迁移：`TargetCard.vue`、`logic.ts`、`data.ts`、`types.ts` 及 3 个 mp3 音效。
- **无 GSAP 依赖**，接入成本低。
- 题库为静态数组，接入时需替换为业务数据。
- 选项顺序固定，未洗牌；可按需增加随机化。
- 代码目录 `src/games/target-card/`，registry id 为 `target-card`。

---

## 十三、待补充事项

- 无计时、无分数制、无连击奖励
- 选项未随机打乱
- 无 TTS 朗读题干
- 答错后不能在同一题重试
- 结算页未展示逐题明细（`answerRecords` 未渲染）
- 无进度持久化、无埋点

---

## 十四、最终总结

> 该小游戏是一个无动画库的识字选择题，核心玩法是根据提示从 6 个汉字中找出正确答案，共 5 题线性闯关。当前版本已具备基础作答、音效反馈和结果统计，适合作为组内「基线实现」与其他 GSAP 版本对比。后续可补充选项洗牌、TTS、入场动效和更丰富的结算反馈。
