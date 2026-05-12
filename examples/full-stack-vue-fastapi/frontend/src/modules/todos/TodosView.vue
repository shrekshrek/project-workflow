<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import TodoItem from './TodoItem.vue'
import { createTodo, deleteTodo, fetchTodos, updateTodo } from './api'
import type { Todo } from './types'

const todos = ref<Todo[]>([])
const total = ref(0)
const newText = ref('')
const loading = ref(false)
const submitting = ref(false)

async function loadTodos() {
  loading.value = true
  try {
    const data = await fetchTodos()
    todos.value = data.items
    total.value = data.total
  } catch {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  const text = newText.value.trim()
  if (!text) return
  submitting.value = true
  try {
    const todo = await createTodo({ text })
    todos.value = [todo, ...todos.value]
    total.value += 1
    newText.value = ''
  } catch {
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}

async function handleToggle(id: number, done: boolean) {
  try {
    const updated = await updateTodo(id, { done })
    todos.value = todos.value.map((t) => (t.id === id ? updated : t))
  } catch {
    ElMessage.error('更新失败')
  }
}

async function handleRemove(id: number) {
  try {
    await deleteTodo(id)
    todos.value = todos.value.filter((t) => t.id !== id)
    total.value -= 1
    ElMessage.success('已删除')
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(loadTodos)
</script>

<template>
  <div class="todos-page">
    <h2>我的 TODO ({{ total }})</h2>

    <div class="new-row">
      <ElInput
        v-model="newText"
        placeholder="新建一条..."
        maxlength="500"
        @keyup.enter="handleCreate"
      />
      <ElButton type="primary" :loading="submitting" :disabled="!newText.trim()" @click="handleCreate">
        添加
      </ElButton>
    </div>

    <ElCard v-loading="loading">
      <ElEmpty v-if="!loading && todos.length === 0" description="还没有 TODO" />
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle="handleToggle"
        @remove="handleRemove"
      />
    </ElCard>
  </div>
</template>

<style scoped>
.todos-page {
  max-width: 640px;
  margin: 0 auto;
}
.new-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
</style>
