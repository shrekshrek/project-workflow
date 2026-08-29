# feature-init

Canonical action for understanding a proposed change and preparing only the durable record it needs.

## Use When

Use when a requested implementation needs tracked acceptance, cross-session handoff, current-truth
synchronization, or contract/risk protection, or the user explicitly asks whether a feature record is useful.
Ordinary questions, diagnosis and discussion remain conversation; do not force an action invocation or
artifact just to answer them. Tiny local fixes can proceed under existing conventions and checks. Reuse an
accepted active feature that already covers the request instead of assigning another number.

A change to durable behavior already declared in `docs/specs/` needs a traceable record and eventual
current-truth synchronization. This does not require additional files or a document-size category.
The action owns discovery and record preparation, not production implementation. Returning from it preserves
the enclosing request and its existing authorization.

## Inputs

Resolve the explicit target root and applicable `AGENTS.md` before writes; never use an incidental cwd.
Read relevant current-truth headings and the selected active record, then only the source/tests needed
to answer the current question. Use filenames/indexes to locate relevant records; do not open every active
feature or optional reviewer merely to begin a discussion. Exclude `docs/specs/changes/archive/` unless tracing a specific historical decision.
Carry forward the latest accepted user decisions, their reasons, explicit exclusions and unresolved questions.
A dirty path is not automatically owned by this change.

## Conversation and discovery

Start with the problem, present consumer and observable outcome. Use repository evidence to resolve facts;
ask only what can change the outcome, approach, boundary, material cost, risk or acceptance. Settled choices
remain settled unless new evidence exposes a material consequence. Do not re-interview the user to fill a
form, choose a lane, invent a slug during discussion, or satisfy a fixed question count.

When uncertain, compare the smallest useful alternatives. If a consequential assumption can be checked,
propose a bounded trial with a question, inputs and a success/failure criterion before executing it. Reuse
existing tests, scripts and synthetic fixtures. Perform only the specifically authorized trial; external
calls, private data, paid work and other restricted operations retain their own approval boundaries. An
isolated trial is not authorization to implement the feature. If a trial cannot run, identify the evidence
gap and continue permitted analysis; never invent a result or present a synthetic result as production proof.

Record observed results separately from accepted expected behavior. An experiment that disproves the
criterion informs the next decision; do not rewrite the criterion to make it pass. No trial is required when
existing evidence already settles the relevant question. Low-level implementation details can be discovered
later without making every idea an upfront experiment.

Consider whether requested outcomes can be accepted and reverted independently. Split only when useful;
keep a coupled transaction, security outcome or rollout together. Explain real coupling/rollback risks and
ask when the choice changes the requested delivery. Do not infer scope from file count or technical keywords.
Every new persistent state, API, role, workflow, management surface, queue or runtime component needs a
present consumer. Exclude speculative capability. External tracking is never a prerequisite for the selected
outcome; creating external items requires separate authorization.

## Record and authorization

A clear user confirmation establishes the current implementation baseline, even before it is written to a
file. The record preserves that decision; its absence or draft status does not reopen it. Changing an
accepted boundary requires a new user decision, which may already be explicit in the current request.

Decide whether to create, reuse or omit a record independently of verification depth. There are no LIGHT/FULL
packages or replacement lane labels. Match documentation to decision and coordination needs, and verification
to actual risk.

- `PREVIEW`: an assessment or discussion request creates no project files and changes no implementation.
- `APPLY`: an explicit record-creation or implementation request permits necessary record work within its
  accepted boundary. Automatic skill invocation is not write authorization. A request only to record a
  decision does not authorize coding. A separately approved temporary trial follows its own narrow scope.

Default new record: `docs/specs/changes/<NNN>-<slug>/spec.md`. Do not precreate `plan.md`, `tasks.md`, an evidence
directory, an empty domain document or an index for it. Use the packaged materializer with `--target`,
`--number` and `--slug`; it creates only spec.md and preserves no-clobber, numbering and symlink safety.
Use the shared [NNN numbering](README.md#shared-runtime-conventions) rule. Confirm a requested unused number
above the computed next number; an occupied/older number cannot be reused via a different slug.

The record explains what changes, why this approach, concrete acceptance examples and expected outcomes,
and later the actual verification. Headings are writing prompts, not mandatory forms. Preserve references
and the actual delta when current truth already explains the unchanged behavior. Keep meaningful negative
constraints. Only split a long design or checklist when it materially helps reading or handoff, name its
purpose, and link it without duplicating accepted rules. Test code belongs in existing project test locations.
Long reproducible trial material can live separately when needed; keep conclusions and references in spec.

An active feature uses `spec.md` as its accepted record. Optional design/work notes may support it but do not
own acceptance or delivery status. Archived directories remain history and do not participate in active
execution. The canonical delivery receipt location is owned by `feature-done`.

Before implementation, resolve any question that can change the accepted direction, scope or acceptance.
Give a proportionate execution preview of outcome, approach, boundary, rationale, verification and useful
phases if those have not already been explained and accepted. An accepted preview is reused, not requested
again. A clear request may already state and authorize that approach; do not insert duplicate confirmation.
A genuinely unresolved material choice needs the user's decision. Explain consequences rather than a form.

## Document updates and context

Answer the current question first. Batch writeback when a conclusion is reached, before implementation or at
handoff; do not write after each sentence or interrupt conversation with bookkeeping. During a long exchange,
save a short supported summary early if an important decision could be lost. Preserve accepted decisions and
reasons, exclusions, unresolved questions, permission limits and the next useful action. Do not copy entire
transcripts or logs, turn assumptions into decisions, or erase a relevant rejected alternative's rationale.

On resume, read the relevant accepted record and unfinished work, then necessary linked evidence. Do not
restart planning, reload every guideline/archive, or clear the session merely because a document changed.
Reopen a decision only when a material contradiction or new finding requires it. Keep one content owner;
source traces are needed for non-obvious external interpretations, conflicts or supersessions, not duplicate
rows for every ordinary requirement. Use dates and stable source references where useful.

## Implementation Scope Stop

Discovery continues during implementation. A task split, implementation-order change, necessary test or
simpler internal implementation that preserves the accepted behavior can proceed without approval or a
formal revision. Record only details useful to later work. Do not require all tasks to be known upfront.

Stop the affected implementation before deepening rework when evidence reveals infeasibility, a materially
better direction, an undeclared outcome/contract, ownership, authorization, data disposition, operating cost,
migration, release boundary, or changed acceptance. Explain the finding, consequences and recommended options;
ask the smallest useful question. Safe authorized investigation can continue. Existing code never justifies
absorbing scope or making the user accept it.

After confirmation, use [`spec-revise`](spec-revise.md) to update only affected decisions, work and acceptance,
then continue the authorized implementation. Do not restart the feature or rewrite unaffected evidence. An
independent outcome becomes a successor/child only if the user wants it; do not automatically create a backlog.
A failed test with unchanged requirements calls for implementation repair, not changed expectations.

At a real dependency or risk checkpoint run the smallest relevant check and give a compact handoff: result,
evidence, deviations and next step. Wait for the user only at an agreed phase boundary, a material decision
or a required permission; no automatic per-file checkpoints. During implementation and post-gate repair,
if repair/verification keeps cycling without converging, explain the unresolved problem and recommended next
step, then wait for the user's decision. Preserve unaffected valid evidence; rerun the affected closure.

## Readiness and conditional guidance

Use [`spec-quality-check`](spec-quality-check.md) to check semantic readiness, without demanding file sets or
repeating a completed check on unchanged inputs. Independent review is conditional on risk or an explicit
request, not record size. For real architecture/ownership changes, read only the applicable
[architecture guidance](../architecture-design.md). A durable convention-placement decision uses the
[Guidance Placement Contract](agents-md-revise.md#guidance-placement-contract); ordinary changes skip it.
Create an ADR only for architecture/module boundaries, durable cross-feature decisions or superseding an ADR.

Normalize accepted material decisions and explicit supersessions before drafting. Use a compact source trace.
Dispatch a fresh [decision-completeness auditor](../reviewers/decision-completeness-auditor.md) only for an
unconfirmed material choice or conflicting/weak evidence under its dispatch boundary. Directly traceable
values do not need another reviewer. Applicable dispatch follows the shared
[reviewer execution contract](../reviewers/README.md#reviewer-execution-contract); missing required evidence
blocks a reliable handoff, not permission to invent the decision.

## Verification

Acceptance describes concrete examples, expected behavior and the smallest sufficient executable evidence.
One command can prove several obligations. Preserve meaningful regression, security, recovery and privacy
checks. Add layers or matrices only for distinct risk or project/release requirements, not symmetry. Start
user-visible verification with the shortest useful actor-to-result path. Testing guidance is not permission
to delete a failing test or lower its expectation without a confirmed behavior change.

## Outputs and validation

Report the useful conclusion, create/reuse/no-record disposition, actual evidence or gap, and next action in
natural language. Do not output a required lane/form or an empty checklist. Read-only assessment stops without
materialization. Record-only work stops after recording; authorized implementation continues from its accepted
approach. Validate correct target, no-clobber, traceability, consistent negative constraints, and actionable
acceptance before handoff. Report tests actually executed separately from planned tests and static fixtures.
