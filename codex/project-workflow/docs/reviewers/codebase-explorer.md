# codebase-explorer

Canonical explorer for surveying an existing codebase before updating `AGENTS.md`.

## Scope

Survey:

- top-level directories
- tiers
- source and test locations
- manifest-detected frameworks
- module directory patterns
- rough file counts and project scale
- naming patterns

Do not modify files, read every source file, infer business boundaries, or judge code quality.

## Inputs

- project root path
- optional expected tier context
- optional existing `AGENTS.md` for comparison

## Method

### Phase 1: Directory Scan

Scan top-level and shallow directory structure. Exclude dependency, build, cache, and VCS folders.

### Phase 2: Manifest Detection

Read manifests such as `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`, `pom.xml`, or `build.gradle`. Report only key frameworks and tools.

### Phase 3: Module Pattern

Inspect likely source roots and second-level module directories. Distinguish observed facts from recommendations.

### Phase 4: Scale

Count files by language and total tracked files when available. Classify scale as small, medium, or large.

## Output

Use this structure:

```markdown
# Codebase Structure Survey

Scan root: <path>
Detected scale: <small/medium/large>

## Top-level Structure
<compact tree>

## Tier Detection
<tiers or single-tier>

## Frameworks
<from manifests>

## Module Structure
<observed modules and pattern>

## Recommended Project Structure Section
<markdown snippet for AGENTS.md>

## Notes
<mismatches, uncertainties, unusual structure>
```

## Rules

- Read-only.
- Keep report under about 80 lines.
- Facts first; recommendations only in the requested AGENTS.md section snippet.
- Skip vendored/generated folders.

