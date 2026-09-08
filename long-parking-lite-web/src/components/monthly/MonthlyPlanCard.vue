<script setup lang="ts">
import type { MonthlyPlan } from '@/types/monthly'
import { VEHICLE_TYPE } from '@/constants/enums'
import { formatMoney } from '@/utils/format'
defineProps<{ plan: MonthlyPlan; actionable?: boolean }>()
defineEmits<{ apply: [plan: MonthlyPlan] }>()
</script>
<template><article class="plan-card"><span class="eyebrow">{{ plan.parkingLotName }}</span><h3>{{ plan.planName }}</h3><div class="price">{{ formatMoney(plan.price) }}<small>/ {{ plan.monthCount }}个月</small></div><p>{{ VEHICLE_TYPE[plan.vehicleType] }} · {{ plan.description }}</p><el-button v-if="actionable" type="primary" class="full-width" @click="$emit('apply', plan)">立即申请</el-button></article></template>
<style scoped lang="scss">.plan-card{padding:22px;border:1px solid var(--border);border-radius:16px;background:white}.eyebrow{font-size:13px;color:var(--brand)}h3{margin:8px 0 16px}.price{font-size:27px;font-weight:800;color:#c17c1a}.price small{font-size:13px;color:var(--muted)}p{min-height:42px;color:var(--muted);font-size:14px}</style>
