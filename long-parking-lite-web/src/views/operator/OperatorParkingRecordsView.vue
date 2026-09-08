<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getOperatorParkingRecords } from '@/api/operator'
import type { ParkingRecord } from '@/types/parking'
import { PAYMENT_STATUS, RECORD_STATUS } from '@/constants/enums'
import { formatDateTime, formatMoney } from '@/utils/format'
import AppPagination from '@/components/common/AppPagination.vue'
import StatusTag from '@/components/common/StatusTag.vue'

const list=ref<ParkingRecord[]>([]);const total=ref(0);const loading=ref(false);const query=reactive({page:1,pageSize:10,plateNumber:'',status:undefined as number|undefined,currentOnly:false})
async function load(){loading.value=true;try{const r=await getOperatorParkingRecords(query);list.value=r.list;total.value=r.total}finally{loading.value=false}}
function reset(){Object.assign(query,{page:1,pageSize:10,plateNumber:'',status:undefined,currentOnly:false});void load()}function pageChange(page:number,pageSize:number){query.page=page;query.pageSize=pageSize;void load()}
onMounted(load)
</script>
<template><div><h1 class="page-title">停车记录查询</h1><p class="page-subtitle">按车牌、状态和是否在场筛选全部停车记录。</p><div class="panel"><div class="toolbar"><el-input v-model="query.plateNumber" clearable placeholder="车牌号码" style="width:180px"/><el-select v-model="query.status" clearable placeholder="全部状态" style="width:150px"><el-option v-for="(label,value) in RECORD_STATUS" :key="value" :label="label" :value="Number(value)"/></el-select><el-checkbox v-model="query.currentOnly">仅当前场内</el-checkbox><el-button type="primary" @click="query.page=1;load()">查询</el-button><el-button @click="reset">重置</el-button></div><el-table v-loading="loading" :data="list"><el-table-column prop="recordNo" label="记录编号" min-width="170"/><el-table-column prop="plateNumber" label="车牌" width="110"/><el-table-column prop="parkingLotName" label="停车场" min-width="160"/><el-table-column prop="spaceCode" label="车位" width="80"/><el-table-column label="入场时间" min-width="170"><template #default="{row}">{{ formatDateTime(row.entryTime) }}</template></el-table-column><el-table-column label="出场时间" min-width="170"><template #default="{row}">{{ formatDateTime(row.exitTime) }}</template></el-table-column><el-table-column label="金额" width="90"><template #default="{row}">{{ formatMoney(row.payableAmount) }}</template></el-table-column><el-table-column label="支付" width="100"><template #default="{row}">{{ PAYMENT_STATUS[row.paymentStatus as keyof typeof PAYMENT_STATUS] }}</template></el-table-column><el-table-column label="状态" width="110"><template #default="{row}"><StatusTag :label="RECORD_STATUS[row.recordStatus as keyof typeof RECORD_STATUS]" :status="row.recordStatus"/></template></el-table-column></el-table><AppPagination :page="query.page" :page-size="query.pageSize" :total="total" @change="pageChange"/></div></div></template>
