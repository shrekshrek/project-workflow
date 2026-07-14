# Capability-shift assessment and v3.x contraction plan

> Date: 2026-07-13 (WP4/WP5 added and external review incorporated 2026-07-14)
> Status: WP1, WP2, WP3 Phase A-C, and WP4 Steps 1-2 are implemented. WP3 release acceptance remains gated on recorded model executions of the feature-init scenario matrix; deterministic fixture/materializer checks are not a substitute. WP5 remains deferred, and structural changes remain gated on the §10.4 checkpoint. This is v3.x maintenance contraction, not v4: no public action surface or contract changes.

## Goal

Decide whether project-workflow still earns its cost as frontier-model execution capability rises, and which contractions follow. Structural contractions (action-surface merge, lane widening, pillar restructure) were examined and rejected. Approved work is internal: doc calibration, dedup, adapter-thinning inventory, and discipline realignment. The shipped runtime footprint and the combined adapter + canonical execution surface must fall; maintainer-only evidence assets are measured separately rather than hidden inside a single repo-wide line target.

## Principles

- **Size discipline**: no work package may make the shipped runtime or combined `skills/` + `docs/actions/` execution surface heavier. Maintainer-only fixtures/checkers may add source lines only for a named behavior-equivalence or regression consumer and are reported separately; do not delete useful tests or unrelated content merely to offset additions.
- **Model-agnostic**: the methodology serves weaker/cheaper models too. Content that mainly helps weaker models is condensed or annotated as model-sensitive, never deleted or expanded. Methodology docs must stay generation-neutral (no specific model names).
- **Evidence discipline**: changes require an observed gap or incident-grade fact, not intuition about model capability.

## Assessment

1. Proposition 1 (Verification) worsens as model throughput grows: unreviewed output per unit of human validation increases, and intent still lives only with the user. Spec-as-contract and the L1/L2/L3 endpoint remain the highest-leverage assets.
2. Proposition 3 (Drift) is amplified by multi-agent parallelism (a shipped-product reality in 2026): sessions share no memory, and `AGENTS.md` shifts toward a coordination protocol across agent instances.
3. Proposition 2 (Context-as-RAM) keeps its core claim; its numeric tactics (line budgets, `/clear`/`/compact` timing, sub-agent thresholds) are model-sensitive and age fastest.
4. Ceremony load was re-baselined by the [2026-07-10 anti-ceremony pass](archive/2026-07-10-anti-ceremony-gates-design.md); every mandatory step has a named consumer. No known failure is attributable to process weight.
5. Objective duplication exists in the Claude adapter: feature-location logic and auditor dispatch blocks appear in ~5 skills each; the spec-driven §3.7 mechanical checklist is maintained in three places. Repo change frequency is weekly, so a missed-copy fork is a near-term risk.
6. workflow.md §0.1 already states the throughput asymmetry and the no-cross-session-memory premise. The remaining gap is small: the explicit capability-trend framing ("stronger models worsen Proposition 1 and amplify Proposition 3; they do not obsolete the workflow") — a 1–2 sentence addition, not a missing argument.
7. A single-point discipline conflict exists: root `AGENTS.md` (修改纪律) declares `workflow.md` / `docs/gotchas.md` stack-neutral, while `docs/gotchas.md` (351 lines, self-described stack-biased) and workflow.md §8 (~66 lines Nuxt/FastAPI) are stack-specific — and README plus workflow §1.7 consistently describe gotchas as an example-of-one evidence library. The drift is in the one AGENTS.md sentence, not a three-way conflict. Because `docs/` is mirrored into the Codex release package, stack content occupies ~830 lines repo-wide.
8. Thinning headroom is real but its evidence is bounded: Claude `skills/` total 1,403 lines vs Codex 274 for the same 9 actions (descriptive headroom, not a target). The Claude `agents/` directory (6 adapters, ~18 lines, zero restatement) proves the thin pattern only for read-only reviewer wrappers; generative, file-writing actions are unproven in thin form on the Claude runtime. Local restatement near execution steps can also carry attention/compliance value — "canonical copy is readable" does not by itself prove a restatement is behavior-free.
9. Script layer: `relocate-markdown-links.cjs` and `check-markdown-links.cjs` independently implement the same link-parsing primitives (~80–100 duplicated lines). No incident yet, and the dual implementations currently act as accidental redundancy — a shared parser without independent fixtures would convert diversity into a common-mode failure.

## Decisions

1. **No action-surface merge** (9 → 7 rejected). Users pay per-invocation step cost, not per-action-count cost; the merges maximize churn while shared logic already lives in `scripts/` or disappears with dedup.
2. **No pillar or proposition restructure now**; re-evaluate at the workflow.md §10.4 checkpoint (2026-11) with community evidence. Checkpoint agenda additions: (a) whether multi-agent parallel development deserves a first-class methodology section — a candidate addition, not contraction; (b) whether the committed Codex mirror (`plugins/project-workflow/`, ~6.5k lines, ~40% of the tracked repo) should become a release-time build artifact instead — halves the per-line cost of every `docs/` change with zero functional impact, but is a structural release-engineering change and needs the local-marketplace dependency confirmed first.
3. **Lane criteria (spec-driven §3.2.5) unchanged.** They anchor on blast radius, which is model-independent.
4. **Adapter thinning proceeds as relocation with a four-way classification** (WP3). Every line in a thick Claude skill is: restatement safe to delete (canonical copy is mandatory reading), restatement kept for proximity/compliance value (explicitly classified, not auto-deleted), incident-derived invariant (lift into the canonical action spec — after lifting, Codex gains the same protection), or runtime-specific content (keep). No invariant may be deleted, only moved up a layer. No preset per-skill line count and no preset total reduction: final size is the output of behavior-equivalence validation.
5. **Onboarding pointer-ization rejected.** README (English) and quickstart (Chinese) overlap is bilingual surface duplication serving different audiences; quickstart's "when to skip" table is the intentional self-containedness of anti-ceremony Decision 9. Only an authority-pointer annotation is worth adding — folded into WP1.
6. **Implementation and acceptance state.** WP1, WP2, WP3 Phase A-C, and WP4 Steps 1-2 are implemented. WP3 is not release-accepted until actual Claude/Codex runtime executions are recorded against the generative-action matrix. WP5 remains gated on independent parser golden fixtures.

## Work packages

**WP1 — minor documentation revision (small, net-flat).** Add 1–2 generation-neutral sentences to workflow.md §0.1 Propositions 1/3 (capability-trend framing; multi-agent drift amplification). Annotate §6.2 numeric tactics as model-sensitive (annotation, not forced condensing). Add authority-pointer annotations ("canonical: workflow §9") to the README/quickstart tables that mirror workflow §9. No model names enter methodology docs; §0/§2/§6 structure unchanged.

**WP2 — mechanical dedup (net-negative), with one named home per shared logic.** Auditor dispatch boundary → `docs/reviewers/decision-completeness-auditor.md`; §3.7 mechanical table → the canonical action doc; feature-location convention and `PLUGIN_ROOT` resolution → one designated existing file (named in the implementation PR). Prefer pointing at existing files over creating new shared files. No step-semantics changes.

**WP3 — adapter thinning.**

- *Phase A (approved) — inventory only, no behavior change.* Classify every step of the 9 Claude skills under the four categories of Decision 4, with per-step traceability. Output: a classification table plus the list of invariants to lift into `docs/actions/`.
- *Phase B/C (implemented, release-gated) — pilot and rollout.* The feature-init matrix covers lane classification, target-root and NNN numbering, brownfield/greenfield shape detection, mechanical no-clobber of existing directories, `{{TODO}}` retention for unresolved details, module-ownership non-guessing, and `PLUGIN_ROOT` fallback. Deterministic fixtures exercise the materializer but run no generative model, so actual adapter executions must still be recorded before release acceptance. The thinning rollout is independently revertible. No public action change was introduced.

**WP4 — discipline realignment for stack content.**

- *Step 1 (approved, in-repo, ~5 lines).* Reword root `AGENTS.md` to position `docs/gotchas.md` as the example-of-one evidence library (stack bias allowed), `template/docs/gotchas.md` as the stack-neutral methodology artifact, and workflow.md §8 as an explicitly exempted demonstration appendix.
- *Step 2 (in-repo, independent).* Slim `docs/gotchas.md` directly: the 351 lines are the *previous* project's ledger (fastapi-nuxt4 practice) parked in the methodology repo — a category error, since gotchas ledgers are project-scoped artifacts by this methodology's own document classification. Keep only a demonstrative short version (2–3 generic entries plus the cross-cutting summary, ~30–50 lines) showing what a mature ledger looks like. No cross-repo migration: git history preserves the full content permanently, and the external project can recover its own ledger from history if it ever wants it. Risk is low but not zero: target-local `docs/gotchas.md` is a runtime L2 input (`feature-done` Step 4 includes it when present), so self-hosted runs see a shorter file — an improvement, since the stack entries never applied to this repo's code anyway. Net reduction ≈ −600 lines repo-wide (sync mirror doubles every `docs/` line); §8 slimming optional under the same rule.

**WP5 — script-layer dedup (deferred).** Precondition: an independent golden fixture suite (input → expected link set) exercising the parsing primitives, so a shared parser cannot silently fail in both the relocator and the checker at once. Until those fixtures exist, the two independent implementations retain verification value and stay as they are. Dropped sub-items: `aggregateVerdict` alignment (5 lines, canonical is prose) and action-list discovery (only matters if the action set changes, which Decision 1 rules out).

## Non-goals

- Do not merge L1/L2/L3; do not remove proof bundle, current-truth, or archive lifecycle; do not weaken reviewer zero-finding evidence contracts — independent review is the anti-self-confirmation mechanism whose value rises with model strength.
- Do not add a new public action, agent, telemetry file, or shared-reference file that merely relocates bulk without deleting it.
- Do not write model-generation names into methodology docs.

## Validation

- This document: `node scripts/check-markdown-links.cjs` passes.
- WP1: link check passes; wording generation-neutral; §0/§2/§6 structure unchanged.
- WP2: `check-adapter-parity.js`, `check-workflow-contracts.cjs`, and reviewer mutation smoke stay green; each deduplicated logic has exactly one authoritative home cited by all pointers; net line delta across `skills/` is negative.
- WP3 Phase A: classification table exists with per-step traceability; zero behavior change (`git diff` limited to the inventory artifact). Phase B/C: scenario matrix passes with equivalent outcomes pre/post thinning; no unanchored decisions per §1.12; parity and workflow contracts green; net delta across `skills/` + `docs/actions/` is negative.
- WP4 Step 1: the AGENTS.md sentence, README, and workflow §1.7/§8 narratives agree; link check passes. Step 2: remaining short ledger keeps all inbound references resolvable; removed content is verifiably in git history; `sync-codex-plugin.js --check` and link check green.
- WP5 (when unlocked): golden fixtures pass against both consumers; sync whitelist unchanged; net line delta negative.

Closeout size accounting versus `HEAD` (2026-07-14): Codex shipped package `6768 → 6652` lines (`-116`); Claude skills `1403 → 1307` (`-96`); canonical actions `513 → 557` (`+44`), so the combined execution surface is `-52`. The full source working tree, including untracked planning/test assets, is larger; that maintainer overhead is explicit and is not presented as repo-wide contraction. Release-only assessment/inventory documents should be archived or removed after the release record no longer needs them.
