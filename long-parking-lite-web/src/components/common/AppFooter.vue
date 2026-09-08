<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

async function resetMock() {
  await ElMessageBox.confirm('将清除所有 Mock 操作并恢复初始数据，确定继续？', '重置 Mock', { type: 'warning' })
  const { resetMockDatabase } = await import('@/mock/database')
  resetMockDatabase()
  ElMessage.success('Mock 数据已重置，页面即将刷新')
  window.setTimeout(() => window.location.reload(), 500)
}
</script>

<template>
  <footer class="app-footer">
    <span>© 2026 Long 轻量智慧停车管理平台</span>
    <el-button v-if="useMock" text size="small" @click="resetMock">重置 Mock 数据</el-button>
  </footer>
</template>

<style scoped>
.app-footer { min-height: 70px; padding: 20px; display: flex; justify-content: center; align-items: center; gap: 18px; color: #8490a3; border-top: 1px solid var(--border); background: white; }
</style>
