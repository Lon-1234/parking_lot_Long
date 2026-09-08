<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getUserParkingRecords } from '@/api/user'
import type { ParkingRecord } from '@/types/parking'
import ParkingRecordCard from '@/components/parking/ParkingRecordCard.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AppEmpty from '@/components/common/AppEmpty.vue'

const list=ref<ParkingRecord[]>([]);const total=ref(0);const loading=ref(false);const query=reactive({page:1,pageSize:10,plateNumber:'',status:undefined as number|undefined})
async function load(){loading.value=true;try{const r=await getUserParkingRecords(query);list.value=r.list;total.value=r.total}finally{loading.value=false}}
function pageChange(page:number,pageSize:number){query.page=page;query.pageSize=pageSize;void load()}
onMounted(load)
</script>
<template><div><h1 class="page-title">停车记录</h1><p class="page-subtitle">查看停车状态、费用和支付详情。</p><div class="panel"><div class="toolbar"><el-input v-model="query.plateNumber" clearable placeholder="车牌号码" style="width:180px"/><el-select v-model="query.status" clearable placeholder="全部状态" style="width:160px"><el-option label="停车中" :value="0"/><el-option label="待缴费" :value="1"/><el-option label="已缴费" :value="2"/><el-option label="已出场" :value="3"/><el-option label="人工放行" :value="4"/></el-select><el-button type="primary" @click="query.page=1;load()">查询</el-button></div><AppLoading v-if="loading"/><AppEmpty v-else-if="!list.length"/><div v-else class="records"><ParkingRecordCard v-for="record in list" :key="record.id" :record="record" :detail-path="`/user/parking-record/${record.id}`"/></div><AppPagination :page="query.page" :page-size="query.pageSize" :total="total" @change="pageChange"/></div></div></template>
<style scoped>.records{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}</style>
