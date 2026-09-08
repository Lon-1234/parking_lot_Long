<script setup lang="ts">
import type { ParkingFeeResult } from '@/types/parking'
import { formatDateTime, formatMoney } from '@/utils/format'
defineProps<{ fee: ParkingFeeResult }>()
</script>
<template><div class="fee-panel"><div><span>停车时长</span><b>{{ fee.parkingMinutes }} 分钟</b></div><div><span>计费时间</span><b>{{ formatDateTime(fee.calculateTime) }}</b></div><div><span>计费说明</span><b>{{ fee.feeDescription }}</b></div><div class="total"><span>应付金额</span><b>{{ fee.monthlyVehicle ? '月租免费' : formatMoney(fee.payableAmount) }}</b></div></div></template>
<style scoped lang="scss">.fee-panel{display:grid;gap:14px}.fee-panel>div{display:flex;justify-content:space-between;gap:20px;padding-bottom:12px;border-bottom:1px solid var(--border)}span{color:var(--muted)}.total b{font-size:24px;color:#bf7917}</style>
