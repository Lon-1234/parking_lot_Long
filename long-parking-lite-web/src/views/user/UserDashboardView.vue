<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Van, Tickets, Money, Position } from '@element-plus/icons-vue'
import { getVehicles } from '@/api/user'
import { getUserParkingRecords } from '@/api/user'
import { getHome } from '@/api/public'
import type { Vehicle, ParkingRecord } from '@/types/parking'
import type { HomeData } from '@/types/stats'
import StatisticCard from '@/components/common/StatisticCard.vue'
import ParkingRecordCard from '@/components/parking/ParkingRecordCard.vue'
import AppLoading from '@/components/common/AppLoading.vue'

const vehicles = ref<Vehicle[]>([]); const records = ref<ParkingRecord[]>([]); const home = ref<HomeData>(); const loading = ref(true)
const inYard = computed(() => records.value.filter(r => r.recordStatus <= 2).length); const unpaid = computed(() => records.value.filter(r => r.paymentStatus === 0 && r.recordStatus < 3).length); const activeMonthly = computed(() => home.value?.monthlyApplications.filter(a => a.status === 1 && a.endDate >= new Date().toISOString().slice(0,10)).length ?? 0); const monthCost = computed(() => records.value.filter(r => r.paymentStatus === 1).reduce((s,r)=>s+r.payableAmount,0))
onMounted(async () => { try { const [v,r,h] = await Promise.all([getVehicles(), getUserParkingRecords({ pageSize: 20 }), getHome()]); vehicles.value=v; records.value=r.list; home.value=h } finally { loading.value=false } })
</script>
<template><div><h1 class="page-title">你好，欢迎回来</h1><p class="page-subtitle">车辆、停车费用和月租状态都集中在这里。</p><AppLoading v-if="loading"/><template v-else><div class="stat-grid"><StatisticCard label="我的车辆" :value="vehicles.length" suffix="辆" :icon="Van"/><StatisticCard label="当前场内" :value="inYard" suffix="辆" :icon="Position"/><StatisticCard label="待缴费记录" :value="unpaid" suffix="笔" :icon="Money"/><StatisticCard label="有效月租" :value="activeMonthly" suffix="个" :icon="Tickets"/></div><div class="dashboard-grid"><section class="panel"><div class="section-head"><h2 class="section-title">最近停车记录</h2><RouterLink to="/user/parking-records">查看全部</RouterLink></div><div class="record-list"><ParkingRecordCard v-for="record in records.slice(0,4)" :key="record.id" :record="record" :detail-path="`/user/parking-record/${record.id}`"/></div></section><section class="panel cost"><span>本月停车费用</span><strong>¥{{ monthCost.toFixed(2) }}</strong><p>仅统计当前 Mock 数据中的已支付记录</p><RouterLink to="/user/vehicles"><el-button class="full-width">管理我的车辆</el-button></RouterLink></section></div></template></div></template>
<style scoped lang="scss">.dashboard-grid{display:grid;grid-template-columns:1fr 290px;gap:20px}.section-head{display:flex;justify-content:space-between}.section-head a{color:var(--brand)}.record-list{display:grid;grid-template-columns:1fr 1fr;gap:12px}.cost{display:flex;flex-direction:column;justify-content:center;text-align:center}.cost>span,.cost p{color:var(--muted)}.cost strong{margin:18px 0;font-size:42px;color:#bd7918}@media(max-width:950px){.dashboard-grid{grid-template-columns:1fr}.record-list{grid-template-columns:1fr}}</style>
