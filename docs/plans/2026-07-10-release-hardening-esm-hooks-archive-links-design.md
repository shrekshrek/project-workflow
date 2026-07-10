# Release hardening: ESM hooks and archive links

> Date: 2026-07-10
> Status: implemented in v3.4.0 from reproduced release-blocker findings

## Goal

Remove two release blockers found by end-to-end testing and align the generated project index with the actual `project-init` output.

## Decisions

1. Both shared Claude hook and Codex wrapper use the `.cjs` extension. Hook execution must be independent of a target project's nearest `package.json` module type.
2. Hook configuration, documentation, project-init output checks, and regression fixtures reference `.cjs` only.
3. Archiving preserves the semantic target of every local Markdown link. After `git mv`, relative destinations are recomputed from the old file location to the new file location; links within the moved feature remain local.
4. Feature archive and spec reconcile both run the same deterministic relocation utility and fail before completion when a local link target is missing.
5. The Codex package includes the relocation utility so installed skills do not depend on the source repository.
6. The starter `AGENTS.md` does not list `README.md`, because the minimum project-init lane does not create it.

## Validation

- Run Claude and Codex hooks from a fixture whose root package declares `type: module`; valid, empty, patch, and malformed inputs all exit zero.
- Move a feature fixture containing ADR, domain-doc, sibling-file, anchor, and reference-style links; verify external relative paths gain the required depth while sibling links remain unchanged.
- Verify missing local link targets fail the lifecycle-link check.
- Run template contracts, lifecycle-link tests, package sync, adapter parity, Claude/Codex plugin validation, and diff checks.
