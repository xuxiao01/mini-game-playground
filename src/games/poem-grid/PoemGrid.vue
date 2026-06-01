<template>
  <div class="poem-grid-placeholder">
    <h3>古诗词九宫格玩法开发中</h3>
    <p>后续将在这里展示 3x3 九宫格</p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.poem-grid-placeholder {
  display: grid;
  min-height: 280px;
  place-items: center;
  align-content: center;
  gap: 8px;
  border: 1px dashed #bfdbfe;
  border-radius: 8px;
  background: #f8fbff;
  color: #475569;
}

.poem-grid-placeholder h3,
.poem-grid-placeholder p {
  margin: 0;
}

.poem-grid-placeholder h3 {
  color: #1f2937;
  font-size: 20px;
}
</style>
