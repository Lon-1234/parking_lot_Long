<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Van, Bottom, Top, Money, Place } from '@element-plus/icons-vue'
import { getOperatorParkingRecords } from '@/api/operator'
import { getParkingLots } from '@/api/public'
import type { ParkingRecord, ParkingLot } from '@/types/parking'
import StatisticCard from '@/components/common/StatisticCard.vue'
import ParkingRecordCard from '@/components/parking/ParkingRecordCard.vue'
import AppLoading from '@/components/common/AppLoading.vue'

const records=ref<ParkingRecord[]>([]);const lots=ref<ParkingLot[]>([]);const loading=ref(true);const today=new Date().toISOString().slice(0,10)
const entries=computed(()=>records.value.filter(r=>r.entryTime.startsWith(today)).length);const exits=computed(()=>records.value.filter(r=>r.exitTime?.startsWith(today)).length);const inYard=computed(()=>records.value.filter(r=>r.recordStatus<=2).length);const unpaid=computed(()=>records.value.filter(r=>r.paymentStatus===0&&r.recordStatus<3).length);const available=computed(()=>lots.value.reduce((s,l)=>s+l.availableSpaces,0))
onMounted(async()=>{try{const[r,l]=await Promise.all([getOperatorParkingRecords({pageSize:50}),getParkingLots({pageSize:50})]);records.value=r.list;lots.value=l.list}finally{loading.value=false}})
</script>
<template><div><h1 class="page-title">现场工作台</h1><p class="page-subtitle">快速掌握今日进出场和当前车位状态。</p><AppLoading v-if="loading"/><template v-else><div class="stat-grid"><StatisticCard label="今日入场" :value="entries" suffix="辆" :icon="Bottom"/><StatisticCard label="今日出场" :value="exits" suffix="辆" :icon="Top"/><StatisticCard label="当前场内" :value="inYard" suffix="辆" :icon="Van"/><StatisticCard label="待缴费车辆" :value="unpaid" suffix="辆" :icon="Money"/><StatisticCard label="空闲车位" :value="available" suffix="个" :icon="Place"/></div><section class="panel"><h2 class="section-title">最近停车记录</h2><div class="records"><ParkingRecordCard v-for="record in records.slice(0,6)" :key="record.id" :record="record"/></div></section></template></div></template>
<style scoped>.records{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:13px}</style>
