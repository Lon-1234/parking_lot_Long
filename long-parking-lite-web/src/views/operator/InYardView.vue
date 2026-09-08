<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getOperatorParkingRecords } from '@/api/operator'
import type { ParkingRecord } from '@/types/parking'
import { PAYMENT_STATUS, RECORD_STATUS } from '@/constants/enums'
import { formatDateTime, formatMoney } from '@/utils/format'
import AppPagination from '@/components/common/AppPagination.vue'
import StatusTag from '@/components/common/StatusTag.vue'

const router=useRouter();const list=ref<ParkingRecord[]>([]);const total=ref(0);const loading=ref(false);const query=reactive({page:1,pageSize:10,plateNumber:'',currentOnly:true})
async function load(){loading.value=true;try{const r=await getOperatorParkingRecords(query);list.value=r.list;total.value=r.total}finally{loading.value=false}}
function pageChange(page:number,pageSize:number){query.page=page;query.pageSize=pageSize;void load()}
onMounted(load)
</script>
<template><div><h1 class="page-title">当前场内车辆</h1><p class="page-subtitle">仅显示停车中、待缴费和已缴费待出场记录。</p><div class="panel"><div class="toolbar"><el-input v-model="query.plateNumber" clearable placeholder="车牌号码" style="width:200px"/><el-button type="primary" @click="query.page=1;load()">查询</el-button><el-button @click="router.push('/operator/exit')">办理出场</el-button></div><el-table v-loading="loading" :data="list"><el-table-column prop="plateNumber" label="车牌" width="120"/><el-table-column prop="parkingLotName" label="停车场" min-width="170"/><el-table-column prop="spaceCode" label="车位" width="90"/><el-table-column label="入场时间" min-width="170"><template #default="{row}">{{ formatDateTime(row.entryTime) }}</template></el-table-column><el-table-column label="金额" width="100"><template #default="{row}">{{ formatMoney(row.payableAmount) }}</template></el-table-column><el-table-column label="支付" width="100"><template #default="{row}">{{ PAYMENT_STATUS[row.paymentStatus as keyof typeof PAYMENT_STATUS] }}</template></el-table-column><el-table-column label="状态" width="110"><template #default="{row}"><StatusTag :label="RECORD_STATUS[row.recordStatus as keyof typeof RECORD_STATUS]" :status="row.recordStatus"/></template></el-table-column></el-table><AppPagination :page="query.page" :page-size="query.pageSize" :total="total" @change="pageChange"/></div></div></template>
