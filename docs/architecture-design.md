# Architecture design guidance

Conditional methodology reference consumed by `feature-init` for architecture-shaped full-lane changes.

## Use boundary

Read this guide only when the selected change establishes or materially changes project-wide application
architecture, such as runtime components or tiers, module ownership, cross-component contracts, data
ownership, durable trust/authorization ownership boundaries, or deployment boundaries. An ordinary permission
rule inside an unchanged trust and responsibility boundary does not trigger this guide by itself.

- Keep the minimum architecture needed by one outcome inside that feature.
- Use a separate architecture-shaped change only when the architecture has its own durable consumer or governs several later features.
- Ordinary features skip this guide.
- [`project-personalize`](actions/project-personalize.md) may supply repository evidence; `feature-init` owns design decisions and handoff readiness.

## Evidence and conversation

Use explicit user decisions, accepted current truth/ADRs, and observed repository evidence. Generic best practice and directory names are not project decisions. Ask only questions whose answers change the selected artifact; dependent decisions proceed in sequence and closely related independent choices may be grouped. When a high-impact choice needs help, present 2-3 compatible options with constraints and trade-offs, but let the user decide. Carry settled choices forward under `feature-init`'s conversational-judgment rule. After the artifact exists, continue the question → user decision → artifact update loop across user turns. Stop only when no high-impact TODO remains or the user explicitly pauses or defers; when paused, report the blockers and do not claim handoff readiness.

Work from outcomes toward structure:

1. **Outcome and context** — identify the selected capability, actors, external systems, non-goals, and why the architecture decision must outlive one implementation step.
2. **Quality constraints** — capture only material performance, availability, security, privacy, compliance, cost, operability, compatibility, or delivery constraints. Preserve unknown thresholds as TODOs.
3. **Responsibilities and ownership** — choose the smallest sufficient component/module/tier population. A named component proves only that it exists; determine its responsibility, owner, lifecycle, and boundary separately.
4. **Contracts and state** — define only applicable API/event/job contracts, data ownership, consistency, failure, retry, idempotency, and migration behavior. Do not infer call direction or sync/async relationships.
5. **Runtime and operations** — resolve deployment units, trust boundaries, scaling, observability, recovery, and external dependencies only when the selected outcomes or constraints require them.
6. **Decisions and verification** — record alternatives and why an option was accepted, identify `ADR_REQUIRED`, make verification executable, and leave unsupported choices as explicit TODOs.

Do not require every topic for every project. Do not add services, tiers, shared modules, infrastructure, or extensibility solely for symmetry or possible future use.

Runtime component, module, deployment unit, and tier are distinct concepts. Multiple named components do not prove separate tiers or paths. Do not load tier examples or choose a Sibling Alignment result (`Align` / `Deviate` / `Codify`) until explicit user or repository evidence establishes the tier/module population and comparison.

## Existing artifact mapping

Record the design in the ordinary full-lane files:

- `spec.md`: outcomes, include/exclude scope, externally meaningful constraints, and verification.
- `plan.md`: module/tier impact, ownership, sibling alignment, contracts/state, runtime decisions, prior decisions, risks, and unresolved items.
- `tasks.md`: decision-resolution work, implementation steps, migrations when applicable, and executable verification.

Keep unresolved choices as TODOs. Create an ADR only after an actual decision satisfies `ADR_REQUIRED`.

## Handoff readiness

Before recommending `spec-quality-check`, confirm:

- selected outcomes and non-goals are explicit;
- every in-scope component/module has a determined responsibility boundary and, when ownership changes design or operation, an owner;
- applicable cross-boundary contracts, state ownership, failure behavior, and deployment constraints are determined;
- accepted decisions have traceable sources and reasons;
- verification can prove the selected architecture supports the outcomes; and
- no unresolved high-impact TODO is silently deferred to coding.

If a high-impact TODO remains, keep the artifact in conversational fill, report the blocker, and do not recommend `spec-quality-check`. Readiness means the selected scope is sufficiently decided for review and implementation; it does not mean designing the whole future system.
