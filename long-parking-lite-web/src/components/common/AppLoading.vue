<template><div class="state-box"><el-icon class="is-loading" :size="32"><Loading /></el-icon><span>正在加载...</span></div></template>
<script setup lang="ts">import { Loading } from '@element-plus/icons-vue'</script>
<style scoped>.state-box { min-height: 180px; display: grid; place-content: center; justify-items: center; gap: 12px; color: var(--muted); }</style>
