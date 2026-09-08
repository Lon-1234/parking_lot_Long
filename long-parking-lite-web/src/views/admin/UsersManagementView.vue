<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { actOnAdminUser, getAdminUsers } from '@/api/admin'
import type { UserInfo, UserRole } from '@/types/user'
import { ROLE_LABEL } from '@/constants/enums'
import AppPagination from '@/components/common/AppPagination.vue'
import StatusTag from '@/components/common/StatusTag.vue'

const list=ref<UserInfo[]>([]);const total=ref(0);const loading=ref(false);const query=reactive({page:1,pageSize:10,keyword:'',roleCode:undefined as UserRole|undefined,status:undefined as number|undefined})
async function load(){loading.value=true;try{const r=await getAdminUsers(query);list.value=r.list;total.value=r.total}finally{loading.value=false}}
async function changeStatus(user:UserInfo){const status:user['status']=user.status===1?0:1;await ElMessageBox.confirm(`确定${status===0?'禁用':'启用'}用户 ${user.username}？`,'状态确认',{type:'warning'});await actOnAdminUser({action:'CHANGE_STATUS',userId:user.id,status});ElMessage.success('用户状态已更新');await load()}
async function changeRole(user:UserInfo,roleCode:UserRole){await ElMessageBox.confirm(`确定将 ${user.username} 的角色改为 ${ROLE_LABEL[roleCode]}？`,'角色确认',{type:'warning'});await actOnAdminUser({action:'CHANGE_ROLE',userId:user.id,roleCode});ElMessage.success('用户角色已更新');await load()}
function pageChange(page:number,pageSize:number){query.page=page;query.pageSize=pageSize;void load()}onMounted(load)
</script>
<template><div><h1 class="page-title">用户管理</h1><p class="page-subtitle">管理用户状态与三种固定角色。</p><div class="panel"><div class="toolbar"><el-input v-model="query.keyword" clearable placeholder="用户名、昵称或手机号" style="width:240px"/><el-select v-model="query.roleCode" clearable placeholder="全部角色"><el-option v-for="(label,role) in ROLE_LABEL" :key="role" :label="label" :value="role"/></el-select><el-select v-model="query.status" clearable placeholder="全部状态"><el-option label="正常" :value="1"/><el-option label="禁用" :value="0"/></el-select><el-button type="primary" @click="query.page=1;load()">查询</el-button></div><el-table v-loading="loading" :data="list"><el-table-column prop="username" label="用户名" min-width="110"/><el-table-column prop="nickname" label="昵称" min-width="120"/><el-table-column prop="phone" label="手机号" min-width="130"/><el-table-column prop="email" label="邮箱" min-width="180"/><el-table-column label="角色" width="140"><template #default="{row}"><el-select :model-value="row.roleCode" size="small" @change="changeRole(row,$event)"><el-option v-for="(label,role) in ROLE_LABEL" :key="role" :label="label" :value="role"/></el-select></template></el-table-column><el-table-column label="状态" width="90"><template #default="{row}"><StatusTag :label="row.status===1?'正常':'禁用'" :status="row.status===1?1:3"/></template></el-table-column><el-table-column label="操作" width="110"><template #default="{row}"><el-button text :type="row.status===1?'danger':'success'" @click="changeStatus(row)">{{ row.status===1?'禁用':'启用' }}</el-button></template></el-table-column></el-table><AppPagination :page="query.page" :page-size="query.pageSize" :total="total" @change="pageChange"/></div></div></template>
