# Reviewer specs

This directory is the canonical reviewer / auditor / researcher layer for project-workflow.

Runtime agents and skills must reference these specs instead of redefining the review method in tool-specific files. Claude Code uses `adapters/claude/agents/*.md`. Codex plugin skills read the same specs and must use a Codex subagent whenever the owning action marks a reviewer boundary applicable and dispatch capability/capacity exist. Those files are adapters: they define runtime metadata, tool availability, and dispatch details.

| Reviewer | Purpose |
|---|---|
| [`agents-md-reviewer`](agents-md-reviewer.md) | L2 project-convention compliance review |
| [`spec-reviewer`](spec-reviewer.md) | L3 implementation-vs-spec compliance review |
| [`spec-quality-reviewer`](spec-quality-reviewer.md) | requirements reconciliation plus subjective pre-implementation quality and conditional architecture adequacy |
| [`decision-completeness-auditor`](decision-completeness-auditor.md) | generated-decision traceability audit |
| [`tech-researcher`](tech-researcher.md) | stack/library/tool choice research |
| [`codebase-explorer`](codebase-explorer.md) | existing-codebase structure survey |

If a runtime adapter conflicts with one of these specs, the spec wins. Update this directory first, then update the Claude/Codex adapter files.

## Reviewer execution contract

The owning action decides whether a reviewer, auditor, or researcher boundary is applicable. `N/A` is valid only when that action defines it, such as low-risk light-lane L2 or subjective review after failed mechanical prerequisites.

At every applicable boundary, a host adapter with dispatch capability and available capacity must use its native subagent mechanism. Each execution dispatch must create a fresh subagent invocation for that role and scope; do not retask, reopen, or send follow-up work to an existing reviewer instance. Invoking the owning action requires no extra workflow confirmation; host security approvals still apply.

When an owning action declares reviewer boundaries independent, dispatch them in parallel if capacity permits. If capacity permits only one fresh invocation at a time, dispatch sequentially; this is not main-session fallback. Scheduling does not change either reviewer's inputs, evidence requirements, or fail-closed result.

Reviewer progress messages are status-only and non-authoritative. They must not expose provisional findings for the owning action to repair or aggregate. Each invocation returns one terminal report only after its full applicable population is complete; the owning action waits for that terminal report before acting on review results.
If a reviewer discovers that required caller-supplied input or prior-cycle evidence is missing or unreadable,
it must terminate with the failure form defined by its canonical role and owning action; roles whose verdict
contract defines `UNRELIABLE` return one terminal `UNRELIABLE` report. It must not request the missing material
interactively, send piecemeal questions, or wait for the owning action to supplement the active invocation.

When an owning action explicitly permits same-session reuse, it may reuse a completed result within one snapshot revision only while the canonical role contract, scope, inputs, evidence dependencies, and applicable population are provably unchanged. An owner-defined focused-re-review revision may retain an unaffected result under the same reviewer-specific test even though the cycle-level identity advances for the fix. An owning action may define a transient review cycle that captures inputs once per revision and may declare its own post-review receipt/status writes as non-invalidating; every other relevant endpoint-output change invalidates reuse. A task is the host conversation/thread and may span multiple user turns; a new user turn alone does not end a review cycle. Reuse means reusing result evidence, never an agent instance. Record execution mode as `fresh-subagent`, `result-reuse`, `main-session fallback`, or allowed `N/A`; a `result-reuse` entry must retain or reference the original execution evidence.

Main-session fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity. The same canonical role contract still applies, and the action report must include `Reviewer execution` with the role, mode, completion status, and observed reason or `none`. If required dispatch is silently skipped or this evidence is absent, fail closed: the affected gate cannot pass and a pre-apply action cannot treat the review boundary as satisfied.

Reviewers consume prerequisite/check evidence supplied by the owning action. They must not rerun, expand, or substitute for the owning action's mechanical gate unless a role specification explicitly owns such execution. An evidence entry identifies the mapped obligation/rule IDs, command or assertion, execution mode, result/status, relevant-input scope, concise totals when applicable, and original execution-evidence reference. Missing or unreadable required execution evidence makes the review `UNRELIABLE`; evidence that reliably demonstrates a role-level compliance gap remains a finding under that role's verdict contract.

Focused re-review is allowed only in a later explicit owning-action invocation, as one new snapshot revision in
the same task and review cycle, while the original full-population evidence remains addressable and the
unaffected population is unchanged. It covers the findings and their dependency closure, consumes rerun
affected L1 evidence, uses a fresh invocation for every affected reviewer population, and fails closed on
unverified applicable items. Content or path changes inside that declared fix closure are expected; changes
outside it, changes to unaffected scope/input/contract, or uncertain impact require a new full-population
review cycle. Crossing a user turn inside the same task does not by itself invalidate the cycle. A terminal
review result never authorizes the owning action to repair and redispatch inside that same explicit invocation.
