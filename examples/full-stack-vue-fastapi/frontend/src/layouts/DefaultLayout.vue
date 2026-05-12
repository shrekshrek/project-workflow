<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push({ name: 'login' })
}
</script>

<template>
  <ElContainer class="layout">
    <ElHeader class="header">
      <div class="header-inner">
        <h1 class="title">scaffold-v2</h1>
        <div class="actions">
          <span v-if="userStore.currentUser" class="user-info">
            {{ userStore.currentUser.display_name || userStore.currentUser.email }}
          </span>
          <ElButton size="small" @click="handleLogout">退出</ElButton>
        </div>
      </div>
    </ElHeader>
    <ElMain>
      <RouterView />
    </ElMain>
  </ElContainer>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}
.header {
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}
.header-inner {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info {
  color: #606266;
  font-size: 14px;
}
</style>
