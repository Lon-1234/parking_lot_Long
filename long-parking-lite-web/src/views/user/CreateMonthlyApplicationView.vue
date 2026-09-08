<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getMonthlyPlans } from '@/api/public'
import { getVehicles, saveMonthlyApplication } from '@/api/user'
import type { MonthlyPlan } from '@/types/monthly'
import type { Vehicle } from '@/types/parking'
import { addMonths, formatMoney, today } from '@/utils/format'

const route=useRoute();const router=useRouter();const formRef=ref<FormInstance>();const saving=ref(false);const vehicles=ref<Vehicle[]>([]);const plans=ref<MonthlyPlan[]>([]);const form=reactive({vehicleId:undefined as number|undefined,planId:Number(route.query.planId)||undefined,startDate:today()})
const rules:FormRules={vehicleId:[{required:true,message:'请选择车辆',trigger:'change'}],planId:[{required:true,message:'请选择套餐',trigger:'change'}],startDate:[{required:true,message:'请选择开始日期',trigger:'change'}]}
const selectedVehicle=computed(()=>vehicles.value.find(v=>v.id===form.vehicleId));const availablePlans=computed(()=>plans.value.filter(p=>!selectedVehicle.value||p.vehicleType===selectedVehicle.value.vehicleType));const selectedPlan=computed(()=>plans.value.find(p=>p.id===form.planId));const endDate=computed(()=>selectedPlan.value?addMonths(form.startDate,selectedPlan.value.monthCount):'--')
watch(()=>form.vehicleId,()=>{if(selectedPlan.value&&selectedVehicle.value?.vehicleType!==selectedPlan.value.vehicleType)form.planId=undefined})
async function submit(){if(!await formRef.value?.validate())return;saving.value=true;try{await saveMonthlyApplication({action:'CREATE',vehicleId:form.vehicleId,planId:form.planId,startDate:form.startDate});ElMessage.success('月租申请已提交');await router.push('/user/monthly-applications')}finally{saving.value=false}}
onMounted(async()=>{[vehicles.value,plans.value]=await Promise.all([getVehicles(),getMonthlyPlans({status:1})])})
</script>
<template><div><h1 class="page-title">创建月租申请</h1><p class="page-subtitle">停用车辆不可申请，套餐车辆类型必须匹配。</p><div class="panel form-page"><el-form ref="formRef" :model="form" :rules="rules" label-position="top"><el-form-item label="车辆" prop="vehicleId"><el-select v-model="form.vehicleId" class="full-width" placeholder="请选择正常车辆"><el-option v-for="v in vehicles.filter(item=>item.status===1)" :key="v.id" :label="`${v.plateNumber} · ${v.vehicleType==='SMALL'?'小型车':'新能源车'}`" :value="v.id"/></el-select></el-form-item><el-form-item label="月租套餐" prop="planId"><el-select v-model="form.planId" class="full-width" placeholder="请选择匹配套餐"><el-option v-for="p in availablePlans" :key="p.id" :label="`${p.parkingLotName} · ${p.planName} · ${formatMoney(p.price)}`" :value="p.id"/></el-select></el-form-item><el-form-item label="开始日期" prop="startDate"><el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" :disabled-date="(d:Date)=>d.getTime()<Date.now()-86400000" class="full-width"/></el-form-item><el-alert v-if="selectedPlan" :title="`预计有效期：${form.startDate} 至 ${endDate}，申请金额 ${formatMoney(selectedPlan.price)}`" type="info" :closable="false"/><el-button type="primary" size="large" class="full-width submit" :loading="saving" @click="submit">提交申请</el-button></el-form></div></div></template>
<style scoped>.submit{margin-top:22px}</style>
