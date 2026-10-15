---
description: Vue 3 + Vite detailed rules (path-scoped to frontend TS/Vue)
paths:
  - "frontend/**/*.{ts,vue}"
---

<!--
来源:此 starter 浓缩了 Vue 3 / Vite / Pinia / VueUse 社区共识
(参考 Vue 官方 docs / Anthony Fu blog / Vue Mastery / Pinia docs)。
按项目实际选择适用规则，来源记录在采用它的约定中。
本文件触发条件:Claude 读取 frontend/**/*.{ts,vue} 任一文件时自动 inject。
若 tier 命名不是 frontend(如 web / app),改上方 paths 列表。
-->

# Vue 3 + Vite 项目约定

> 项目特有规则由适用的 AGENTS.md 与本文件分工维护。

## 组件设计

- 组件 API 风格、Props 声明、命名与文件组织沿用项目约定

## Reactivity

- 根据状态的替换与共享方式选择 `ref()` 或 `reactive()`
- 模板内自动 unref(`ref.value` 不需要写);`<script>` 里访问 `.value`
- `computed()` 用于派生状态,**不**在 watch 里 set state(用 computed 替代)
- `watch(source, cb)` 显式 source;`watchEffect()` 用于自动收集 deps 但少用(deps 不显式易隐性 bug)

## Composables

- 命名 `useXxx.ts`(eslint-plugin-vue 识别)
- 文件位置:`src/composables/` 或 `src/modules/<ctx>/composables/`
- Cleanup 走 `onScopeDispose(() => ...)`,在 `setup` 外 effect 也能 cleanup

## Pinia(state management)

- store 形式沿用项目约定
- store 文件:`src/stores/<name>.ts` 或 `src/modules/<ctx>/stores/<name>.ts`
- 异步逻辑跟随状态与业务责任的实际所有者
- 跨 store 通信:被引用 store `useOtherStore()` 注入,**禁** import store 文件 + ref 互相穿(循环依赖)
- 持久化按项目已有方案和数据生命周期处理

## Routing(Vue Router v4)

- 路由 lazy load:`component: () => import('./Foo.vue')`
- Route guard 走 `beforeEnter` 或全局 `beforeEach` + `meta` 字段;**禁** 在组件 mounted 里手动 redirect
- params / query 类型化:`route.params.id as string` 不安全;用类型断言函数封装(如需 file-based + 自动类型生成,见 ADR)

## UI 库(若用,如 Element Plus / Naive UI / Nuxt UI)

- **优先**用 UI 库自带组件,**不**自己造重复
- **不**混用多个 UI 库(Element Plus + Ant Design 会样式漂)
- 按需引入(对应 UI 库的官方 resolver,如 Element Plus 用 `unplugin-vue-components` + EP resolver),**禁** full bundle import(`import 'foo-ui/dist/index.css'` 全包打入)

## TypeScript

- 使用项目已采用的 TypeScript 配置与组件类型声明方式
- Imports 使用项目已配置的路径与别名
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
