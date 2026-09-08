<script setup lang="ts">
import type { ParkingRecord } from '@/types/parking'
import { RECORD_STATUS } from '@/constants/enums'
import { formatDateTime, formatMoney } from '@/utils/format'
import StatusTag from '@/components/common/StatusTag.vue'
defineProps<{ record: ParkingRecord; detailPath?: string }>()
</script>
<template><article class="record-card"><div><strong>{{ record.plateNumber }}</strong><span>{{ record.recordNo }}</span></div><p>{{ record.parkingLotName }} · {{ record.spaceCode }}</p><p>入场：{{ formatDateTime(record.entryTime) }}</p><div class="record-card__foot"><StatusTag :label="RECORD_STATUS[record.recordStatus]" :status="record.recordStatus === 3 ? 1 : record.recordStatus" /><b>{{ formatMoney(record.payableAmount) }}</b><RouterLink v-if="detailPath" :to="detailPath">详情</RouterLink></div></article></template>
<style scoped lang="scss">.record-card{padding:17px;border:1px solid var(--border);border-radius:12px;background:white}.record-card>div:first-child{display:flex;justify-content:space-between}.record-card strong{font-size:18px}.record-card span,p{font-size:13px;color:var(--muted)}.record-card__foot{display:flex;gap:12px;align-items:center;margin-top:12px}.record-card__foot b{margin-left:auto;color:#bf7917}.record-card__foot a{color:var(--brand)}</style>
