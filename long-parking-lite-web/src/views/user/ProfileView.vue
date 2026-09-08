<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const auth=useAuthStore();const formRef=ref<FormInstance>();const saving=ref(false);const form=reactive({nickname:auth.userInfo?.nickname??'',avatar:auth.userInfo?.avatar??'',phone:auth.userInfo?.phone??'',email:auth.userInfo?.email??''})
const rules:FormRules={nickname:[{required:true,message:'请输入昵称',trigger:'blur'}],phone:[{required:true,pattern:/^1\d{10}$/,message:'请输入 11 位手机号',trigger:'blur'}],email:[{required:true,type:'email',message:'请输入有效邮箱',trigger:'blur'}]}
async function submit(){if(!await formRef.value?.validate())return;saving.value=true;try{await auth.updateProfile(form);ElMessage.success('个人资料已更新')}finally{saving.value=false}}
</script>
<template><div><h1 class="page-title">个人资料</h1><p class="page-subtitle">修改昵称、头像地址和联系方式。</p><div class="panel form-page"><el-form ref="formRef" :model="form" :rules="rules" label-position="top"><el-form-item label="用户名"><el-input :model-value="auth.userInfo?.username" disabled/></el-form-item><el-form-item label="昵称" prop="nickname"><el-input v-model="form.nickname"/></el-form-item><el-form-item label="头像地址"><el-input v-model="form.avatar" placeholder="可选，填写图片 URL"/></el-form-item><el-form-item label="手机号" prop="phone"><el-input v-model="form.phone"/></el-form-item><el-form-item label="邮箱" prop="email"><el-input v-model="form.email"/></el-form-item><el-button type="primary" :loading="saving" @click="submit">保存修改</el-button></el-form></div></div></template>
