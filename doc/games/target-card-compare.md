---
gameId: target-card-compare
gameName: 目标卡片挑战-使用GASP 动画库
status: ready
sourceCode: src/games/target-card-compare-compare/
lastUpdated: 2026-06-03
---

# 目标卡片挑战（GSAP 版）

## 一、游戏定位

- **游戏类型**：识字类、选择题（与无动画版玩法相同）
- **面向用户**：儿童、低龄学习用户、组内试玩人员
- **核心训练目标**：汉字识别；本版本额外展示 GSAP 动效接入方式
- **适合场景**：儿童教育产品趣味练习；组内 GSAP 动效对比实验

> 本游戏与 `target-card` 玩法完全一致，区别在于使用 GSAP 实现入场、答题反馈和结算动画，并支持 `prefers-reduced-motion` 降级。

> **目录映射**：registry id 为 `target-card-compare`，代码目录为 `src/games/target-card-compare-compare/`。

---

## 二、核心玩法规则

与 [target-card.md](./target-card.md) 相同：

1. 根据 `prompt` 从 6 个选项中找出目标汉字。
2. 点击后立即判定，不可改选。
3. 5 题线性作答，最后查看结果统计。
4. 支持重新开始。

---

## 三、游戏流程

### 1. 初始化阶段

- 挂载时创建 `gsap.context`，调用 `animateQuestionEnter()` 播放入场动画。
- 题库、判题逻辑与无动画版相同（`data.ts` / `logic.ts` 内容一致）。

### 2. 游戏进行阶段

- 选题后 `nextTick` 触发 `animateAnswerFeedback()`：选中项 scale 脉冲，反馈区与下一题按钮淡入。
- 切题后再次 `animateQuestionEnter()`。
- `reducedMotion === true` 时跳过所有 GSAP，功能仍正常。

### 3. 结算阶段

- 最后一题进入结果 → `animateResultEnter()` 结果区淡入上移。
- 重启时重置 GSAP 相关 DOM 并重新播放入场。

---

## 四、交互状态说明

| 状态 | 代码变量 | 触发时机 | 页面表现 | 后续行为 |
| ---- | -------- | -------- | -------- | -------- |
| 进行中 | `!isFinished` | 加载/重启 | 题干+选项（含入场动画） | 等待选择 |
| 已作答 | `hasAnswered` | 点击选项 | 对错样式 + GSAP 反馈 | 下一题按钮入场 |
| 游戏完成 | `isFinished` | 查看结果 | 结算区 GSAP 淡入 | 可重启 |
| 减少动效 | `reducedMotion` | 系统偏好 | 跳过 GSAP | 功能不变 |

---

## 五、计分与奖励规则

与无动画版相同：无分数，仅统计 `correctCount` / `wrongCount` / `total=5`。

---

## 六、音效设计说明

| 音效名称 | 文件路径 | 触发时机 | 作用 | 备注 |
| -------- | -------- | -------- | ---- | ---- |
| 答对音效 | `src/assets/audio/click-success.mp3` | 选对时 | 正向反馈 | 同无动画版 |
| 答错音效 | `src/assets/audio/click-wrong.mp3` | 选错时 | 错误提示 | 同无动画版 |
| 完成音效 | `src/assets/audio/finish-success.mp3` | 进入结算 | 通关庆祝 | 同无动画版 |

---

## 七、动效设计说明

| 动效名称 | 触发时机 | 实现方式 | 页面表现 | 备注 |
| -------- | -------- | -------- | -------- | ---- |
| 题目入场 | 挂载/切题/重启 | GSAP | prompt 淡入上移；选项 scale stagger | `back.out(1.4)` |
| 答题反馈 | 选题后 | GSAP | 对：scale 1.08；错：scale 0.95；feedback/next 淡入 | yoyo×1 |
| 结算入场 | 进入结果页 | GSAP | result 淡入上移 0.45s | `power2.out` |
| 选项 hover | 悬停 | CSS | 边框/背景变化 | 无 transition（与无动画版不同） |

依赖：`import { gsap } from 'gsap'`；`gsap.context` + `onUnmounted revert()`。

---

## 八、视觉样式说明

### 当前视觉特征

- 与无动画版色值、布局基本一致（class 前缀 `target-card-compare__`）。
- 标题 `#1e40af`，3×2 选项网格，pill 按钮。

### 可优化建议

- `logic.ts` / `data.ts` 与无动画版重复，可抽公共模块。
- 可增加 `explanation` 或 TTS 增强识字体验。

---

## 九、数据结构说明

与 `target-card` 完全相同：

| 类型 | 主要字段 |
| ---- | -------- |
| `TargetCardQuestion` | `id`, `prompt`, `target`, `options` |
| `AnswerRecord` | `questionId`, `selectedAnswer`, `correctAnswer`, `isCorrect`, `answeredAt` |
| `GameResult` | `total`, `correctCount`, `wrongCount`, `answerRecords` |

---

## 十、关键代码逻辑说明

| 函数名 | 作用 | 触发时机 |
| ------ | ---- | -------- |
| `animateQuestionEnter` | 题干/选项入场 | 挂载、切题、重启 |
| `animateAnswerFeedback` | 答题动效 | 选题后 |
| `animateResultEnter` | 结算入场 | 最后一题完成 |
| `checkAnswer` 等 | 同无动画版 | — |

---

## 十一、可复用能力总结

| 可复用模块 | 复用价值 | 适用场景 |
| ---------- | -------- | -------- |
| GSAP 入场/反馈/结算三件套 | 选择题通用动效模式 | 所有线性闯关题型 |
| `gsap.context` 生命周期 | 组件卸载安全清理 | Vue/React GSAP 项目 |
| `prefers-reduced-motion` 降级 | 无障碍友好 | 所有 GSAP 小游戏 |

---

## 十二、接入其他项目时需要注意

- 需安装 `gsap` 依赖。
- 迁移组件 + logic/data/types + 3 个 mp3。
- 代码路径：`src/games/target-card-compare-compare/`，registry id：`target-card-compare`。
- reduced motion 仅禁用 GSAP，CSS hover 仍有效。

---

## 十三、待补充事项

- 与无动画版相同的业务缺口（无分数、无 TTS、无选项洗牌等）
- 两套 `data.ts` / `logic.ts` 重复维护
- registry id 与目录名不一致，文档/接入时需注意映射

---

## 十四、最终总结

> 该游戏是「目标卡片挑战」的 GSAP 动效版本，玩法与无动画版一致，额外提供入场、反馈和结算动画，并支持减少动效降级。适合作为组内 GSAP 接入参考和 A/B 对比。后续可合并重复代码、补充 TTS 与更丰富的结算展示。
