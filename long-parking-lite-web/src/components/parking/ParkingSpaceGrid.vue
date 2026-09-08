<script setup lang="ts">
import type { ParkingSpace } from '@/types/parking'
import { SPACE_STATUS, SPACE_TYPE } from '@/constants/enums'
defineProps<{ spaces: ParkingSpace[]; selectable?: boolean; modelValue?: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
</script>
<template><div class="space-grid"><button v-for="space in spaces" :key="space.id" type="button" :class="['space', `status-${space.status}`, { selected: modelValue === space.id }]" :disabled="space.status !== 1 || !selectable" @click="emit('update:modelValue', space.id)"><b>{{ space.spaceCode }}</b><small>{{ SPACE_TYPE[space.spaceType] }} · {{ SPACE_STATUS[space.status] }}</small></button></div></template>
<style scoped lang="scss">.space-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.space{padding:16px;border:1px solid #b8dfd6;border-radius:10px;background:#eff9f7;text-align:left;color:#24594f;&:disabled{cursor:not-allowed}.status-2{background:#fff0ee;border-color:#f2c3bc;color:#9b4b40}.status-0,.status-3{background:#f2f3f5;border-color:#d7dbe1;color:#7b8390}.selected{outline:3px solid #e7a940}b,small{display:block}small{margin-top:6px}}</style>
