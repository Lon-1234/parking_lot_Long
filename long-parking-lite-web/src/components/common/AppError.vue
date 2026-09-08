<script setup lang="ts">
defineProps<{ message?: string }>()
const emit = defineEmits<{ retry: [] }>()
</script>
<template><el-result icon="error" title="加载失败" :sub-title="message ?? '请稍后重试'"><template #extra><el-button type="primary" @click="emit('retry')">重新加载</el-button></template></el-result></template>
