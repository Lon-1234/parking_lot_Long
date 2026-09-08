<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getMonthlyPlans, getParkingLotDetail } from '@/api/public'
import type { ParkingLotDetail } from '@/types/parking'
import type { MonthlyPlan } from '@/types/monthly'
import { LOT_STATUS, SPACE_TYPE } from '@/constants/enums'
import ParkingSpaceGrid from '@/components/parking/ParkingSpaceGrid.vue'
import MonthlyPlanCard from '@/components/monthly/MonthlyPlanCard.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'
import StatusTag from '@/components/common/StatusTag.vue'

const route = useRoute(); const detail = ref<ParkingLotDetail>(); const plans = ref<MonthlyPlan[]>([]); const loading = ref(true); const error = ref(''); const occupied = computed(() => detail.value?.spaces.filter(s => s.status === 2).length ?? 0)
async function load() { loading.value = true; error.value = ''; try { const id = Number(route.params.id); detail.value = await getParkingLotDetail(id); plans.value = await getMonthlyPlans({ parkingLotId: id, status: 1 }) } catch (e) { error.value = e instanceof Error ? e.message : '加载失败' } finally { loading.value = false } }
onMounted(load)
</script>
<template><div class="page-shell"><AppLoading v-if="loading"/><AppError v-else-if="error" :message="error" @retry="load"/><template v-else-if="detail"><div class="detail-head"><div><span class="eyebrow">{{ detail.lot.lotCode }}</span><h1 class="page-title">{{ detail.lot.lotName }}</h1><p>{{ detail.lot.address }} · {{ detail.lot.businessStartTime }} - {{ detail.lot.businessEndTime }}</p></div><StatusTag :label="LOT_STATUS[detail.lot.status]" :status="detail.lot.status===1?1:3"/></div><div class="stat-grid"><div class="mini"><b>{{ detail.lot.totalSpaces }}</b><span>总车位</span></div><div class="mini"><b>{{ detail.lot.availableSpaces }}</b><span>空闲车位</span></div><div class="mini"><b>{{ occupied }}</b><span>已占用</span></div><div v-for="(count,type) in detail.spaceStats" :key="type" class="mini"><b>{{ count }}</b><span>{{ SPACE_TYPE[type] }}</span></div></div><section class="panel"><h2 class="section-title">车位概览</h2><ParkingSpaceGrid :spaces="detail.spaces"/></section><div class="detail-grid"><section class="panel"><h2 class="section-title">基础计费规则</h2><el-descriptions :column="1" border><el-descriptions-item label="免费时长">{{ detail.billingRule.freeMinutes }} 分钟</el-descriptions-item><el-descriptions-item label="首小时">¥{{ detail.billingRule.firstHourPrice }}</el-descriptions-item><el-descriptions-item label="后续每小时">¥{{ detail.billingRule.additionalHourPrice }}</el-descriptions-item><el-descriptions-item label="单日封顶">¥{{ detail.billingRule.dailyCapAmount }}</el-descriptions-item></el-descriptions><p class="text-muted">不足一小时按一小时计算，最终费用以后端返回为准。</p></section><section><h2 class="section-title">可用月租套餐</h2><div class="card-grid"><MonthlyPlanCard v-for="plan in plans" :key="plan.id" :plan="plan"/></div></section></div></template></div></template>
<style scoped lang="scss">.detail-head{display:flex;justify-content:space-between;align-items:start;margin-bottom:24px}.detail-head p{color:var(--muted)}.eyebrow{font-size:12px;letter-spacing:2px;color:var(--brand)}.mini{padding:18px;background:white;border:1px solid var(--border);border-radius:13px}.mini b,.mini span{display:block}.mini b{font-size:26px;color:var(--brand)}.mini span{font-size:13px;color:var(--muted)}.detail-grid{display:grid;grid-template-columns:.7fr 1.3fr;gap:20px;margin-top:20px}@media(max-width:800px){.detail-grid{grid-template-columns:1fr}}</style>
