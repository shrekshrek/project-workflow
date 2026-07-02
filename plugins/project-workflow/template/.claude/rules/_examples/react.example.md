---
description: React + Vite detailed rules (path-scoped to frontend TS/TSX)
globs: frontend/**/*.{ts,tsx}
---

<!--
来源:此 starter 浓缩了 React 18+ / Vite / React Router 社区共识
(参考 React 官方 docs / kentcdodds blog / Mark Erikson Redux+React 文章)。
落地到具体项目时请筛 / 删 / 增,并写 docs/adr/000N-adopt-react-best-practices.md 留追溯。
本文件触发条件:Claude 读取 frontend/**/*.{ts,tsx} 任一文件时自动 inject。
若 tier 命名不是 frontend(如 web / app),改上方 globs。
-->

# React + Vite 项目约定

> Tier-level critical rules 在 `frontend/AGENTS.md § React + Vite`(≤ 5 条);
> 本文件是 detailed rules,path-scoped 加载,`frontend/*.{ts,tsx}` 编辑时才进 context。

## 组件设计

- 函数组件 + hooks only,**禁** class 组件
- **禁** `React.FC<Props>`(隐式 children + 类型推断弱),用 `(props: Props) => JSX.Element`
- Props destructure 在函数签名:`function Foo({ name, age }: Props)` 而非 `props.name`
- 单文件单组件;`PascalCase.tsx` 命名,文件内 `export default` 的组件名跟文件名一致

## Hooks 纪律

- **Rules of Hooks** 严守:顶层调用,不在 condition / loop / nested function 里调
- 自定义 hook 必 `useXxx` 命名(eslint-plugin-react-hooks 强制识别)
- 自定义 hook 返回值用 array(数量 ≤ 2,如 `[state, setState]`)或 object(数量 ≥ 3,命名清晰)

## State 选型

- 局部组件 state → `useState`
- 多步状态机 / 多字段联动 → `useReducer`(避免多 useState 之间漂移)
- 跨组件共享 → Zustand / Jotai / Redux Toolkit(选一,**不混用**)
- 服务端数据缓存 → TanStack Query / SWR(**不**手写 fetch + useState + useEffect)

## Effects(useEffect)

- deps array 必显式;**禁** 漏依赖
- `// eslint-disable-next-line react-hooks/exhaustive-deps` **仅在**写明 reason 注释时允许
- Cleanup function:订阅 / interval / abort controller 必返回 cleanup
- Race condition:用 `AbortController` + 状态变量(`let cancelled = false`)防 stale 数据写入
- **不**在 useEffect 里做派生计算(用 `useMemo`)或事件响应(用 event handler)

## Reactivity

- `useState` 更新用函数形式 `setX(prev => ...)` 避免 stale closure
- 重计算初始化走 lazy:`useState(() => expensive())` 而非 `useState(expensive())`
- `useMemo` / `useCallback` **仅在**有真实 perf 问题或下游 ref 比较时用 — 默认不要

## List 渲染

- `key` prop 必 **stable id**(数据库 id / uuid),**禁** array index 作 key(增删时渲染错位)
- 大列表(> 100 行)用 `@tanstack/react-virtual` virtualization
- 列表项 component 用 `React.memo` 包,key 变才重渲染

## Routing(React Router v6+)

- 路由 lazy load:`const Foo = lazy(() => import('./Foo'))` + 顶层 `<Suspense fallback={...}>`
- Loader / action 模式优先(data router API),不在组件里 fetch + useEffect
- Route guard 走 wrapper 组件 + `<Navigate>` 重定向,不在 useEffect 里 setState navigate

## 性能

- React DevTools Profiler 测了真有问题再优化,**禁** premature `useMemo` / `useCallback`
- Code splitting:路由级别 + 大 lib(如 chart / editor)动态 import
- `React.Suspense` + `lazy` 处理 code split;**不**用第三方 SuspenseList(v6 未稳)

## TypeScript

- `strict: true` + `noImplicitAny`:`any` 必显式标注 reason
- Props interface 用 `interface` 不 `type`(extend 友好)
- Event handler 类型:`React.MouseEvent<HTMLButtonElement>` 等显式标注
- Imports 走 `@/` alias(`vite.config.ts` `resolve.alias` + `tsconfig.json` `paths`)

## 测试(Vitest + React Testing Library)

- `render(<Component />, { wrapper: AllProviders })`(BrowserRouter / store provider 等)
- 查询优先级:`getByRole` > `getByLabelText` > `getByText` > `getByTestId`(最后兜底)
- 用户交互用 `userEvent`(real interaction),**不**用 `fireEvent`(底层 API,不模拟 user flow)
- Async assertion:`await screen.findByText(...)` 或 `waitFor(() => ...)`
- Mock API:优先 service-worker level mock(如 msw / Mock Service Worker),避免在测试里直接 mock HTTP client 模块(`vi.mock('axios' / 'ofetch' / 'ky' / ...)` 或 `jest.mock(...)`)
