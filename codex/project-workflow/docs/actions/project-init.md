# project-init

Canonical action for creating a neutral project-workflow baseline in a baseline-compatible target.

## Use When

- None of the six baseline destinations exists, and the target has no project evidence that needs to shape the working agreement.
- The target may be empty or may contain incidental material such as standalone references, exports, or notes that do not establish project commands, source/test paths, conventions, architecture, product truth, or current truth.
- The user wants the neutral project-workflow baseline in that target now.

If all six baseline files match the bundled template and any remaining content is incidental, report `already initialized` and make no changes; the baseline itself is not project evidence for `project-personalize`. Use [`project-personalize`](project-personalize.md) when project evidence exists, including a generated or copied scaffold, code, manifests/configuration, or project-specific documentation that establishes commands, structure, architecture, conventions, product truth, or current truth. Also use it when any baseline destination is partial, custom, or otherwise occupied, because initialization must not merge or overwrite it. If a shallow inspection cannot distinguish incidental material from project evidence, ask one focused routing question instead of guessing. If a code scaffold generator must receive the same target while it is empty, run that generator first and use `project-personalize` afterward. If the target looks like the project-workflow source repository, warn and require explicit confirmation.

## Inputs

- Target directory, defaulting to the current working directory.

Do not ask for language, framework, package manager, tier layout, test tools, hooks, hosting, or deployment. A baseline-compatible target has no repository evidence for those decisions. Optional research and tier/rule/hook assets remain available after repository evidence or an explicit need exists.

## Outputs

- `AGENTS.md`
- `CLAUDE.md` as the one-line `@AGENTS.md` alias
- `.gitignore`
- `docs/specs/index.md`
- `docs/adr/README.md`
- `docs/gotchas.md`

Do not generate application code, nested/tier instructions, scoped rules, hooks, settings, concrete ADRs, or domain documents by default.

## Workflow

1. Resolve the target plus the host-local plugin template read-only. Enumerate the complete target population including dotfiles, excluding only version-control metadata. Classify the six mapped destinations as all absent, all matching, or partial/custom/occupied; inspect other content only far enough to distinguish incidental material from project evidence. All matching plus only incidental material is `already initialized`; stop before staging or any materializer invocation. Partial/custom/occupied destinations or project evidence use `project-personalize`. Ask one focused routing question only when the significance of existing material is genuinely ambiguous.
2. When all six destinations are absent and remaining content is incidental, require the already-resolved plugin template and `scripts/materialize-project-baseline.cjs`, then materialize into a disposable staging directory with `--stage <staging> --target <target>`.
3. Show the complete target-mapped six-file list. No setup questionnaire or decision audit is needed because the baseline contains no stack decisions; explicit invocation authorizes this deterministic no-clobber baseline.
4. Apply once with `--apply-staged <staging> <target>`. Normalize an existing target-root symlink to its real directory. Strict no-clobber and destination-symlink preflight reject the complete apply before copying; an absent target below a symlinked ancestor is rejected, and copy failure rolls back files created by that apply.
5. Validate the exact six-file baseline, the unchanged pre-existing population, the one-line alias, placeholder absence, and deferred commands/paths.

## Invariants

- Staging leaves the target unchanged until the single apply step.
- Existing incidental content is preserved byte-for-byte and is not interpreted, merged into, or advertised by the neutral baseline.
- Unknown commands and paths remain explicitly deferred until repository evidence exists.
- Optional plugin assets remain installed but are not copied into the project.
- Rejection or failure leaves pre-existing files untouched.
- Successful completion means the neutral workflow baseline is ready. The target can proceed to a code scaffold, direct work, or [`feature-init`](feature-init.md); application structure may still be undecided.
- When application structure is undecided, report two optional next paths without choosing or invoking either: keep the minimum necessary architecture inside the first feature, or start a separate architecture-shaped full-lane change only when it will govern several later features or has its own durable consumer.
- `project-personalize` may enrich deferred conventions after repository evidence exists, but it is not required to complete `project-init`.
