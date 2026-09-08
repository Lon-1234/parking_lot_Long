<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserParkingRecordDetail } from '@/api/user'
import type { ParkingRecordDetail } from '@/types/parking'
import { PAYMENT_STATUS, RECORD_STATUS } from '@/constants/enums'
import { formatDateTime } from '@/utils/format'
import FeeDetailPanel from '@/components/parking/FeeDetailPanel.vue'
import ConfirmButton from '@/components/common/ConfirmButton.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import StatusTag from '@/components/common/StatusTag.vue'

const route=useRoute();const detail=ref<ParkingRecordDetail>();const loading=ref(true);const paying=ref(false)
async function load(){loading.value=true;try{detail.value=await getUserParkingRecordDetail(Number(route.params.id))}finally{loading.value=false}}
async function pay(){if(paying.value)return;paying.value=true;try{detail.value=await getUserParkingRecordDetail(Number(route.params.id),'PAY');ElMessage.success('模拟支付成功')}finally{paying.value=false}}
onMounted(load)
</script>
<template><div><h1 class="page-title">停车详情</h1><p class="page-subtitle">费用由接口返回，前端不自行作为最终计费依据。</p><AppLoading v-if="loading"/><template v-else-if="detail"><div class="detail-grid"><section class="panel"><h2 class="section-title">停车记录</h2><el-descriptions :column="1" border><el-descriptions-item label="记录编号">{{ detail.record.recordNo }}</el-descriptions-item><el-descriptions-item label="车牌">{{ detail.record.plateNumber }}</el-descriptions-item><el-descriptions-item label="停车场">{{ detail.record.parkingLotName }}</el-descriptions-item><el-descriptions-item label="车位">{{ detail.record.spaceCode }}</el-descriptions-item><el-descriptions-item label="入场时间">{{ formatDateTime(detail.record.entryTime) }}</el-descriptions-item><el-descriptions-item label="出场时间">{{ formatDateTime(detail.record.exitTime) }}</el-descriptions-item><el-descriptions-item label="记录状态"><StatusTag :label="RECORD_STATUS[detail.record.recordStatus]" :status="detail.record.recordStatus"/></el-descriptions-item><el-descriptions-item label="支付状态">{{ PAYMENT_STATUS[detail.record.paymentStatus] }}</el-descriptions-item><el-descriptions-item v-if="detail.record.paymentNo" label="支付流水号">{{ detail.record.paymentNo }}</el-descriptions-item></el-descriptions></section><section class="panel"><h2 class="section-title">费用明细</h2><FeeDetailPanel :fee="detail.fee"/><ConfirmButton v-if="detail.canPay" class="pay" text="模拟支付" confirm-text="确认模拟支付当前停车费用？支付后不可重复支付。" type="success" :disabled="paying" @confirm="pay"/><el-alert v-else class="pay" :title="detail.record.monthlyVehicle?'有效月租车辆，本次无需支付':'当前记录无需或无法支付'" type="info" :closable="false"/></section></div></template></div></template>
<style scoped>.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.pay{margin-top:24px;width:100%}@media(max-width:850px){.detail-grid{grid-template-columns:1fr}}</style>
