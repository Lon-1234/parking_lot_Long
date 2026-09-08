<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
const props = withDefaults(defineProps<{ text: string; confirmText: string; type?: 'primary' | 'success' | 'warning' | 'danger'; disabled?: boolean }>(), { type: 'primary', disabled: false })
const emit = defineEmits<{ confirm: [] }>()
const loading = ref(false)
async function confirm() {
  await ElMessageBox.confirm(props.confirmText, '操作确认', { type: 'warning' })
  loading.value = true
  emit('confirm')
  window.setTimeout(() => { loading.value = false }, 800)
}
</script>
<template><el-button :type="type" :disabled="disabled || loading" :loading="loading" @click="confirm">{{ text }}</el-button></template>
