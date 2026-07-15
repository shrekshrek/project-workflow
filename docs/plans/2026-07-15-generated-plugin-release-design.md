# Generated dual-plugin release design

> Date: 2026-07-15
> Status: implemented and locally validated, including package validators and isolated Claude/Codex installs; not committed or released. `plugin-dist` is generated only by the release workflow.

## Decision

The main branch owns one methodology core and two host-native adapters. It no longer commits a self-contained Codex mirror or treats the repository root as the Claude plugin package.

```text
docs/ + template/ + runtime scripts/   canonical core
adapters/claude/                       Claude skills, named agents, manifest
adapters/codex/                        Codex skills, manifest
```

`scripts/build-plugin-packages.cjs` assembles two self-contained packages under a caller-provided or temporary output root. Both packages receive the same canonical action, reviewer, template, and runtime-script assets. Maintainer-only fixtures and deterministic checkers stay source-only. Adapter files are copied only into their matching host package. Generated files are never edited as source.

The generated package layout is:

```text
claude/project-workflow/
codex/project-workflow/
```

The repository marketplaces point to those subdirectories on the generated `plugin-dist` branch. The existing version-check workflow rebuilds and replaces that branch only for a versioned release commit on `main`, after the complete source and package checks pass. No second repository, package registry, signing service, or long-lived local `dist/` tree is introduced.

## Capability boundary

The release refactor changes packaging only. The public surface remains nine actions on both hosts. `docs/actions/` remains the only workflow contract and `docs/reviewers/` remains the only reviewer contract.

Claude continues to package six thin named-agent adapters. Codex follows its native plugin and subagent model: its skills run the bundled reviewer specifications through an available Codex subagent, with the documented main-session fallback when delegation is unavailable. The release package does not create or install project/user `.codex/agents/*.toml`; named Codex agents are optional host configuration, not required workflow capability.

The source checks verify action parity, manifest version parity, host-marker isolation, reviewer dispatch references, and the absence of Claude agents from the Codex adapter. Package checks additionally verify both generated roots, required runtime assets, local Markdown links, plugin manifests, and execution of each host's packaged hook. The builder flattens the shared hook implementation into the Codex-private path so the Codex package remains self-contained after Claude-private assets are filtered. Existing endpoint fixtures continue to prove the workflow outcomes rather than the directory arrangement.

## Alternatives rejected

- Keep `source: "./"`: simplest source tree, but Claude installs the Codex mirror and maintainer-only files.
- Commit two sibling self-contained packages on `main`: visually symmetric but creates three maintained copies of the core.
- Share runtime files with symlinks: supported only under specific installer paths and weakens local/Windows predictability.
- Split repositories or publish through npm: adds coordination without improving workflow behavior.

## Rollout and failure handling

The build is deterministic and writes only to a fresh output directory. It fails on missing source assets, version mismatch, invalid package structure, or broken packaged links. Publication runs only after all repository checks pass and force-updates only the generated `plugin-dist` branch.

Before the marketplace switch is considered releasable, local builds must pass Claude plugin validation, Codex plugin validation, adapter/contract/fixture checks, and source plus packaged Markdown-link checks. When reviewer or feature-init generation behavior changes, the applicable real-model smoke defined under `docs/examples/` must also be recorded; deterministic fixtures do not substitute for it. A failed publication leaves `main` unchanged; the previous `plugin-dist` commit remains installable until a later successful run.
