# Reviewer specs

This directory is the canonical reviewer / auditor / researcher layer for project-workflow.

Runtime agents and skills must reference these specs instead of redefining the review method in tool-specific files. Claude Code uses `adapters/claude/agents/*.md`. Codex plugin skills read these specs directly and must use a Codex subagent whenever an applicable boundary has dispatch capability and capacity. Those files are adapters: they define runtime metadata, tool availability, and dispatch details.

| Reviewer | Purpose |
|---|---|
| [`agents-md-reviewer`](agents-md-reviewer.md) | L2 project-convention compliance review |
| [`spec-reviewer`](spec-reviewer.md) | L3 implementation-vs-spec compliance review |
| [`spec-quality-reviewer`](spec-quality-reviewer.md) | subjective pre-implementation spec quality review |
| [`decision-completeness-auditor`](decision-completeness-auditor.md) | generated-decision traceability audit |
| [`tech-researcher`](tech-researcher.md) | stack/library/tool choice research |
| [`codebase-explorer`](codebase-explorer.md) | existing-codebase structure survey |

If a runtime adapter conflicts with one of these specs, the spec wins. Update this directory first, then update the Claude/Codex adapter files.

## Reviewer execution contract

At every applicable reviewer, auditor, or researcher dispatch boundary, a host adapter with dispatch capability and available capacity must use its native subagent mechanism. Each execution dispatch must create a fresh subagent invocation for that role and scope; do not retask, reopen, or send follow-up work to an existing reviewer instance. Invoking the owning action requires no extra workflow confirmation; host security approvals still apply.

When an owning action explicitly permits same-session reuse, it may reuse a completed result only while the canonical role contract, scope, inputs, applicable population, and relevant endpoint outputs are provably unchanged. Reuse means reusing result evidence, never an agent instance. Record execution mode as `fresh-subagent`, `result-reuse`, `main-session fallback`, or allowed `N/A`; a `result-reuse` entry must retain or reference the original execution evidence.

Main-session fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity. The same canonical role contract still applies, and the action report must include `Reviewer execution` with the role, mode, completion status, and observed reason or `none`. If required dispatch is silently skipped or this evidence is absent, fail closed: the affected gate cannot pass and a pre-apply action cannot treat the review boundary as satisfied.
