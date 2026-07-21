# project-init

Canonical P0 action for creating a neutral project-workflow baseline in an empty or genuinely new target.

## Use When

- The target is empty apart from version-control metadata.
- The user wants project-workflow guidance before a code scaffold exists.

Use [`project-personalize`](project-personalize.md) for every non-empty existing codebase or copied scaffold. If the target looks like the project-workflow source repository, warn and require explicit confirmation.

## Inputs

- Target directory, defaulting to the current working directory.

Do not ask for language, framework, package manager, tier layout, test tools, hooks, hosting, or deployment. An empty directory has no repository evidence for those decisions. Optional research and tier/rule/hook assets remain available after a scaffold or explicit need exists.

## Outputs

- `AGENTS.md`
- `CLAUDE.md` as the one-line `@AGENTS.md` alias
- `.gitignore`
- `docs/specs/index.md`
- `docs/adr/README.md`
- `docs/gotchas.md`

Do not generate application code, nested/tier instructions, scoped rules, hooks, settings, concrete ADRs, or domain documents by default.

## Workflow

1. Inspect the target read-only. Redirect every non-empty codebase to `project-personalize`.
2. Materialize the plugin template into a disposable staging directory with `scripts/materialize-project-baseline.cjs --stage <staging> --target <target>`.
3. Show the complete target-mapped six-file list. No setup questionnaire or decision audit is needed because the baseline contains no stack decisions; explicit invocation authorizes this deterministic no-clobber baseline.
4. Apply once with `--apply-staged <staging> <target>`. Normalize an existing target-root symlink to its real directory. Strict no-clobber and destination-symlink preflight reject the complete apply before copying; an absent target below a symlinked ancestor is rejected, and copy failure rolls back files created by that apply.
5. Validate the exact file set, the one-line alias, placeholder absence, and deferred commands/paths.

## Invariants

- Staging leaves the target unchanged until the single apply step.
- Unknown commands and paths remain explicitly deferred until repository evidence exists.
- Optional plugin assets remain installed but are not copied into the project.
- Rejection or failure leaves pre-existing files untouched.
- The next normal step is to create the code scaffold, then run `project-personalize`.
