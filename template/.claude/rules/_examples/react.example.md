---
description: React + Vite detailed rules (path-scoped to frontend TS/TSX)
paths:
  - "frontend/**/*.{ts,tsx}"
---

<!--
来源:此 starter 浓缩了 React 18+ / Vite / React Router 社区共识
(参考 React 官方 docs / kentcdodds blog / Mark Erikson Redux+React 文章)。
按项目实际选择适用规则，来源记录在采用它的约定中。
本文件触发条件:Claude 读取 frontend/**/*.{ts,tsx} 任一文件时自动 inject。
若 tier 命名不是 frontend(如 web / app),改上方 paths 列表。
-->

# React + Vite 项目约定

> 项目特有规则由适用的 AGENTS.md 与本文件分工维护。

## 组件设计

- 组件形式、Props 类型与文件组织沿用项目约定

## Hooks 纪律

- **Rules of Hooks** 严守:顶层调用,不在 condition / loop / nested function 里调
- 自定义 hook 必 `useXxx` 命名(eslint-plugin-react-hooks 强制识别)

## State 选型

- 局部组件 state → `useState`
- 多步状态机 / 多字段联动 → `useReducer`(避免多 useState 之间漂移)
- 跨组件共享 → 沿用项目已采用的状态管理方式
- 服务端数据缓存 → 沿用项目已有的数据获取与缓存方案

## Effects(useEffect)

- deps array 必显式;**禁** 漏依赖
- `// eslint-disable-next-line react-hooks/exhaustive-deps` **仅在**写明 reason 注释时允许
- Cleanup function:订阅 / interval / abort controller 必返回 cleanup
- Race condition:用 `AbortController` + 状态变量(`let cancelled = false`)防 stale 数据写入
- 派生值在渲染中计算，事件响应放在对应 handler

## Reactivity

- `useState` 更新用函数形式 `setX(prev => ...)` 避免 stale closure
- 重计算初始化走 lazy:`useState(() => expensive())` 而非 `useState(expensive())`
- `useMemo` / `useCallback` **仅在**有真实 perf 问题或下游 ref 比较时用 — 默认不要

## List 渲染

- `key` prop 必 **stable id**(数据库 id / uuid),**禁** array index 作 key(增删时渲染错位)

## Routing(React Router v6+)

- 路由 lazy load:`const Foo = lazy(() => import('./Foo'))` + 顶层 `<Suspense fallback={...}>`
- Loader / action 模式优先(data router API),不在组件里 fetch + useEffect
- Route guard 走 wrapper 组件 + `<Navigate>` 重定向,不在 useEffect 里 setState navigate

## 性能

- React DevTools Profiler 测了真有问题再优化,**禁** premature `useMemo` / `useCallback`
- Code splitting:路由级别 + 大 lib(如 chart / editor)动态 import

## TypeScript

- `strict: true` + `noImplicitAny`:`any` 必显式标注 reason
- Event handler 类型:`React.MouseEvent<HTMLButtonElement>` 等显式标注
- Imports 使用项目已配置的路径与别名

## 测试(Vitest + React Testing Library)

- `render(<Component />, { wrapper: AllProviders })`(BrowserRouter / store provider 等)
- 查询优先级:`getByRole` > `getByLabelText` > `getByText` > `getByTestId`(最后兜底)
- 用户交互优先用 `userEvent` 模拟实际操作
- Async assertion:`await screen.findByText(...)` 或 `waitFor(() => ...)`
- Mock API:优先 service-worker level mock(如 msw / Mock Service Worker),避免在测试里直接 mock HTTP client 模块(`vi.mock('axios' / 'ofetch' / 'ky' / ...)` 或 `jest.mock(...)`)
