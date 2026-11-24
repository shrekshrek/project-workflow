# Reviewer specs

This directory is the canonical reviewer / auditor / researcher layer for project-workflow.

When the action calls for an independent review, dispatch a fresh reviewer with the relevant role contract. Apply the execution contract below when dispatch is unavailable.

| Reviewer | Purpose |
|---|---|
| [`agents-md-reviewer`](agents-md-reviewer.md) | L2 project-convention compliance review |
| [`spec-reviewer`](spec-reviewer.md) | L3 implementation-vs-accepted-feature compliance review |
| [`spec-quality-reviewer`](spec-quality-reviewer.md) | Check requirement sources and readiness to implement; check architecture when applicable |
| [`decision-completeness-auditor`](decision-completeness-auditor.md) | Check sources for generated decisions |
| [`tech-researcher`](tech-researcher.md) | stack/library/tool choice research |
| [`codebase-explorer`](codebase-explorer.md) | existing-codebase structure survey |

If a runtime adapter conflicts with one of these specs, the spec wins. Update this directory first, then update the affected skill entry.

## Reviewer execution contract

The calling action decides whether review, audit or research is needed. Use `N/A` only when that action
allows it, such as when nothing requires independent judgment. If a prerequisite check fails, report the
action's status for a check that was not run; do not label the review inapplicable.

At every applicable boundary, use an independent reviewer when the host can dispatch one. If the host cannot
dispatch that role, use the main session under the same read-only role contract and evidence. Invoking the owning action requires no extra workflow confirmation; host security approvals
still apply.

Reviews may run in parallel or sequentially. Each reviewer follows the same role, input, evidence and verdict
rules either way. Progress updates are not final findings: the calling action uses the result only after
the reviewer has finished all applicable work.
If a reviewer discovers that required caller-supplied input or prior-cycle evidence is missing or unreadable,
it must terminate with the failure form defined by its canonical role and owning action; roles whose verdict
contract defines `UNRELIABLE` return one terminal `UNRELIABLE` report. It must not request the missing material
interactively, send piecemeal questions, or wait for the owning action to supplement the active invocation.

Each review evaluates one stable owner-supplied snapshot. After relevant implementation or artifact changes,
review again; only unchanged mechanical evidence may be reused under the owning action's L1 rules.

Record enough execution evidence to show which role completed, or why an applicable review did not complete.
An applicable review that did not complete blocks the gate; the runtime mechanism used to complete it does not.
When runtime or transport failure prevents a terminal result, the owning action may make exactly one fresh
execution fallback under the same role contract: use another independent reviewer when available, otherwise the
main session. Execution fallback applies only when no terminal result exists.

Use prerequisite and check results supplied by the calling action. Do not run, repeat or add mechanical checks
unless the role explicitly requires that execution. Each evidence entry identifies what it proves
(requirement, rule or coverage area), the command/assertion, execution mode, result, inputs covered,
concise totals when applicable, and the original result reference.
Missing or unreadable required execution evidence makes the review `UNRELIABLE`. Evidence showing an actual
violation is a finding, handled under that role's verdict rules.

Reviewers are read-only and report in the caller’s language. The owning action controls any repair or later review cycle.
