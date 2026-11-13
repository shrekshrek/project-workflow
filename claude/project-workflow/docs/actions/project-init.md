# project-init

Default entry for setting up project-workflow in a new or existing repository.

## Use When

Use for initial setup or to check an existing setup. Inspect the target once under Workflow below.
If a scaffold generator needs an empty directory, run it before onboarding. Confirm explicitly
before setting up the project-workflow source repository itself.

## Inputs

- Target directory, defaulting to the current working directory.

Do not ask for language, framework, package manager, tier layout, test tools, hosting, or deployment. A baseline-compatible target has no repository evidence for those decisions. Optional research and tier/rule assets remain available after repository evidence or an explicit need exists.

## Outputs

- `AGENTS.md`
- `CLAUDE.md` as the one-line `@AGENTS.md` alias
- `.gitignore`
- `docs/specs/index.md`
- `docs/adr/README.md`
- `docs/gotchas.md`

These six outputs apply to neutral setup. Existing-project outputs follow [project-personalize](project-personalize.md).

## Workflow

If the target is a Git repository with no commits yet, explain during setup that first-feature acceptance needs a baseline commit of the initial project state before feature changes.

1. Resolve the target plus the host-local plugin template read-only. Enumerate the complete target population including dotfiles, excluding only version-control metadata. Classify the six mapped destinations as all absent, all matching, or partial/custom/occupied; inspect other content only far enough to distinguish incidental material from project evidence. For an inspection-only request, report the current setup and any gaps, then stop before staging, writing or handing off to personalization. All matching plus only incidental material is `already initialized`; stop before staging or any materializer invocation. For partial/custom/occupied destinations or project evidence (code, manifests, configuration or project-specific guidance), continue directly with the host’s `project-personalize` action for the same target and authorized scope. Pass the classification, preserve existing configuration, and finish through that action. The remaining steps apply only to neutral setup. Ask one focused routing question only when the significance of existing material is genuinely ambiguous.
2. When all six destinations are absent and remaining content is incidental, require the already-resolved plugin template and `scripts/materialize-project-baseline.cjs`, then materialize into a disposable staging directory with `--stage <staging> --target <target>`.
3. Show the complete target-mapped six-file list. No setup questionnaire or decision audit is needed because the baseline contains no stack decisions; a setup request authorizes this deterministic no-clobber baseline.
4. Apply once with `--apply-staged <staging> <target>`. Normalize an existing target-root symlink to its real directory. Strict no-clobber and destination-symlink preflight reject the complete apply before copying; an absent target below a symlinked ancestor is rejected, and copy failure rolls back files created by that apply.
5. Validate the exact six-file baseline, the unchanged pre-existing population, the one-line alias, placeholder absence, and deferred commands/paths.

## Invariants

- Staging leaves the target unchanged until the single apply step.
- Existing incidental content is preserved byte-for-byte and is not interpreted, merged into, or advertised by the neutral baseline.
- Unknown commands and paths remain explicitly deferred until repository evidence exists.
- Optional plugin assets remain installed but are not copied into the project.
- Rejection or failure leaves pre-existing files untouched.
- Successful completion means the neutral workflow baseline is ready. The target can proceed to a code scaffold, direct work, or [`feature-init`](feature-init.md); application structure may still be undecided.
- At the setup handoff, surface any project planning gap identified under the shared conventions. When application structure is undecided, explain the relevant next step; `feature-init` owns whether architecture belongs inside the first feature or a separate change and which artifact it needs.
- `project-personalize` may enrich deferred conventions after repository evidence exists, but it is not required to complete `project-init`.
