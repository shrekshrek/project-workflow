<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import type { Todo } from './types'

defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  toggle: [id: number, done: boolean]
  remove: [id: number]
}>()

async function handleRemove(id: number) {
  try {
    await ElMessageBox.confirm('确定删除这条 TODO?', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    emit('remove', id)
  } catch {
    // 用户取消,忽略
  }
}
</script>

<template>
  <div class="todo-item">
    <ElCheckbox
      :model-value="todo.done"
      @update:model-value="(val) => emit('toggle', todo.id, !!val)"
    />
    <span class="text" :class="{ done: todo.done }">{{ todo.text }}</span>
    <ElButton link type="danger" size="small" @click="handleRemove(todo.id)">
      删除
    </ElButton>
  </div>
</template>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}
.todo-item:last-child {
  border-bottom: none;
}
.text {
  flex: 1;
  font-size: 14px;
}
.text.done {
  text-decoration: line-through;
  color: #909399;
}
</style>
