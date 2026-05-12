<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  // 启动时如果有 token 试着恢复用户(刷新页面不掉登录)
  if (userStore.token) {
    userStore.fetchMe().catch(() => userStore.logout())
  }
})
</script>

<template>
  <RouterView />
</template>
