import { useApi } from '@/composables/useApi'
import type { Todo, TodoCreate, TodoListResponse, TodoUpdate } from './types'

export function fetchTodos() {
  return useApi<TodoListResponse>('/todos', { method: 'GET' })
}

export function createTodo(payload: TodoCreate) {
  return useApi<Todo>('/todos', { method: 'POST', data: payload })
}

export function updateTodo(id: number, payload: TodoUpdate) {
  return useApi<Todo>(`/todos/${id}`, { method: 'PATCH', data: payload })
}

export function deleteTodo(id: number) {
  return useApi<void>(`/todos/${id}`, { method: 'DELETE' })
}
