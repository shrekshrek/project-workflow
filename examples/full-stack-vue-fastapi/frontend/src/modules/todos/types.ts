/**
 * Todos 响应类型 — 镜像后端 src/todos/schemas.py。
 * 后端 schema 变了就来这里同步改。
 */

export interface Todo {
  id: number
  user_id: number
  text: string
  done: boolean
  created_at: string
  updated_at: string
}

export interface TodoListResponse {
  items: Todo[]
  total: number
}

export interface TodoCreate {
  text: string
}

export interface TodoUpdate {
  text?: string
  done?: boolean
}
