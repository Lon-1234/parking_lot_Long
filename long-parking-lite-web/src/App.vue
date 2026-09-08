<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import OperatorLayout from '@/layouts/OperatorLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const route = useRoute()
const layouts = { public: PublicLayout, user: UserLayout, operator: OperatorLayout, admin: AdminLayout }
const currentLayout = computed(() => layouts[route.meta.layout ?? 'public'])
</script>

<template>
  <component :is="currentLayout"><RouterView /></component>
</template>
