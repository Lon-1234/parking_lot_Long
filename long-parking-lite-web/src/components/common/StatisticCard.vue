<script setup lang="ts">
import type { Component } from 'vue'
defineProps<{ label: string; value: string | number; suffix?: string; icon?: Component }>()
</script>
<template><div class="stat-card"><el-icon v-if="icon" :size="26"><component :is="icon" /></el-icon><div><span>{{ label }}</span><strong>{{ value }}<small>{{ suffix }}</small></strong></div></div></template>
<style scoped lang="scss">
.stat-card { min-height: 112px; padding: 20px; display: flex; align-items: center; gap: 16px; background: white; border: 1px solid var(--border); border-radius: 15px; box-shadow: 0 8px 25px rgba(30,60,90,.05); .el-icon { color: var(--brand); background: #e8f5f2; border-radius: 12px; padding: 12px; box-sizing: content-box; } span { display:block; color:var(--muted); font-size:14px; } strong { display:block; margin-top:7px; font-size:27px; color:#18253a; } small { font-size:13px; margin-left:4px; } }
</style>
