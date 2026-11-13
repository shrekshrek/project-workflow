# Multi-tier examples

供 [project-personalize](../../docs/actions/project-personalize.md) 和 feature 规划参考。
仅在实际 tier 存在值得持久记录的局部差异时使用，按
[Guidance Placement Contract](../../docs/actions/agents-md-revise.md#guidance-placement-contract) 确定位置。

## 文件清单

| 模板 | 用途 |
|---|---|
| `service-tier.AGENTS.md.example` | 服务侧命令、源码与测试位置、责任边界及特有约定 |
| `ui-tier.AGENTS.md.example` | UI 侧命令、模块组织、界面与状态约定 |
| 对应 `*.CLAUDE.md.example` | 项目采用 Claude alias 时使用，一行 `@AGENTS.md` |

## 使用

从真实目录、配置和已接受决定填写适用字段，删除不适用节。模板提供组织参考，不规定技术选型、
模块布局或审批政策。没有持久局部差异时沿用父级指导。

`AGENTS.md` 只写相对父级的差量；复杂说明链接到项目已有文档。采用 Claude 兼容层时，同目录
`CLAUDE.md` 使用一行 alias。按当前请求授权应用，具体新增政策先与用户沟通。
