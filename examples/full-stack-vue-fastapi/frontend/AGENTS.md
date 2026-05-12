# frontend/AGENTS.md

Tier 级 AI 协作约定。父级:`../AGENTS.md`(项目级)。

## Tier 范围

Vue 3 SPA — UI / 路由 / 状态管理 / API 调用。**不写**业务计算(业务在后端)。

## 技术栈

- Vue 3 + Composition API + `<script setup lang="ts">`(**不用** Options API)
- 路由:Vue Router 4
- 状态:Pinia(setup store 风格,**不用** Options Store)
- UI 库:Element Plus(`unplugin-vue-components` 自动按需引入,**不全量 import**)
- HTTP:axios 封装在 `src/composables/useApi.ts`(**不在组件里裸 import axios**)
- 构建:Vite 6
- 类型:TypeScript strict,所有 props/emit 必须类型化

## 模块结构

```
src/
├── main.ts              入口:挂 Vue + Pinia + Router + Element Plus
├── App.vue              根组件
├── router/
│   └── index.ts         路由表 + auth guard
├── stores/
│   └── user.ts          全局 user store(JWT + currentUser)
├── composables/
│   └── useApi.ts        统一 HTTP(自动加 Authorization,统一错误处理)
├── layouts/
│   └── DefaultLayout.vue 顶栏 + 主体 slot
├── components/          全局通用组件
└── modules/             业务模块
    ├── auth/
    │   ├── LoginView.vue
    │   ├── RegisterView.vue
    │   └── api.ts       此 module 的 API 调用集合(用 useApi)
    └── todos/
        ├── TodosView.vue
        ├── TodoItem.vue
        └── api.ts
```

**模块纪律**:
- 每个 `modules/<name>/` 是个业务单元,有自己的 `api.ts` + view + 内部组件
- **跨模块只通过 store / api 通信**,不直接 import 别人的组件(`<TodoItem>` 不能被 auth module 用)
- 真共用的提到 `components/`(全局),仍跨模块用就提案讨论

## 路由约定

新增 view **必须**在 `src/router/index.ts` 注册;route name 用 kebab-case(`'todos-list'`)。
受保护页加 `meta.requiresAuth: true`,guard 自动重定向到 `/login`。

## HTTP 调用约定

**只通过 `composables/useApi.ts`** 调后端,**禁止**裸 `axios.get(...)` 或 `fetch(...)`。

```typescript
// modules/todos/api.ts
import { useApi } from '@/composables/useApi'

export function fetchTodos() {
  return useApi<TodoListResponse>('/todos', { method: 'GET' })
}
```

为什么:
- 统一加 `Authorization: Bearer <token>`
- 统一处理 401(自动登出 + 跳 login)
- 统一错误 toast / loading

## Element Plus 用法

- 组件:无需 `import { ElButton } ...`,`unplugin-vue-components` 自动识别 `<ElButton>` 标签
- 图标:`import { Plus } from '@element-plus/icons-vue'`(显式 import,组件按需)
- 全局服务(ElMessage / ElMessageBox):**显式 import**(自动 import 有 SSR 坑)

## TypeScript

- `strict: true` 已开,**禁止** `any`(改用 `unknown` + 类型 narrow)
- API 响应类型从后端 schema 镜像(放 `modules/<name>/types.ts`)
- 后端 Pydantic 模型变了 → 同步改前端 type

## Boundaries(覆盖父级)

- ✅ 加 view / 组件 / store / composable
- ⚠️ 改 `useApi.ts` / `router/index.ts` guard 逻辑 / `main.ts` 全局插件
- 🚫 在组件里硬编码 backend URL(用 `import.meta.env.VITE_API_BASE_URL` 或走 useApi)
- 🚫 把 password 存进 localStorage / sessionStorage / Pinia(只存 JWT)
