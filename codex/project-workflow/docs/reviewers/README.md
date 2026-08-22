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

At every applicable boundary, use an independent reviewer when the host can dispatch one. If the host cannot
dispatch that role, use the main session under the same read-only role contract and evidence. Invoking the owning action requires no extra workflow confirmation; host security approvals
still apply.

Independent reviewer boundaries may run in parallel or sequentially. Scheduling does not change their inputs,
evidence requirements, or verdict contract. Each role retains its independent canonical contract.

Reviewer progress is non-authoritative. The owning action aggregates or acts on findings only after the reviewer
has completed its applicable population.
If a reviewer discovers that required caller-supplied input or prior-cycle evidence is missing or unreadable,
it must terminate with the failure form defined by its canonical role and owning action; roles whose verdict
contract defines `UNRELIABLE` return one terminal `UNRELIABLE` report. It must not request the missing material
interactively, send piecemeal questions, or wait for the owning action to supplement the active invocation.

Each review evaluates one stable owner-supplied snapshot. After relevant implementation or artifact changes,
review again; only unchanged mechanical evidence may be reused under the owning action's L1 rules.

An owning action may define same-run repair-delta reconciliation after a terminal report with complete coverage.
That is a fresh review of a new stable final snapshot, not reuse of the prior verdict: the reviewer receives the
prior same-role report and exact repair delta, rechecks its findings and every delta-affected obligation, validates
that the earlier complete coverage still applies, and returns a new terminal report with the final snapshot
identity. The owning action defines eligibility and falls back to its standard full review; no reviewer report or
delta state becomes a cross-task cache.

Record enough execution evidence to show which role completed, or why an applicable review did not complete.
An applicable review that did not complete blocks the gate; the runtime mechanism used to complete it does not.
When runtime or transport failure prevents a terminal result, the owning action may make exactly one fresh
execution fallback under the same role contract: use another independent reviewer when available, otherwise the
main session. Execution fallback applies only when no terminal result exists.

Reviewers consume prerequisite/check evidence supplied by the owning action. They must not rerun, expand, or substitute for the owning action's mechanical gate unless a role specification explicitly owns such execution. An evidence entry identifies the obligation, rule, or coverage area it supports, the command or assertion, execution mode, result/status, relevant-input scope, concise totals when applicable, and original execution-evidence reference. Missing or unreadable required execution evidence makes the review `UNRELIABLE`; evidence that reliably demonstrates a role-level compliance gap remains a finding under that role's verdict contract.

Reviewers are read-only. The owning action controls any repair or later review cycle.
