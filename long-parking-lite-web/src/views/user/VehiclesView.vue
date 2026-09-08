<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteVehicle, getVehicles, saveVehicle } from '@/api/user'
import type { Vehicle, VehicleType } from '@/types/parking'
import VehicleCard from '@/components/vehicle/VehicleCard.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AppEmpty from '@/components/common/AppEmpty.vue'

const list=ref<Vehicle[]>([]); const loading=ref(true); const dialog=ref(false); const saving=ref(false); const formRef=ref<FormInstance>(); const form=reactive({ id:undefined as number|undefined, plateNumber:'', brand:'', model:'', color:'', vehicleType:'SMALL' as VehicleType, status:1 as 0|1 })
const rules:FormRules={plateNumber:[{required:true,pattern:/^[\u4e00-\u9fa5][A-Z][A-Z0-9]{5,6}$/,message:'请输入有效车牌，如京A12345',trigger:'blur'}],vehicleType:[{required:true,message:'请选择车辆类型',trigger:'change'}]}
async function load(){loading.value=true;try{list.value=await getVehicles()}finally{loading.value=false}}
function open(vehicle?:Vehicle){Object.assign(form,vehicle?{id:vehicle.id,plateNumber:vehicle.plateNumber,brand:vehicle.brand,model:vehicle.model,color:vehicle.color,vehicleType:vehicle.vehicleType,status:vehicle.status}:{id:undefined,plateNumber:'',brand:'',model:'',color:'',vehicleType:'SMALL',status:1});dialog.value=true}
async function submit(){if(!await formRef.value?.validate())return;saving.value=true;try{await saveVehicle({action:form.id?'UPDATE':'CREATE',...form});ElMessage.success(form.id?'车辆已更新':'车辆已添加');dialog.value=false;await load()}finally{saving.value=false}}
async function setDefault(vehicle:Vehicle){await ElMessageBox.confirm(`将 ${vehicle.plateNumber} 设为默认车辆？`,'操作确认');await saveVehicle({action:'SET_DEFAULT',id:vehicle.id});ElMessage.success('默认车辆已更新');await load()}
async function remove(vehicle:Vehicle){await ElMessageBox.confirm(`确定删除车辆 ${vehicle.plateNumber}？此操作不可撤销。`,'删除确认',{type:'warning'});await deleteVehicle(vehicle.id);ElMessage.success('车辆已删除');await load()}
onMounted(load)
</script>
<template><div><div class="title-actions"><div><h1 class="page-title">我的车辆</h1><p class="page-subtitle">最多绑定 3 辆车，一个车牌只能绑定一次。</p></div><el-button type="primary" :disabled="list.length>=3" @click="open()">新增车辆</el-button></div><AppLoading v-if="loading"/><AppEmpty v-else-if="!list.length" description="还没有绑定车辆"/><div v-else class="card-grid"><VehicleCard v-for="vehicle in list" :key="vehicle.id" :vehicle="vehicle" @edit="open" @default="setDefault" @remove="remove"/></div><el-alert v-if="list.length>=3" title="已达到 3 辆车上限" type="warning" :closable="false" class="limit"/><el-dialog v-model="dialog" :title="form.id?'编辑车辆':'新增车辆'" width="min(520px, 92vw)" destroy-on-close><el-form ref="formRef" :model="form" :rules="rules" label-position="top"><el-form-item label="车牌号码" prop="plateNumber"><el-input v-model="form.plateNumber" maxlength="8" placeholder="京A12345"/></el-form-item><div class="two"><el-form-item label="品牌"><el-input v-model="form.brand"/></el-form-item><el-form-item label="型号"><el-input v-model="form.model"/></el-form-item><el-form-item label="颜色"><el-input v-model="form.color"/></el-form-item><el-form-item label="车辆类型" prop="vehicleType"><el-select v-model="form.vehicleType" class="full-width"><el-option label="小型车" value="SMALL"/><el-option label="新能源车" value="NEW_ENERGY"/></el-select></el-form-item></div><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :value="1">正常</el-radio><el-radio :value="0">停用</el-radio></el-radio-group></el-form-item></el-form><template #footer><el-button @click="dialog=false">取消</el-button><el-button type="primary" :loading="saving" @click="submit">保存</el-button></template></el-dialog></div></template>
<style scoped>.title-actions{display:flex;justify-content:space-between;align-items:start}.limit{margin-top:20px}.two{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}@media(max-width:600px){.two{grid-template-columns:1fr}}</style>
