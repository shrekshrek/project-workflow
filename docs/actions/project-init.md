# project-init

Canonical action for creating a neutral project-workflow baseline in an empty or genuinely new target.

## Use When

- The target is empty apart from version-control metadata.
- The user wants the neutral project-workflow baseline in that empty target now.

If the target already contains exactly the neutral baseline plus optional version-control metadata, report `already initialized` and make no changes; the baseline itself is not project evidence for `project-personalize`. Use [`project-personalize`](project-personalize.md) when any other project content exists, including a newly generated scaffold, a copied scaffold, or an existing codebase. If a code scaffold generator must receive the same target while it is empty, run that generator first and use `project-personalize` afterward. If the target looks like the project-workflow source repository, warn and require explicit confirmation.

## Inputs

- Target directory, defaulting to the current working directory.

Do not ask for language, framework, package manager, tier layout, test tools, hooks, hosting, or deployment. An empty directory has no repository evidence for those decisions. Optional research and tier/rule/hook assets remain available after repository evidence or an explicit need exists.

## Outputs

- `AGENTS.md`
- `CLAUDE.md` as the one-line `@AGENTS.md` alias
- `.gitignore`
- `docs/specs/index.md`
- `docs/adr/README.md`
- `docs/gotchas.md`

Do not generate application code, nested/tier instructions, scoped rules, hooks, settings, concrete ADRs, or domain documents by default.

## Workflow

1. Resolve the target plus the host-local plugin template read-only. Enumerate the complete target population including dotfiles, excluding only version-control metadata. The target is an exact neutral baseline only when its path set is the six mapped outputs and every file matches the bundled template. Report that state and stop before staging or any materializer invocation. Redirect a target with any other project content to `project-personalize`.
2. For an empty target, require the already-resolved plugin template and `scripts/materialize-project-baseline.cjs`, then materialize into a disposable staging directory with `--stage <staging> --target <target>`.
3. Show the complete target-mapped six-file list. No setup questionnaire or decision audit is needed because the baseline contains no stack decisions; explicit invocation authorizes this deterministic no-clobber baseline.
4. Apply once with `--apply-staged <staging> <target>`. Normalize an existing target-root symlink to its real directory. Strict no-clobber and destination-symlink preflight reject the complete apply before copying; an absent target below a symlinked ancestor is rejected, and copy failure rolls back files created by that apply.
5. Validate the exact file set, the one-line alias, placeholder absence, and deferred commands/paths.

## Invariants

- Staging leaves the target unchanged until the single apply step.
- Unknown commands and paths remain explicitly deferred until repository evidence exists.
- Optional plugin assets remain installed but are not copied into the project.
- Rejection or failure leaves pre-existing files untouched.
- Successful completion means the neutral workflow baseline is ready. The target can proceed to a code scaffold, direct work, or [`feature-init`](feature-init.md); application structure may still be undecided.
- When application structure is undecided, report two optional next paths without choosing or invoking either: keep the minimum necessary architecture inside the first feature, or start a separate architecture-shaped full-lane change only when it will govern several later features or has its own durable consumer.
- `project-personalize` may enrich deferred conventions after repository evidence exists, but it is not required to complete `project-init`.
