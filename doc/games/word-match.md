---
gameId: word-match
gameName: 词语搭配挑战
status: ready
sourceCode: src/games/word-match/
lastUpdated: 2026-06-03
---

# 词语搭配挑战

## 一、游戏定位

- **游戏类型**：语言类、词语搭配选择题
- **面向用户**：儿童、低龄学习用户
- **核心训练目标**：词语理解、语义搭配、语言表达
- **适合场景**：识字/语言类小程序、H5 趣味练习

> 本游戏展示一个目标词，用户从 4 个描述词中选出最匹配的搭配，共 5 题线性闯关，含 GSAP 动效与音效反馈。

---

## 二、核心玩法规则

1. 展示第 N/5 题、目标词大卡片、搭配提示 `prompt` 和 4 个选项（2×2 网格）。
2. 用户点击一个选项 → 立即判定对错，选项禁用。
3. 答对显示「答对啦！{resultPhrase}」，答错显示「再想想看」+ 正确答案提示。
4. 显示「下一题」或最后一题「查看结果」。
5. 5 题完成后展示答对/答错统计，可重新开始。

---

## 三、游戏流程

### 1. 初始化阶段

- `onMounted` 创建 `gsap.context`，播放 `animateQuestionEnter()`。
- 静态题库 5 题：`src/games/word-match/data.ts`。
- 干扰项为语义相近但对象不匹配的选项。

### 2. 游戏进行阶段

- `handleSelect` → 记录、反馈、音效、`animateAnswerFeedback()`。
- `handleNext` → 切题并重播入场动画。
- `hasAnswered` 锁定，不可改选。

### 3. 结算阶段

- `isFinished = true` → 完成音效 + `animateResultEnter()`。
- 展示 total / correctCount / wrongCount。

---

## 四、交互状态说明

| 状态 | 代码变量 | 触发时机 | 页面表现 | 后续行为 |
| ---- | -------- | -------- | -------- | -------- |
| 进行中 | `!isFinished` | 加载/重启 | 目标词+选项 | 等待选择 |
| 已作答 | `hasAnswered` | 点击选项 | 对错样式+反馈 | 下一题按钮 |
| 游戏完成 | `isFinished` | 查看结果 | 结算区 | 可重启 |
| 减少动效 | `reducedMotion` | 系统偏好 | 跳过 GSAP | 功能正常 |

---

## 五、计分与奖励规则

- 无运行时分数，仅统计答对/答错。
- 判定：`selectedOption === correctOption`。
- `total` 固定 5；无连击、用时、星级。

---

## 六、音效设计说明

| 音效名称 | 文件路径 | 触发时机 | 作用 | 备注 |
| -------- | -------- | -------- | ---- | ---- |
| 答对音效 | `src/assets/audio/click-success.mp3` | 选对时 | 正向反馈 | — |
| 答错音效 | `src/assets/audio/click-wrong.mp3` | 选错时 | 错误提示 | — |
| 完成音效 | `src/assets/audio/finish-success.mp3` | 进入结算 | 通关庆祝 | — |

---

## 七、动效设计说明

| 动效名称 | 触发时机 | 实现方式 | 页面表现 | 备注 |
| -------- | -------- | -------- | -------- | ---- |
| 题目入场 | 挂载/切题/重启 | GSAP | 目标卡 scale；prompt 上移淡入；选项 stagger | `back.out` |
| 答题反馈 | 选题后 | GSAP | 对 scale 1.06；错 0.96；feedback/next 淡入 | yoyo |
| 结算入场 | 完成 | GSAP | 结果区 y 淡入 | 0.45s |

---

## 八、视觉样式说明

### 当前视觉特征

- 紫色主题：`#7c3aed`、`#8b5cf6`。
- 目标词 36px 粗体，渐变紫底卡片。
- 2 列选项网格 max-width 320px。
- 对错：绿 `#22c55e` / 红 `#ef4444`。
- pill 形主按钮。

### 可优化建议

- 数据中已有 `explanation` 字段但 UI 未展示，可补充解析说明。
- 可增加 TTS 朗读目标词。

---

## 九、数据结构说明

| 数据字段 | 类型 | 含义 | 示例 |
| -------- | ---- | ---- | ---- |
| `targetWord` | string | 待搭配的目标词 | `太阳` |
| `prompt` | string | 搭配提示 | `什么会发光？` |
| `options` | string[4] | 四个选项 | — |
| `correctOption` | string | 正确答案 | `明亮` |
| `resultPhrase` | string | 答对后展示句 | `太阳明亮！` |
| `explanation` | string? | 解析（未用） | 待补充 UI |

5 题固定 mock 数据。

---

## 十、关键代码逻辑说明

| 函数名 | 作用 | 触发时机 |
| ------ | ---- | -------- |
| `checkAnswer` | 选项相等判对错 | 作答 |
| `createAnswerRecord` | 构建记录 | 作答 |
| `calculateGameResult` | 聚合统计 | 结算 |
| `buildFeedback` | 组装反馈文案 | 作答 |
| `handleSelect` / `handleNext` / `handleRestart` | 交互主流程 | 用户操作 |
| `animateQuestionEnter` 等 | GSAP 动效 | 各阶段 |

---

## 十一、可复用能力总结

| 可复用模块 | 复用价值 | 适用场景 |
| ---------- | -------- | -------- |
| 线性 5 题闯关模式 | 与 target-card 结构类似 | 各类选择题 |
| GSAP 入场/反馈/结算 | 通用动效模板 | 语言/识字类 |
| 干扰项设计思路 | 语义相近但不匹配 | 语言理解题 |

---

## 十二、接入其他项目时需要注意

- 需 `gsap` 依赖 + 3 个 mp3。
- 替换 `data.ts` 题库即可换题。
- `explanation` 字段已预留，接入时可一并展示。

---

## 十三、待补充事项

- `explanation` 未在 UI 展示
- 无计时、无分数、无 TTS
- 答错不可重选
- `difficulty` 等元数据未使用
- 无埋点、无持久化

---

## 十四、最终总结

> 该小游戏是词语搭配选择题，用户为目标词选择最合适的描述词，共 5 题。当前版本具备 GSAP 动效、音效反馈和结果统计，干扰项设计注重语义辨析。后续可展示 `explanation`、增加 TTS 和更丰富的结算信息。
