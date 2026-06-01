<template>
  <aside class="game-sidebar">
    <header class="sidebar-header">
      <h1>小游戏试玩平台</h1>
      <p>用于组内快速验证玩法</p>
    </header>

    <div class="game-list">
      <button
        v-for="game in games"
        :key="game.id"
        class="game-item"
        :class="{ 'game-item--active': game.id === currentGameId }"
        type="button"
        @click="emit('select', game.id)"
      >
        <span class="game-item__top">
          <span class="game-item__name">{{ game.name }}</span>
          <span class="status-pill" :class="`status-pill--${game.status}`">
            {{ statusTextMap[game.status] }}
          </span>
        </span>

        <span class="game-item__type">{{ game.type }}</span>
        <span class="game-item__desc">{{ game.desc }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { GameMeta } from '../games/registry'
import { statusTextMap } from '../games/registry'

defineProps<{
  games: GameMeta[]
  currentGameId: string
}>()

const emit = defineEmits<{
  select: [gameId: string]
}>()
</script>

<style scoped>
.game-sidebar {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-height: 100vh;
  padding: 26px 20px;
  border-right: 1px solid #e5edf7;
  background: #ffffff;
}

.sidebar-header h1 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  line-height: 1.25;
}

.sidebar-header p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 14px;
}

.game-list {
  display: grid;
  gap: 12px;
}

.game-item {
  position: relative;
  display: grid;
  gap: 8px;
  width: 100%;
  padding: 16px;
  overflow: hidden;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  background: #ffffff;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.game-item::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background: transparent;
  content: '';
}

.game-item:hover {
  border-color: #bfdbfe;
  background: #f8fbff;
}

.game-item--active {
  border-color: #93c5fd;
  background: #eff6ff;
  box-shadow: 0 8px 22px rgb(59 130 246 / 0.1);
}

.game-item--active::before {
  background: #3b82f6;
}

.game-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.game-item__name {
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

.game-item__type,
.game-item__desc {
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.status-pill {
  flex: 0 0 auto;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.4;
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

@media (max-width: 760px) {
  .game-sidebar {
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid #e5edf7;
  }
}
</style>
