# 工程陷阱清单(示范短版)

> 这是 plugin 自身的 example-of-one 证据库:展示一份成熟的 project-local gotchas ledger 长什么样。每条来自真实项目的已复现故障,格式是**反例 → 正例 → 为什么**。
>
> **怎么用**:gotchas ledger 是 project-scoped 文档 —— 每个项目维护自己的(`project-init` 生成空 ledger,真实踩坑后才追加);不要把别的项目/别的栈的条目复制进来。本文件曾收录 10 条 fastapi-nuxt4 实践条目,完整历史版本在 git history;现保留 3 条通用示范。
>
> **出口纪律**(见 workflow.md §0.3 归口注 + template 版头部):升格即删条、前提失效即删条 —— 本文件 2026-07 从 10 条清到 3 条,就是这条纪律的执行示范。

## 1. `PROJECT_NAME` 隔离不解决 host 端口冲突(🌐 Docker)

**反例**:依赖 `COMPOSE_PROJECT_NAME` 隔离多项目,然后默认占 5432/8000 标准端口。两个项目同时跑 → `0.0.0.0:5432 already allocated`。

**为什么**:Compose project name 只隔离容器名 / 卷名 / 网络名;host 端口是全局资源。容器内连接走 docker 内网服务名(`postgres:5432`,永远不变),只有 host 端映射需要按项目错开(文档声明或默认非标端口)。

## 2. scripts 命名要分层,生命周期和 tier 内操作不要混(🌐 Monorepo / task runner)

**反例**:`"be:test": "docker-compose up -d db && sleep 2 && setup && cd backend && test"` —— 一个"跑测试"命令暗中起容器、切目录;用户跑完离开,容器还在后台。

**正例**:`bootstrap` / `cleanup` 管环境生命周期;`dev:*` 管开发态起停;`be:*` / `fe:*` 是 tier 内操作,假设环境已起,**不主动启服务**。

**为什么**:资源生命周期必须清晰 —— 谁起、谁停、谁清;违反单一职责的编排命令让用户对系统状态失去感知。

## 3. 测试基础设施要"不存在就建",别假设它已存在(🌐 通用)

**反例**:测试直连 `<db>_test`,数据库没建就报 `database does not exist`;新机器 clone 下来第一次跑必挂。

**正例**:test setup 先连管理入口检查资源是否存在,不存在就创建(DB / config 目录 / log 文件同理)。

**为什么**:测试基建的隐式前置条件是"只在原作者机器上能跑"的最大来源;显式 ensure 一次,永久消除。

## 跨条总结(怎么避免下次再踩)

1. **命名避开内置词**:`pnpm setup` / `npm test` / `git init` —— 起名前先问"是不是内置"
2. **结构化字符串别 `str.replace`**:URL / 路径 / SQL 用 parser
3. **不存在就建,别假设**:test DB / config 目录 / log 文件
4. **资源生命周期清晰**:scripts 谁起、谁停、谁清,别在 tier 内操作里偷偷起服务
5. **依赖的隐式 extras 写明**:别等运行时 ImportError 才发现
