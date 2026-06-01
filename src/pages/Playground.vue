<template>
  <main class="playground-page">
    <GameSidebar
      class="playground-sidebar"
      :games="gameRegistry"
      :current-game-id="currentGameId"
      @select="handleSelectGame"
    />

    <section class="playground-content">
      <GamePreviewPanel :game="currentGame" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import GamePreviewPanel from '../components/GamePreviewPanel.vue'
import GameSidebar from '../components/GameSidebar.vue'
import { gameRegistry } from '../games/registry'

const currentGameId = ref(gameRegistry[0]?.id ?? '')

const currentGame = computed(() => {
  return gameRegistry.find((game) => game.id === currentGameId.value) ?? gameRegistry[0]
})

function handleSelectGame(gameId: string) {
  currentGameId.value = gameId
}
</script>

<style scoped>
.playground-page {
  display: flex;
  min-height: 100vh;
  background: #f3f6fb;
}

.playground-sidebar {
  flex: 0 0 300px;
}

.playground-content {
  flex: 1;
  min-width: 0;
  padding: 28px;
}

@media (max-width: 760px) {
  .playground-page {
    flex-direction: column;
  }

  .playground-sidebar {
    flex-basis: auto;
  }

  .playground-content {
    padding: 18px;
  }
}
</style>
