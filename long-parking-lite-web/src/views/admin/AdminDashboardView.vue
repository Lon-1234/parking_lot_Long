<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAdminDashboard } from '@/api/admin'
import type { AdminDashboard } from '@/types/stats'
import type { EChartsCoreOption } from 'echarts/core'
import StatisticCard from '@/components/common/StatisticCard.vue'
import ChartContainer from '@/components/charts/ChartContainer.vue'
import AppLoading from '@/components/common/AppLoading.vue'

const data=ref<AdminDashboard>();const loading=ref(true)
const trafficOption=computed<EChartsCoreOption>(()=>({tooltip:{trigger:'axis'},legend:{data:['入场','出场']},grid:{left:40,right:15,bottom:30},xAxis:{type:'category',data:data.value?.dateLabels??[]},yAxis:{type:'value'},series:[{name:'入场',type:'line',smooth:true,data:data.value?.entryTrend??[],itemStyle:{color:'#176b5b'}},{name:'出场',type:'line',smooth:true,data:data.value?.exitTrend??[],itemStyle:{color:'#e7a940'}}]}))
const revenueOption=computed<EChartsCoreOption>(()=>({tooltip:{trigger:'axis'},grid:{left:45,right:15,bottom:30},xAxis:{type:'category',data:data.value?.dateLabels??[]},yAxis:{type:'value'},series:[{name:'收入',type:'bar',data:data.value?.revenueTrend??[],itemStyle:{color:'#2f8f7d',borderRadius:[6,6,0,0]}}]}))
const spaceOption=computed<EChartsCoreOption>(()=>({tooltip:{trigger:'item'},legend:{bottom:0},series:[{name:'车位状态',type:'pie',radius:['45%','70%'],data:data.value?.spaceStatus??[],itemStyle:{borderColor:'#fff',borderWidth:3}}]}))
onMounted(async()=>{try{data.value=await getAdminDashboard()}finally{loading.value=false}})
</script>
<template><div><h1 class="page-title">运营看板</h1><p class="page-subtitle">核心经营数据与最近七天趋势。</p><AppLoading v-if="loading"/><template v-else-if="data"><div class="stat-grid"><StatisticCard v-for="metric in data.metrics" :key="metric.label" :label="metric.label" :value="metric.value" :suffix="metric.suffix"/></div><div class="chart-grid"><section class="panel wide"><h2 class="section-title">最近七天进出场趋势</h2><ChartContainer :option="trafficOption"/></section><section class="panel"><h2 class="section-title">车位状态占比</h2><ChartContainer :option="spaceOption"/></section><section class="panel wide"><h2 class="section-title">最近七天收入趋势</h2><ChartContainer :option="revenueOption"/></section></div></template></div></template>
<style scoped>.chart-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:18px}.wide:last-child{grid-column:1/-1}@media(max-width:900px){.chart-grid{grid-template-columns:1fr}.wide:last-child{grid-column:auto}}</style>
