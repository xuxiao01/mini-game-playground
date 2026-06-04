---
gameId: flip-card
gameName: 翻翻卡记忆挑战
status: ready
sourceCode: src/games/flip-card/
lastUpdated: 2026-06-03
---

# 翻翻卡记忆挑战

## 一、游戏定位

- **游戏类型**：记忆类、配对类
- **面向用户**：儿童、低龄学习用户
- **核心训练目标**：短时记忆、汉字识别、观察配对
- **适合场景**：识字小程序、记忆训练 H5、翻牌配对活动

> 本游戏是 3×4 宫格翻牌记忆挑战：6 组汉字各 2 张，用户翻开卡片找到相同文字配对。含起手洗牌/发牌 GSAP 动效、Web Speech 朗读和多种音效。

---

## 二、核心玩法规则

1. 开局 12 张牌（6 对汉字）洗牌后发牌落位；发牌期间不可点击。
2. 用户点击未匹配、未翻开的牌 → 翻牌展示汉字。
3. 连续翻开 2 张：
   - **相同**（`pairId` 一致）：保持正面，+10 分，TTS 朗读该字，轻微缩放反馈。
   - **不同**：等待 700ms → 错误音效 + 横抖 → 翻回背面。
4. 全部 6 对匹配成功 → 游戏结束，展示得分。
5. 支持重新开始，重播洗牌/发牌动画。

---

## 三、游戏流程

### 1. 初始化阶段

- `resetGame()` → `createFlipCards(flipCardWords)`：6 词 × 2 = 12 张，`shuffleCards` 打乱。
- `animateCardsEnter()`：牌堆聚中 → 播放 shufflecard → 7 步轻晃（约 0.914s）→ 随机 stagger 发牌落位。
- `isEntering = true` 期间禁点。

### 2. 游戏进行阶段

- 点击 → `flipcard.mp3` → `flipOpen`（rotateY 180）。
- 选满 2 张 → `isChecking = true` → 判定匹配/不匹配。
- 匹配成功：`speak(word)`（rate 0.65，delay 450ms）；最后一对需等 TTS 结束再进结算。
- 不匹配：`wrongnn.mp3` + 横抖 + `flipClose`。

### 3. 结算阶段

- `matchedCount === 6` → `isFinished = true` → `finish-success.mp3` → 结果页 GSAP 淡入。
- 展示「挑战完成！」和 `score`；可重新开始。

---

## 四、交互状态说明

| 状态 | 代码变量 | 触发时机 | 页面表现 | 后续行为 |
| ---- | -------- | -------- | -------- | -------- |
| 发牌中 | `isEntering` | 开局/重启 | 洗牌+发牌动画 | 动画结束可点 |
| 进行中 | `!isFinished` | 发牌后 | 3×4 宫格背面 | 等待翻牌 |
| 已翻开 | `isFlipped` | 点击单牌 | 正面展示汉字 | 等待第二张 |
| 已匹配 | `isMatched` | 配对成功 | 绿边绿底，保持正面 | 不可再点 |
| 判定中 | `isChecking` | 翻开 2 张后 | 锁定点击 | 判定完成后解锁 |
| 游戏完成 | `isFinished` | 6 对全匹配 | 结算页 | 可重启 |

`canClickCard` 综合判断：未匹配、未 checking、未 entering、selected 未满等。

---

## 五、计分与奖励规则

- 每配对成功：**+10 分**。
- `logic.getMaxScore(pairCount)` 返回 `pairCount * 10`（满分 60），**UI 未展示满分**。
- 错误不匹配不扣分。
- 结算页仅显示 `score`，无翻牌次数、错误次数、用时。

---

## 六、音效设计说明

| 音效名称 | 文件路径 | 触发时机 | 作用 | 备注 |
| -------- | -------- | -------- | ---- | ---- |
| 翻牌音效 | `src/assets/audio/flipcard.mp3` | 每次点击翻牌 | 翻转反馈 | — |
| 洗牌音效 | `src/assets/audio/shufflecard.mp3` | 开局/重启洗牌段 | 洗牌氛围 | 时长约 0.914s，与动画对齐 |
| 不匹配音效 | `src/assets/audio/wrongnn.mp3` | 两张不配时 | 轻柔错误提示 | 与横抖同步 |
| 完成音效 | `src/assets/audio/finish-success.mp3` | 全部配对完成 | 通关庆祝 | — |

**TTS**（非 mp3）：`useSpeech` composable，`lang: zh-CN`，配对成功朗读汉字。

未使用 `click-success.mp3` / `click-wrong.mp3`。

---

## 七、动效设计说明

| 动效名称 | 触发时机 | 实现方式 | 页面表现 | 备注 |
| -------- | -------- | -------- | -------- | ---- |
| 洗牌+发牌 | 开局/重启 | GSAP timeline | 聚堆→轻晃 7 步→随机 stagger 落位 | `SHUFFLE_SFX_DURATION=0.914` |
| 卡牌翻转 | 点击翻牌 | GSAP rotateY | 3D 翻转到正面 | `back.out(1.2)` 0.45s |
| 翻回 | 不匹配 | GSAP rotateY | 回到背面 | 0.38s |
| 匹配成功 | 配对成功 | GSAP scale | 1.08 脉冲 yoyo | — |
| 匹配失败 | 不配 | GSAP x | 横抖 repeat 3 | 与 wrongnn 同步 |
| 结算入场 | 完成 | GSAP 淡入 | 结果区 | — |

CSS：`perspective: 1000px`；背面蓝渐变 `?`；正面白底大字；`--matched` 绿样式。

---

## 八、视觉样式说明

### 当前视觉特征

- 浅蓝渐变背景容器。
- 4×3 响应式 grid；480px 以下缩小字号/gap。
- 卡片圆角、阴影；背面 `?` 符号。
- 匹配成功绿边绿底。

### 可优化建议

- 结算页可展示满分（60）和错误次数。
- 可增加配对成功专用音效（目前仅 TTS）。
- 全部配对后可加庆祝动画。

---

## 九、数据结构说明

| 数据字段 | 类型 | 含义 | 示例 |
| -------- | ---- | ---- | ---- |
| `FlipCardWordItem.id` | string | 词组 ID | `spring` |
| `FlipCardWordItem.word` | string | 汉字 | `春` |
| `FlipCardItem.pairId` | string | 配对分组 | `spring` |
| `FlipCardItem.isFlipped` | boolean | 是否翻开 | `true` |
| `FlipCardItem.isMatched` | boolean | 是否已匹配 | `false` |
| `score` | number | 当前得分 | `30` |
| `matchedCount` | number | 已配对对数 | `3` |

词表 6 组：春/花/月/山/水/木。

---

## 十、关键代码逻辑说明

| 函数名 | 作用 | 触发时机 |
| ------ | ---- | -------- |
| `createFlipCards` | 每词 2 张 + 洗牌 | resetGame |
| `shuffleCards` | Fisher-Yates 洗牌 | createFlipCards |
| `isMatchedPair` | pairId 相等判定 | checkSelectedCards |
| `canClickCard` | 点击权限 | 每次点击前 |
| `handleCardClick` | 翻牌主流程 | 用户点击 |
| `checkSelectedCards` | 2 张判定+反馈 | 选满 2 张 |
| `animateCardsEnter` | 洗牌发牌 | 挂载/重启 |
| `speak` / `cancelSpeech` | TTS 朗读/取消 | 配对成功/重置 |

---

## 十一、可复用能力总结

| 可复用模块 | 复用价值 | 适用场景 |
| ---------- | -------- | -------- |
| 3D 翻牌组件 | 记忆卡/词语卡/图片卡 | 所有配对类游戏 |
| `createFlipCards` + 洗牌 | 配对数据生成 | 翻牌、连连看 |
| `useSpeech` composable | 中文 TTS 封装 | 识字类反馈 |
| 洗牌+发牌 timeline | 开局仪式感 | 卡牌类游戏 |
| `canClickCard` 防连点 | 状态锁模式 | 异步判定场景 |

---

## 十二、接入其他项目时需要注意

- 需 `gsap` 依赖 + 4 个 mp3 + `useSpeech.ts`。
- TTS 依赖浏览器 `speechSynthesis`，需处理不支持的情况（当前静默 resolve）。
- 词表固定 6 对，扩展需改 `data.ts` 和 grid 布局。
- 洗牌时长与 `SHUFFLE_SFX_DURATION` 常量绑定，换音效需同步调整。
- 移动端 480px 已有响应式样式。

---

## 十三、待补充事项

- `getMaxScore` 未在 UI 展示
- 无配对成功 mp3（仅 TTS）
- 结果页无翻牌次数、错误次数、用时
- 无 BGM
- TTS 不支持时无 UI 提示
- 词量/难度不可配置
- 无埋点

---

## 十四、最终总结

> 该小游戏是汉字翻牌记忆配对游戏，3×4 宫格 6 对卡片，核心玩法是翻开找相同字。当前版本已具备洗牌发牌开场、3D 翻牌、配对判定、计分、TTS 朗读和多种音效，完成度较高。后续可补充满分展示、配对成功音效、错误统计和难度配置，以便更好复用到其他教育产品。
