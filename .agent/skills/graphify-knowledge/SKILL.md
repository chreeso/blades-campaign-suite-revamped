---
name: graphify-knowledge
description: "Codebase knowledge graph and architectural intelligence. Use BEFORE performing broad grep searches or reading multiple source files when investigating bugs, tracing call chains, calculating blast radius, or navigating subsystem dependencies."
risk: safe
source: project
---

# Graphify Knowledge Graph & Architecture Skill

> "Consult the structural graph before exploring files. Know the blast radius before touching code."

---

## 🎯 Selective Reading & Token Conservation Rules

1. **NEVER dump or read the full `graphify-out/graph.json` into context!**
   - `graph.json` contains raw AST nodes across the entire codebase. Loading it directly exhausts context and burns tokens unnecessarily.
2. **Read `graphify-out/GRAPH_REPORT.md` for Macro Architectural Orientation:**
   - At ~15–20 KB (<2,000 tokens), it provides an executive map of the system:
     - **Graph Freshness:** Check `Built from commit: <hash>` against `git rev-parse HEAD` to verify sync.
     - **God Nodes:** Ranked list of the most heavily connected abstractions (e.g., `Home()`, `Clock`, `Character`, `Fortitude`).
     - **Community Hubs:** Central entry points for subsystem clusters.
     - **Surprising Connections:** Non-obvious cross-module and rules-to-code couplings.
3. **Use Targeted Graph Lookups (`npm run graph:*`) for Micro Navigation:**
   - For specific functions, components, types, or rules, execute single-command queries that return exact locations and direct callers in <150 tokens.

---

## 🔍 Fast Graph Navigation Commands

```bash
# 1. Macro orientation: view top God Nodes & subsystem hubs (or read graphify-out/GRAPH_REPORT.md):
npm run graph:summary

# 2. Micro discovery: locate a symbol, component, type, or entry point:
npm run graph:find <term>

# 3. Caller tracing: list all source files depending on a symbol:
npm run graph:callers <symbol>

# 4. Blast radius check: assess coupling degree and detect God Nodes (>= 15 edges):
npm run graph:blast <symbol>
```

### Greenfield Feature Fallback:

If `npm run graph:find <term>` returns 0 matches (new capability, rule file, or DB migration), the CLI provides direct pointers to domain directories:
- Character sheet & playbooks: `src/components/character/`, `src/lib/constants/playbooks.ts`
- Campaign hubs & factions: `src/components/campaign/`
- Clocks & progress UI: `src/components/ui/LinearClock.tsx`, `src/components/campaign/ClocksManager.tsx`
- Downtime & roller: `src/components/downtime/`, `src/components/roller/`
- Rules & mechanics: `.agent/knowledge/`
- DB migrations: `supabase/migrations/`

---

## 🛡️ Blast Radius Protocol Before Refactoring

Before modifying any shared component, custom hook, Zod validation schema, or Supabase database function:

1. **Check God Nodes in `GRAPH_REPORT.md`:** Determine if the target is one of the repository's core abstractions.
2. **Trace Inbound Edges:** Run `npm run graph:callers <symbol>` to identify all dependent consumer files.
3. **Assess Coupling:** Run `npm run graph:blast <symbol>`. If degree $\ge 15$ (God Node), plan surgical micro-steps to prevent ripple-effect regressions.
4. **Open Only Impacted Files:** Never browse or open unaffected files speculatively. Open only files verified in the dependency path.

---

## 🔄 Graph Freshness & Maintenance

Graphify uses SHA-256 caching. Updating the graph after structural changes is fast and costs 0 tokens:

```bash
# Fast incremental update:
npm run graph:update
# or
npm run graphify
```
