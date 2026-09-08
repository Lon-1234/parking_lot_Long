<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getMonthlyPlans, getParkingLots } from '@/api/public'
import { useAuthStore } from '@/stores/auth'
import type { MonthlyPlan } from '@/types/monthly'
import type { ParkingLot } from '@/types/parking'
import MonthlyPlanCard from '@/components/monthly/MonthlyPlanCard.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AppEmpty from '@/components/common/AppEmpty.vue'

const auth = useAuthStore(); const router = useRouter(); const plans = ref<MonthlyPlan[]>([]); const lots = ref<ParkingLot[]>([]); const loading = ref(false); const filter = reactive({ parkingLotId: undefined as number|undefined, vehicleType: '' })
async function load() { loading.value = true; try { plans.value = await getMonthlyPlans({ parkingLotId: filter.parkingLotId, vehicleType: filter.vehicleType || undefined, status: 1 }) } finally { loading.value = false } }
function apply(plan: MonthlyPlan) { const path = auth.userInfo?.roleCode === 'USER' ? '/user/monthly-application/create' : '/login'; void router.push({ path, query: { planId: plan.id } }) }
onMounted(async () => { lots.value = (await getParkingLots({ pageSize: 50 })).list; await load() })
</script>
<template><div class="page-shell"><h1 class="page-title">月租套餐</h1><p class="page-subtitle">选择适用停车场与车辆类型；审核通过的申请直接作为有效月租。</p><div class="toolbar"><el-select v-model="filter.parkingLotId" clearable placeholder="全部停车场" @change="load"><el-option v-for="lot in lots" :key="lot.id" :label="lot.lotName" :value="lot.id"/></el-select><el-select v-model="filter.vehicleType" clearable placeholder="全部车辆类型" @change="load"><el-option label="小型车" value="SMALL"/><el-option label="新能源车" value="NEW_ENERGY"/></el-select></div><AppLoading v-if="loading"/><AppEmpty v-else-if="!plans.length"/><div v-else class="card-grid"><MonthlyPlanCard v-for="plan in plans" :key="plan.id" :plan="plan" actionable @apply="apply"/></div></div></template>
