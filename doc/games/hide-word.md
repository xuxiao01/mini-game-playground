---
gameId: hide-word
gameName: 文字躲猫猫
status: ready
sourceCode: src/games/hide-word/
lastUpdated: 2026-06-03
---

# 文字躲猫猫

## 一、游戏定位

- **游戏类型**：记忆类、观察类选择题
- **面向用户**：儿童、低龄学习用户
- **核心训练目标**：短时记忆、汉字识别、观察力
- **适合场景**：识字小程序、记忆训练 H5 活动

> 本游戏先让用户记忆 6 个汉字，随后其中一个「躲起来」（留空位），用户从 4 个选项中找出消失的字。含多阶段 GSAP 动效与背景音乐。

---

## 二、核心玩法规则

1. **记忆阶段（5 秒）**：展示 6 个汉字，倒计时 5→1；前 2 题顺序固定，第 3 题起打乱顺序。
2. **隐藏阶段**：字卡淡出隐藏。
3. **揭示阶段**：在隐藏字原位留空槽（虚线框），其余字重排展示。
4. **作答阶段**：显示「谁躲起来了？」和 4 个选项，用户点选。
5. **反馈阶段**：判定对错、音效、选项样式、反馈文案；点「下一题」进入下一轮。
6. 5 题完成后进入结算，可重新开始。

---

## 三、游戏流程

### 1. 初始化阶段

- `startRound()` 重置 phase 为 `memorize`，初始化 6 字网格。
- 前 2 题：`words.slice()` 保持原序；第 3 题起 `shuffle(words)`。
- `memorizeCountdown = 5`，每秒递减；5 秒后自动进入 hiding。

### 2. 游戏进行阶段

- `memorize` → `hiding`（GSAP 淡出）→ `reveal`（`buildRevealSlots` 留空位）→ `answering` → `feedback`。
- `memorize` / `hiding` 阶段不显示 prompt 和选项。
- 答错/答对后进入 `feedback`，不可改选。

### 3. 结算阶段

- 最后一题 → `phase = 'finished'`，播放完成音效，展示统计。
- 「重新开始」调用 `handleRestart` → `startRound()`。

---

## 四、交互状态说明

| 状态 | phase 值 | 触发时机 | 页面表现 | 后续行为 |
| ---- | -------- | -------- | -------- | -------- |
| 记忆 | `memorize` | 每轮开始 | 6 字网格 + 倒计时 | 5 秒后隐藏 |
| 隐藏 | `hiding` | 倒计时结束 | 字卡淡出 | 进入 reveal |
| 揭示 | `reveal` | 隐藏完成 | 空槽 + 剩余字 | 显示选项 |
| 作答 | `answering` | reveal 动画后 | prompt + 4 选项 | 等待点选 |
| 反馈 | `feedback` | 点选后 | 对错样式+文案 | 下一题 |
| 完成 | `finished` | 第 5 题结束 | 结算页 | 可重启 |

---

## 五、计分与奖励规则

- 无运行时分数，统计 `correctCount` / `wrongCount` / `total=5`。
- 判定：`selectedAnswer === hiddenWord`。
- 无连击、用时奖励。

---

## 六、音效设计说明

| 音效名称 | 文件路径 | 触发时机 | 作用 | 备注 |
| -------- | -------- | -------- | ---- | ---- |
| 答对音效 | `src/assets/audio/click-success.mp3` | 选对时 | 正向反馈 | — |
| 答错音效 | `src/assets/audio/click-wrong.mp3` | 选错时 | 错误提示 | — |
| 完成音效 | `src/assets/audio/finish-success.mp3` | 进入 finished | 通关庆祝 | — |
| 背景音乐 | `src/assets/audio/cute-bgm-web.mp3` | 挂载后循环 | 氛围 BGM | volume 0.35；右上角开关 |

BGM：`loop: true`；`onMounted` 尝试播放；首次 `pointerdown` 解锁；`toggleBgm` 开关；卸载时 `stopBgm`。

---

## 七、动效设计说明

| 动效名称 | 触发时机 | 实现方式 | 页面表现 | 备注 |
| -------- | -------- | -------- | -------- | ---- |
| 字卡入场 | memorize 开始 | GSAP stagger | y/scale 淡入 | — |
| 字卡隐藏 | hiding | GSAP 淡出 | autoAlpha 降低 | Promise 驱动 |
| 揭示入场 | reveal | GSAP stagger | 空槽+字重排 | — |
| 选项入场 | answering | GSAP 淡入 | 4 选项出现 | — |
| 答对反馈 | 选对 | GSAP scale 1.08 | 选项脉冲 | — |
| 答错反馈 | 选错 | GSAP x 抖动 | 横摇 repeat 5 | — |
| 结算入场 | finished | GSAP 淡入 | 结果区 | — |

`reducedMotion` 时跳过 GSAP，但 phase 切换逻辑仍执行。

---

## 八、视觉样式说明

### 当前视觉特征

- 蓝色主题：`#0f4c81`、`#3b82f6`。
- 记忆区浅蓝底 `#f0f7ff`，3×2 字网格。
- 空槽 `--empty`：虚线边框、半透明。
- 单字 28px 粗体；选项 22px。
- 右上角 BGM 开关按钮绝对定位。

### 可优化建议

- `difficulty` 字段已定义但未使用，可按难度调整记忆时长或字数。
- 可增加 TTS 朗读记忆阶段的字。

---

## 九、数据结构说明

| 数据字段 | 类型 | 含义 | 示例 |
| -------- | ---- | ---- | ---- |
| `HideWordQuestion.words` | string[6] | 本轮 6 字 | `['春','夏',...]` |
| `HideWordQuestion.hiddenWord` | string | 躲起来的字 | `春` |
| `HideWordQuestion.options` | string[4] | 四选一 | — |
| `visibleWords` | (string\|null)[] | 网格展示（含空槽） | — |
| `GamePhase` | enum | 6 态 phase | `memorize` 等 |

`buildRevealSlots`：在 `hiddenWord` 原位留 `null`，其余字可选 shuffle 重排。

---

## 十、关键代码逻辑说明

| 函数名 | 作用 | 触发时机 |
| ------ | ---- | -------- |
| `shuffle` | Fisher-Yates 洗牌 | 第 3 题起记忆阶段 |
| `buildRevealSlots` | 构建含空槽的 6 格 | reveal 阶段 |
| `startRound` | 开启一轮（memorize） | 挂载/切题/重启 |
| `runHidingAndReveal` | hiding → reveal 链 | 倒计时结束 |
| `handleSelect` / `handleNext` | 作答与切题 | 用户操作 |
| `toggleBgm` / `stopBgm` | BGM 控制 | 开关/卸载 |

---

## 十一、可复用能力总结

| 可复用模块 | 复用价值 | 适用场景 |
| ---------- | -------- | -------- |
| 多 phase 状态机 | 分阶段小游戏模板 | 记忆/闯关类 |
| `buildRevealSlots` | 空位揭示逻辑 | 躲猫猫、找不同 |
| BGM 开关模式 | 儿童向 BGM 管理 | 所有小游戏 |
| 定时器清理 `clearAllTimers` | 多 setTimeout 安全 | 分阶段流程 |

---

## 十二、接入其他项目时需要注意

- 需 `gsap` + 4 个 mp3（含 BGM）。
- 记忆时长硬编码 5 秒，接入时可配置化。
- 前 2 题不打乱是教学向设计，可按业务调整。
- 多 phase + 定时器，卸载时必须清理（已实现 `onUnmounted`）。

---

## 十三、待补充事项

- `difficulty` 未生效
- 记忆时长不可配置
- 无 TTS
- 结算页无逐题明细
- 答错不可重选
- 无埋点

---

## 十四、最终总结

> 该小游戏是「文字躲猫猫」记忆选择题，用户先记忆 6 字再找出消失的那个，共 5 题。当前版本具备完整多阶段流程、GSAP 动效、BGM 和音效反馈，前两题降低难度（顺序固定）。后续可配置记忆时长、启用 difficulty、增加 TTS 和更丰富的结算展示。
