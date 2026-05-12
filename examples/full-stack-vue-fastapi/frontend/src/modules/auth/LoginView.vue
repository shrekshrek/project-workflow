<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { ApiError } from '@/composables/useApi'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const formRef = ref<FormInstance>()
const form = reactive({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const submitting = ref(false)

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await userStore.login(form.email, form.password)
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string | undefined) || '/'
    router.push(redirect)
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      ElMessage.error('邮箱或密码错误')
    } else {
      ElMessage.error('登录失败,稍后再试')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <ElCard class="auth-card">
      <template #header>
        <h2>登录</h2>
      </template>
      <ElForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="form.email" type="email" autocomplete="email" />
        </ElFormItem>
        <ElFormItem label="密码" prop="password">
          <ElInput
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            show-password
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" :loading="submitting" native-type="submit" class="submit">
            登录
          </ElButton>
        </ElFormItem>
        <div class="hint">
          还没账号?<RouterLink to="/register">去注册</RouterLink>
        </div>
      </ElForm>
    </ElCard>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.auth-card {
  width: 380px;
}
.submit {
  width: 100%;
}
.hint {
  text-align: center;
  color: #909399;
  font-size: 13px;
}
</style>
