---
name: graphify-knowledge
description: Manages code and rule context indexing, AST graph queries, and token-efficient agent navigation using Graphify.
---

# Graphify Knowledge & Agent Navigation Skill

## Purpose
Enables autonomous coding agents to navigate the repository, TypeScript schemas, and Blades in the Dark ruleset with high precision and low token overhead by utilizing deterministic AST knowledge graphs.

## Graphify Workflow

### 1. Generating & Refreshing the Code Graph
When new features, components, or database types are introduced:
- Run the Graphify AST parser across `src/` and `.agent/knowledge/`:
  ```bash
  # Generate or update local context graph
  npx graphify-ts scan --output .graphify/
  ```
- Generates:
  - `.graphify/graph.json`: Nodes (components, types, database queries, rules) and edges (imports, dependencies, rule validations).
  - `.graphify/index.md`: Compact index of system architecture.

### 2. Querying Knowledge & Dependencies
Before creating or modifying cross-cutting features (e.g. character sheet state feeding into campaign economy and clocks):
1. Query symbol dependencies:
   - Identify which files consume or produce the target type (e.g., `Scoundrel`, `Clock`, `Faction`).
2. Identify rule couplings:
   - For any action resolution handler, verify linkage to `.agent/knowledge/core_mechanics.md`.
   - For downtime and economy transactions, verify linkage to `.agent/knowledge/downtime_and_economy.md`.

### 3. Agent Operating Rules
- Avoid redundant reads of whole directories when a targeted query to `.graphify/` or `.agent/knowledge/` maps the exact file and line ranges.
- Keep the graph updated after substantial schema or component additions.
