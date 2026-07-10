---
description: Vue 3 + Vite detailed rules (path-scoped to frontend TS/Vue)
paths:
  - "frontend/**/*.{ts,vue}"
---

<!--
来源:此 starter 浓缩了 Vue 3 / Vite / Pinia / VueUse 社区共识
(参考 Vue 官方 docs / Anthony Fu blog / Vue Mastery / Pinia docs)。
落地到具体项目时请筛 / 删 / 增,并写 docs/adr/000N-adopt-vue-best-practices.md 留追溯。
本文件触发条件:Claude 读取 frontend/**/*.{ts,vue} 任一文件时自动 inject。
若 tier 命名不是 frontend(如 web / app),改上方 paths 列表。
-->

# Vue 3 + Vite 项目约定

> Tier-level critical rules 在 `frontend/AGENTS.md § Vue 3 + Vite`(≤ 5 条);
> 本文件是 detailed rules,path-scoped 加载,`frontend/*.{ts,vue}` 编辑时才进 context。

## 组件设计

- Composition API only,**禁** Options API(`data() { return ... }` 体系)
- `<script setup>` 必用,**不**写 `export default { setup() {} }`(冗余)
- 单文件单组件;`PascalCase.vue` 命名,template 内引用走 PascalCase 或 kebab-case 二选一项目一致
- props destructure 用 `defineProps<{ name: string; age?: number }>()` 类型化,**不**用 runtime `{ name: { type: String } }`

## Reactivity

- `ref()` 用 primitive(string / number / boolean)
- `reactive()` 用 object;**禁** `reactive()` 嵌套 `ref()`(unref 行为不直观)
- 模板内自动 unref(`ref.value` 不需要写);`<script>` 里访问 `.value`
- `computed()` 用于派生状态,**不**在 watch 里 set state(用 computed 替代)
- `watch(source, cb)` 显式 source;`watchEffect()` 用于自动收集 deps 但少用(deps 不显式易隐性 bug)

## Composables

- 命名 `useXxx.ts`(eslint-plugin-vue 识别)
- 文件位置:`src/composables/` 或 `src/modules/<ctx>/composables/`
- 返回值用 object(`return { state, action }`);**禁** array(顺序耦合)
- Cleanup 走 `onScopeDispose(() => ...)`,在 `setup` 外 effect 也能 cleanup

## Pinia(state management)

- `defineStore('<name>', () => { ... })` setup style only,**禁** options style
- store 文件:`src/stores/<name>.ts` 或 `src/modules/<ctx>/stores/<name>.ts`
- 异步逻辑放 store 的 action,**不**放组件 setup
- 跨 store 通信:被引用 store `useOtherStore()` 注入,**禁** import store 文件 + ref 互相穿(循环依赖)
- Persist(若需):用专门插件而非手写 localStorage(具体库选型见 ADR)

## Routing(Vue Router v4)

- 路由 lazy load:`component: () => import('./Foo.vue')`
- Route guard 走 `beforeEnter` 或全局 `beforeEach` + `meta` 字段;**禁** 在组件 mounted 里手动 redirect
- params / query 类型化:`route.params.id as string` 不安全;用类型断言函数封装(如需 file-based + 自动类型生成,见 ADR)

## UI 库(若用,如 Element Plus / Naive UI / Nuxt UI)

- **优先**用 UI 库自带组件,**不**自己造重复
- **不**混用多个 UI 库(Element Plus + Ant Design 会样式漂)
- 按需引入(对应 UI 库的官方 resolver,如 Element Plus 用 `unplugin-vue-components` + EP resolver),**禁** full bundle import(`import 'foo-ui/dist/index.css'` 全包打入)

## TypeScript

- `<script setup lang="ts">` 必用
- defineProps / defineEmits 用 generic type 形式:`defineEmits<{ (e: 'change', val: string): void }>()`
- Imports 走 `@/` alias(Vite `resolve.alias` + tsconfig paths)
- 全局 type 放 `src/types/` 或 `env.d.ts`(`*.vue` 模块声明)

## 性能

- `v-memo` 用于大列表条件 re-render skip;**不**滥用(增加心智负担)
- `defineAsyncComponent` 包大组件,配 `<Suspense>` 显示 fallback
- `shallowRef` / `shallowReactive` 用于深 object 不需要深响应时
- `v-show` vs `v-if`:频繁切换 + 始终渲染开销小 → `v-show`;条件少切换 → `v-if`

## 测试(Vitest + @vue/test-utils)

- `mount` vs `shallowMount`:测组件交互用 `mount`(完整渲染),测纯组合(props/emits)用 `shallowMount`
- 用户交互优先 `wrapper.find(...).trigger('click')` + DOM assertion,**不**直接调 component instance method
- Pinia testing:`createTestingPinia({ createSpy: vi.fn })` 注入测试 store
- async update 用 `await wrapper.vm.$nextTick()` 或 `flushPromises()`
- Mock API:优先 service-worker level mock(如 msw),避免在测试里直接 mock HTTP client 模块(`vi.mock('axios' / 'ofetch' / 'ky' / ...)`)
