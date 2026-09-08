<script setup lang="ts">
import { Van } from '@element-plus/icons-vue'
import type { Vehicle } from '@/types/parking'
import { VEHICLE_TYPE } from '@/constants/enums'
defineProps<{ vehicle: Vehicle }>()
defineEmits<{ edit: [vehicle: Vehicle]; remove: [vehicle: Vehicle]; default: [vehicle: Vehicle] }>()
</script>
<template><article class="vehicle-card"><div class="plate"><el-icon><Van /></el-icon>{{ vehicle.plateNumber }}<el-tag v-if="vehicle.isDefault" size="small">默认</el-tag></div><p>{{ vehicle.brand || '未填写品牌' }} {{ vehicle.model }} · {{ vehicle.color || '未填写颜色' }}</p><p>{{ VEHICLE_TYPE[vehicle.vehicleType] }} · {{ vehicle.status === 1 ? '正常' : '停用' }}</p><div class="actions"><el-button text type="primary" @click="$emit('edit', vehicle)">编辑</el-button><el-button v-if="!vehicle.isDefault" text type="success" @click="$emit('default', vehicle)">设为默认</el-button><el-button text type="danger" @click="$emit('remove', vehicle)">删除</el-button></div></article></template>
<style scoped lang="scss">.vehicle-card{padding:20px;border:1px solid var(--border);border-radius:14px;background:white}.plate{display:flex;align-items:center;gap:8px;font-size:20px;font-weight:800;color:#183b50}.plate .el-icon{color:var(--brand)}p{color:var(--muted);font-size:14px}.actions{border-top:1px solid var(--border);padding-top:10px}</style>
