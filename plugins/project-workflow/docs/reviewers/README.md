# Reviewer specs

This directory is the canonical reviewer / auditor / researcher layer for project-workflow.

Runtime agents and skills must reference these specs instead of redefining the review method in tool-specific files. Claude Code uses `agents/*.md`. Codex plugin skills read these specs directly and may run them through any available Codex subagent. Those files are adapters: they define runtime metadata, tool availability, and dispatch details.

| Reviewer | Purpose |
|---|---|
| [`agents-md-reviewer`](agents-md-reviewer.md) | L2 project-convention compliance review |
| [`spec-reviewer`](spec-reviewer.md) | L3 implementation-vs-spec compliance review |
| [`spec-quality-reviewer`](spec-quality-reviewer.md) | subjective pre-implementation spec quality review |
| [`decision-completeness-auditor`](decision-completeness-auditor.md) | generated-decision traceability audit |
| [`tech-researcher`](tech-researcher.md) | stack/library/tool choice research |
| [`codebase-explorer`](codebase-explorer.md) | existing-codebase structure survey |

If a runtime adapter conflicts with one of these specs, the spec wins. Update this directory first, then update the Claude/Codex adapter files.
