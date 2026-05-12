<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { ApiError } from '@/composables/useApi'

const userStore = useUserStore()
const router = useRouter()

const formRef = ref<FormInstance>()
const form = reactive({
  email: '',
  password: '',
  displayName: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '至少 8 位', trigger: 'blur' },
  ],
}

const submitting = ref(false)

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await userStore.register(form.email, form.password, form.displayName || undefined)
    ElMessage.success('注册成功')
    router.push('/')
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      ElMessage.error('该邮箱已注册')
    } else {
      ElMessage.error('注册失败,稍后再试')
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
        <h2>注册</h2>
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
            autocomplete="new-password"
            show-password
          />
        </ElFormItem>
        <ElFormItem label="昵称(可选)" prop="displayName">
          <ElInput v-model="form.displayName" />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" :loading="submitting" native-type="submit" class="submit">
            注册
          </ElButton>
        </ElFormItem>
        <div class="hint">
          已有账号?<RouterLink to="/login">去登录</RouterLink>
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
