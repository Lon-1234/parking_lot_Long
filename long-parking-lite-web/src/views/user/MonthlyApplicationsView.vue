<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getHome } from '@/api/public'
import { saveMonthlyApplication } from '@/api/user'
import type { MonthlyApplication } from '@/types/monthly'
import { MONTHLY_STATUS } from '@/constants/enums'
import { formatMoney } from '@/utils/format'
import StatusTag from '@/components/common/StatusTag.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AppEmpty from '@/components/common/AppEmpty.vue'

const list=ref<MonthlyApplication[]>([]);const loading=ref(true)
async function load(){loading.value=true;try{list.value=(await getHome()).monthlyApplications}finally{loading.value=false}}
async function cancel(item:MonthlyApplication){await ElMessageBox.confirm(`确定取消申请 ${item.applicationNo}？`,'取消确认',{type:'warning'});const result=await saveMonthlyApplication({action:'CANCEL',id:item.id});list.value=result.applications;ElMessage.success('申请已取消')}
onMounted(load)
</script>
<template><div><div class="title-actions"><div><h1 class="page-title">月租申请</h1><p class="page-subtitle">待审核可取消；通过后直接作为有效月租，到期后重新申请。</p></div><RouterLink to="/user/monthly-application/create"><el-button type="primary">新建申请</el-button></RouterLink></div><AppLoading v-if="loading"/><AppEmpty v-else-if="!list.length" description="暂无月租申请"/><div v-else class="panel"><el-table :data="list"><el-table-column prop="applicationNo" label="申请编号" min-width="160"/><el-table-column prop="plateNumber" label="车辆" width="110"/><el-table-column prop="parkingLotName" label="停车场" min-width="160"/><el-table-column prop="planName" label="套餐" min-width="150"/><el-table-column label="有效期" min-width="200"><template #default="{row}">{{ row.startDate }} 至 {{ row.endDate }}</template></el-table-column><el-table-column label="金额" width="100"><template #default="{row}">{{ formatMoney(row.applicationAmount) }}</template></el-table-column><el-table-column label="状态" width="110"><template #default="{row}"><StatusTag :label="MONTHLY_STATUS[row.status as keyof typeof MONTHLY_STATUS]" :status="row.status"/></template></el-table-column><el-table-column label="操作" width="100"><template #default="{row}"><el-button v-if="row.status===0" text type="danger" @click="cancel(row)">取消</el-button><span v-else class="text-muted">--</span></template></el-table-column></el-table></div></div></template>
<style scoped>.title-actions{display:flex;justify-content:space-between;align-items:start}</style>
