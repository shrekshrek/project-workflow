---
name: project-init
description: "Initialize the neutral six-file project-workflow baseline when its destinations are absent and existing content, if any, does not require personalization. Preserve incidental files; route project evidence or baseline conflicts to project-personalize."
---

# Project Init (Codex)

Match the user's language. Read [`../../../../docs/actions/project-init.md`](../../../../docs/actions/project-init.md) completely before acting; it is the canonical contract.

1. Resolve the target from the argument or cwd plus the plugin root as the nearest ancestor containing `.codex-plugin/plugin.json`, and require its template. Enumerate the complete target population including dotfiles, excluding version-control metadata from content classification. Classify the six destinations as all absent, all with byte-matching template contents, or partial/custom/occupied. Inspect remaining content only far enough to distinguish incidental material from project evidence. All matching plus only incidental material is already initialized; stop before staging or materializer invocation. Redirect project evidence or any occupied non-matching destination to `$project-personalize`; ask one focused routing question only when the distinction is genuinely ambiguous.
2. When all six destinations are absent and remaining content is incidental, require the plugin root's baseline materializer.
3. Stage with `scripts/materialize-project-baseline.cjs --stage <staging> --target <target>` while leaving the target unchanged.
4. Show the six target-mapped files, then apply once with `--apply-staged <staging> <target>`; explicit invocation already authorizes this deterministic no-clobber baseline.
5. Validate the exact six-file baseline, unchanged pre-existing content, alias, placeholder absence, and deferred commands/paths. Report that the neutral workflow baseline is ready for a scaffold, direct work, or `$feature-init`; application structure may still be undecided and personalization is not a required follow-up. If it is undecided, present but do not invoke two next paths: keep minimum architecture inside the first feature, or use a separate architecture-shaped full change only when it governs several later features or has its own durable consumer.

Preserve incidental content without interpreting or merging it. Do not ask stack questions, generate code/rules/hooks/tier files, run agents, or commit.
