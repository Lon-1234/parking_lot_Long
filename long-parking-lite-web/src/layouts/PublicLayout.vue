<script setup lang="ts">import AppHeader from '@/components/common/AppHeader.vue'; import AppFooter from '@/components/common/AppFooter.vue'</script>
<template><div class="layout"><AppHeader /><main><slot /></main><AppFooter /></div></template>
<style scoped>.layout{min-height:100vh;display:flex;flex-direction:column}.layout main{flex:1}</style>
