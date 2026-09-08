<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ label: string; status?: number | string }>()
const type = computed(() => {
  if ([1, 2, 'NORMAL', 'SUCCESS'].includes(props.status ?? '')) return 'success'
  if ([0, 'PENDING'].includes(props.status ?? '')) return 'warning'
  if ([3, 4, 'DISABLED', 'ERROR'].includes(props.status ?? '')) return 'danger'
  return 'info'
})
</script>
<template><el-tag :type="type" effect="light">{{ label }}</el-tag></template>
