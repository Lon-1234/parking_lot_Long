<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Lock, User, DataBoard } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const auth=useAuthStore();const router=useRouter();const formRef=ref<FormInstance>();const loading=ref(false);const form=reactive({username:'admin',password:'123456'});const rules:FormRules={username:[{required:true,message:'请输入管理员用户名',trigger:'blur'}],password:[{required:true,min:6,message:'请输入至少 6 位密码',trigger:'blur'}]}
async function submit(){if(!await formRef.value?.validate())return;loading.value=true;try{const result=await auth.login(form);if(result.userInfo.roleCode!=='ADMIN'){auth.reset();ElMessage.error('该账号不是管理员');return}ElMessage.success('管理员登录成功');await router.replace('/admin/dashboard')}finally{loading.value=false}}
</script>
<template><div class="admin-login"><section class="login-card"><div class="icon"><el-icon><DataBoard/></el-icon></div><h1>管理控制台</h1><p>仅 ADMIN 角色可进入</p><el-form ref="formRef" :model="form" :rules="rules" label-position="top"><el-form-item label="管理员账号" prop="username"><el-input v-model="form.username" size="large" :prefix-icon="User"/></el-form-item><el-form-item label="密码" prop="password"><el-input v-model="form.password" size="large" type="password" show-password :prefix-icon="Lock" @keyup.enter="submit"/></el-form-item><el-button type="primary" size="large" class="full-width" :loading="loading" @click="submit">进入控制台</el-button></el-form><RouterLink to="/login">返回普通登录</RouterLink></section></div></template>
<style scoped lang="scss">.admin-login{min-height:calc(100vh - 136px);display:grid;place-items:center;padding:30px;background:linear-gradient(135deg,#102c36,#1c5357)}.login-card{width:min(430px,100%);padding:38px;border-radius:20px;background:white;box-shadow:0 25px 70px rgba(0,0,0,.22)}.icon{display:grid;place-items:center;width:55px;height:55px;border-radius:16px;background:#e8f5f2;color:var(--brand);font-size:28px}.login-card h1{margin:18px 0 5px}.login-card>p{margin:0 0 25px;color:var(--muted)}.login-card>a{display:block;margin-top:20px;text-align:center;color:var(--brand);font-size:14px}</style>
