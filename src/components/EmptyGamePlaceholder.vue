<template>
  <div class="empty-game">
    <h3>当前玩法暂未接入</h3>
    <p>可以在 games/{{ gameId }} 目录中添加具体游戏组件</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  gameId: string
}>()
</script>

<style scoped>
.empty-game {
  display: grid;
  min-height: 430px;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 32px;
  border: 1px dashed #bfdbfe;
  border-radius: 8px;
  background: #f8fbff;
  text-align: center;
}

.empty-game h3 {
  margin: 0;
  color: #1f2937;
  font-size: 22px;
  line-height: 1.35;
}

.empty-game p {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
}

@media (max-width: 760px) {
  .empty-game {
    min-height: 300px;
    padding: 22px;
  }
}
</style>
