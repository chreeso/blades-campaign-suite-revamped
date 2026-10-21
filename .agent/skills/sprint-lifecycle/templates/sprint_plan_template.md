# Blades Campaign Suite — {{FEATURE_NAME}} Implementation Plan

This implementation plan details the architecture and sprint roadmap for {{FEATURE_DESCRIPTION}} on branch `feature/{{BRANCH_NAME}}`.

---

## Architecture & Data Flow

```mermaid
{{DIAGRAM_TYPE}}
    %% Example diagram showing components, API/database interactions, or state transitions
    A["Component / Trigger"] --> B["State / Action Handler"]
    B --> C["Database / Supabase Realtime"]
```

---

## Mandatory Sprint Execution Cadence

> [!IMPORTANT]
> **Every Sprint Protocol:**
> 1. **Sprint Start**: Run `npm run graph:update` to index the AST and dependency graph.
> 2. **Sprint Implementation**: Write clean, modular TypeScript code conforming to project styling and Blades SRD mechanics.
> 3. **Verification**: Run `npx tsc --noEmit` and confirm 0 errors.
> 4. **Sprint Commit**: Re-run `npm run graph:update` to refresh the code graph, stage modified files, and produce an atomic git commit on `feature/{{BRANCH_NAME}}`.

---

## Sprint Breakdown

### Topic 1: {{TOPIC_1_TITLE}}

#### Sprint 1.1: {{SPRINT_1_1_TITLE}}
* **Focus**: {{1-sentence sprint objective}}
* **Tasks**:
  1. {{Task 1}}
  2. {{Task 2}}
  3. {{Task 3}}
* **Commit**: `feat({{scope}}): {{commit message}}`

#### Sprint 1.2: {{SPRINT_1_2_TITLE}}
* **Focus**: {{1-sentence sprint objective}}
* **Tasks**:
  1. {{Task 1}}
  2. {{Task 2}}
* **Commit**: `feat({{scope}}): {{commit message}}`

---

### Topic 2: {{TOPIC_2_TITLE}}

#### Sprint 2.1: {{SPRINT_2_1_TITLE}}
* **Focus**: {{1-sentence sprint objective}}
* **Tasks**:
  1. {{Task 1}}
  2. {{Task 2}}
* **Commit**: `feat({{scope}}): {{commit message}}`

---

### Topic 3: Verification, Rules Fidelity & Documentation

#### Sprint 3.1: Production Build Verification & Rules Audit
* **Focus**: End-to-end type safety, build verification, and rules fidelity check.
* **Tasks**:
  1. Run `npx tsc --noEmit` and `npm run build` to verify zero production build issues.
  2. Audit rule implementations against `.agent/knowledge/` specifications.
  3. Update `RELEASE_NOTES.md` under new semantic version.
* **Commit**: `docs(release): update release notes with {{FEATURE_NAME}} features`

#### Sprint 3.2: Knowledge Base & Graphify Finalization
* **Focus**: Knowledge base updates and AST graph indexation.
* **Tasks**:
  1. Update relevant files in `.agent/knowledge/` if game mechanics or terms were added.
  2. Execute `npm run graph:update` to finalize code graph in `graphify-out/`.
* **Commit**: `docs(knowledge): finalize graphify index for {{FEATURE_NAME}}`
