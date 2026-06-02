<template>
  <article class="preview-panel">
    <header class="preview-header">
      <div>
        <div class="preview-header__meta">
          <span class="type-pill">{{ game.type }}</span>
          <span class="status-pill" :class="`status-pill--${game.status}`">
            {{ statusTextMap[game.status] }}
          </span>
        </div>
        <h2>{{ game.name }}</h2>
        <p>{{ game.desc }}</p>
      </div>
    </header>

    <section class="game-stage" aria-label="游戏试玩区域">
      <TargetCard v-if="game.id === 'target-card'" />
      <TargetCardCompare v-else-if="game.id === 'target-card-compare'" />
      <WordMatch v-else-if="game.id === 'word-match'" />
      <HideWord v-else-if="game.id === 'hide-word'" />
      <EmptyGamePlaceholder v-else :game-id="game.id" />
    </section>

    <footer class="preview-footer">
      后续可在 games 目录中逐步接入具体玩法。
    </footer>
  </article>
</template>

<script setup lang="ts">
import EmptyGamePlaceholder from './EmptyGamePlaceholder.vue'
import TargetCard from '../games/target-card/TargetCard.vue'
import TargetCardCompare from '../games/target-card-compare-compare/TargetCardCompare.vue'
import WordMatch from '../games/word-match/WordMatch.vue'
import HideWord from '../games/hide-word/HideWord.vue'
import type { GameMeta } from '../games/registry'
import { statusTextMap } from '../games/registry'

defineProps<{
  game: GameMeta
}>()
</script>

<style scoped>
.preview-panel {
  display: grid;
  gap: 20px;
  height: 100%;
}

.preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.preview-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.preview-header h2 {
  margin: 0;
  color: #111827;
  font-size: 30px;
  line-height: 1.25;
}

.preview-header p {
  max-width: 720px;
  margin: 10px 0 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.7;
}

.type-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  line-height: 1.3;
}

.type-pill {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-pill--ready {
  background: #dcfce7;
  color: #166534;
}

.status-pill--todo {
  background: #fef3c7;
  color: #92400e;
}

.status-pill--placeholder {
  background: #e2e8f0;
  color: #475569;
}

.game-stage {
  min-height: 480px;
  padding: 24px;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 16px 36px rgb(15 23 42 / 0.06);
}

.preview-footer {
  color: #64748b;
  font-size: 14px;
}

@media (max-width: 760px) {
  .preview-header h2 {
    font-size: 24px;
  }

  .game-stage {
    min-height: 360px;
    padding: 16px;
  }
}
</style>
