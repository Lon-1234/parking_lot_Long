<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { register } from '@/api/auth'

const router = useRouter(); const formRef = ref<FormInstance>(); const loading = ref(false); const form = reactive({ username: '', password: '', confirmPassword: '', nickname: '', phone: '', email: '' })
const rules: FormRules = { username: [{ required: true, min: 3, message: '用户名至少 3 位', trigger: 'blur' }], nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }], phone: [{ required: true, pattern: /^1\d{10}$/, message: '请输入 11 位手机号', trigger: 'blur' }], email: [{ required: true, type: 'email', message: '请输入有效邮箱', trigger: 'blur' }], password: [{ required: true, min: 6, message: '密码至少 6 位', trigger: 'blur' }], confirmPassword: [{ validator: (_rule, value, callback) => value === form.password ? callback() : callback(new Error('两次密码不一致')), trigger: 'blur' }] }
async function submit() { if (!await formRef.value?.validate()) return; loading.value = true; try { await register(form); ElMessage.success('注册成功，请登录'); await router.push('/login') } finally { loading.value = false } }
</script>
<template><div class="page-shell"><div class="panel form-page"><h1 class="page-title">注册车主账号</h1><p class="page-subtitle">普通注册仅创建 USER 角色；工作人员和管理员账号由后台维护。</p><el-form ref="formRef" :model="form" :rules="rules" label-position="top"><div class="two-col"><el-form-item label="用户名" prop="username"><el-input v-model="form.username" /></el-form-item><el-form-item label="昵称" prop="nickname"><el-input v-model="form.nickname" /></el-form-item><el-form-item label="手机号" prop="phone"><el-input v-model="form.phone" /></el-form-item><el-form-item label="邮箱" prop="email"><el-input v-model="form.email" /></el-form-item><el-form-item label="密码" prop="password"><el-input v-model="form.password" type="password" show-password /></el-form-item><el-form-item label="确认密码" prop="confirmPassword"><el-input v-model="form.confirmPassword" type="password" show-password /></el-form-item></div><el-button type="primary" size="large" class="full-width" :loading="loading" @click="submit">创建账号</el-button></el-form></div></div></template>
<style scoped>.two-col{display:grid;grid-template-columns:1fr 1fr;gap:0 18px}@media(max-width:620px){.two-col{grid-template-columns:1fr}}</style>
