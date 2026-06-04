<template>
  <aside class="game-sidebar">
    <header class="sidebar-header">
      <h1>小游戏试玩平台</h1>
      <p>用于组内快速验证玩法</p>
    </header>

    <nav class="game-list" aria-label="游戏列表">
      <button
        v-for="game in games"
        :key="game.id"
        class="game-item"
        :class="{ 'game-item--active': game.id === currentGameId }"
        type="button"
        @click="emit('select', game.id)"
      >
        <span class="game-item__main">
          <span class="game-item__name">{{ game.name }}</span>
          <span class="status-pill" :class="`status-pill--${game.status}`">
            {{ statusTextMap[game.status] }}
          </span>
        </span>
        <span class="game-item__type">{{ game.type }}</span>
      </button>
    </nav>
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
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid #e5edf7;
  background: #ffffff;
}

.sidebar-header {
  flex-shrink: 0;
  padding: 20px 16px 16px;
  border-bottom: 1px solid #eef2f7;
}

.sidebar-header h1 {
  margin: 0;
  color: #111827;
  font-size: 20px;
  line-height: 1.25;
}

.sidebar-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.game-list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.game-item {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 100%;
  min-height: 64px;
  max-height: 76px;
  padding: 10px 12px 10px 16px;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.game-item::before {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: transparent;
  content: '';
}

.game-item:hover {
  background: #f8fbff;
}

.game-item--active {
  border-color: #93c5fd;
  background: #eff6ff;
}

.game-item--active::before {
  background: #3b82f6;
}

.game-item__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.game-item__name {
  overflow: hidden;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.game-item__type {
  color: #64748b;
  font-size: 12px;
  line-height: 1.3;
}

.status-pill {
  flex: 0 0 auto;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.35;
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
    border-right: 0;
    border-bottom: 1px solid #e5edf7;
  }

  .game-list {
    max-height: calc(45vh - 72px);
  }
}
</style>
