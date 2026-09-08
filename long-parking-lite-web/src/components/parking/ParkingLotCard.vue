<script setup lang="ts">
import { Clock, Location } from '@element-plus/icons-vue'
import type { ParkingLot } from '@/types/parking'
import { LOT_STATUS } from '@/constants/enums'
import StatusTag from '@/components/common/StatusTag.vue'
defineProps<{ lot: ParkingLot }>()
</script>
<template>
  <article class="lot-card">
    <div class="lot-card__top"><h3>{{ lot.lotName }}</h3><StatusTag :label="LOT_STATUS[lot.status]" :status="lot.status === 1 ? 1 : 3" /></div>
    <p><el-icon><Location /></el-icon>{{ lot.address }}</p><p><el-icon><Clock /></el-icon>{{ lot.businessStartTime }} - {{ lot.businessEndTime }}</p>
    <div class="spaces"><strong>{{ lot.availableSpaces }}</strong><span>/ {{ lot.totalSpaces }} 空闲车位</span></div>
    <div class="lot-card__footer"><span>临停 <b>¥{{ lot.temporaryPrice }}/小时</b></span><RouterLink :to="`/parking-lot/${lot.id}`">查看详情 →</RouterLink></div>
  </article>
</template>
<style scoped lang="scss">
.lot-card { padding:20px; background:white; border:1px solid var(--border); border-radius:16px; transition:.2s; &:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(25,70,80,.1)} h3{margin:0;color:#172338}.lot-card__top,.lot-card__footer{display:flex;justify-content:space-between;align-items:center;gap:10px}p{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:14px}.spaces{margin:18px 0;padding:14px;background:#edf8f5;border-radius:11px;strong{font-size:26px;color:var(--brand);margin-right:5px}span{color:#557068}}.lot-card__footer{font-size:14px;b{color:#c27c17}.router-link-active,a{color:var(--brand);font-weight:600}} }
</style>
