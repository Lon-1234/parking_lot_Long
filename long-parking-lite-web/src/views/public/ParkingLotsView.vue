<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getParkingLots } from '@/api/public'
import type { ParkingLot } from '@/types/parking'
import ParkingLotCard from '@/components/parking/ParkingLotCard.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AppEmpty from '@/components/common/AppEmpty.vue'

const route = useRoute(); const loading = ref(false); const list = ref<ParkingLot[]>([]); const total = ref(0); const query = reactive({ page: 1, pageSize: 5, name: String(route.query.name ?? ''), status: undefined as number | undefined, hasAvailable: false })
async function load() { loading.value = true; try { const result = await getParkingLots(query); list.value = result.list; total.value = result.total } finally { loading.value = false } }
function reset() { Object.assign(query, { page: 1, pageSize: 5, name: '', status: undefined, hasAvailable: false }); void load() }
function pageChange(page: number, pageSize: number) { query.page = page; query.pageSize = pageSize; void load() }
onMounted(load)
</script>
<template><div class="page-shell"><h1 class="page-title">停车场</h1><p class="page-subtitle">查询营业状态和实时空闲车位，不提供地图与导航。</p><div class="panel"><div class="toolbar"><el-input v-model="query.name" clearable placeholder="名称或地址" style="width:240px" @keyup.enter="query.page=1;load()" /><el-select v-model="query.status" clearable placeholder="全部状态" style="width:150px"><el-option label="停用" :value="0"/><el-option label="营业中" :value="1"/><el-option label="维护中" :value="2"/></el-select><el-checkbox v-model="query.hasAvailable">仅看有空位</el-checkbox><el-button type="primary" @click="query.page=1;load()">查询</el-button><el-button @click="reset">清空筛选</el-button></div><AppLoading v-if="loading"/><AppEmpty v-else-if="!list.length" description="没有符合条件的停车场"/><div v-else class="card-grid"><ParkingLotCard v-for="lot in list" :key="lot.id" :lot="lot"/></div><AppPagination :page="query.page" :page-size="query.pageSize" :total="total" @change="pageChange" /></div></div></template>
