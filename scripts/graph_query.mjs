#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const GRAPH_JSON_PATH = path.join(ROOT_DIR, "graphify-out", "graph.json");
const GRAPH_REPORT_PATH = path.join(
  ROOT_DIR,
  "graphify-out",
  "GRAPH_REPORT.md",
);

function loadGraph() {
  if (!fs.existsSync(GRAPH_JSON_PATH)) {
    console.warn(
      `[Graphify] Notice: graph.json not found at ${GRAPH_JSON_PATH}`,
    );
    console.warn(
      `[Graphify] Run 'npm run graph:update' (or 'npm run graphify') to index the codebase.`,
    );
    return null;
  }
  try {
    const raw = fs.readFileSync(GRAPH_JSON_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Graphify] Error parsing graph.json: ${err.message}`);
    return null;
  }
}

function getEdges(graph) {
  return graph.links || graph.edges || [];
}

function handleFind(term) {
  if (!term) {
    console.error("Usage: npm run graph:find <symbol_or_keyword>");
    process.exit(1);
  }
  const graph = loadGraph();
  if (!graph) return;

  const q = term.toLowerCase().trim();
  const nodes = graph.nodes || [];
  const edges = getEdges(graph);

  // Score matches: exact label > starts with > includes label > includes file
  const matches = [];
  for (const node of nodes) {
    const label = (node.label || "").toLowerCase();
    const file = (node.source_file || "").toLowerCase();
    const id = (node.id || "").toLowerCase();

    let score = 0;
    if (label === q) score = 100;
    else if (label.startsWith(q)) score = 80;
    else if (label.includes(q)) score = 60;
    else if (file.includes(q)) score = 40;
    else if (id.includes(q)) score = 20;

    if (score > 0) {
      matches.push({ node, score });
    }
  }

  if (matches.length === 0) {
    console.log(`[Graphify] No graph nodes matched '${term}'.`);
    console.log(`[Graphify] Tips for greenfield features or unindexed assets:`);
    console.log(`  - Character sheet:  src/components/character/`);
    console.log(`  - Campaign hubs:    src/components/campaign/`);
    console.log(`  - Clocks & UI:      src/components/ui/`);
    console.log(`  - Downtime & Rolls: src/components/downtime/ & src/components/roller/`);
    console.log(`  - Rules & SRD:      .agent/knowledge/`);
    console.log(`  - DB migrations:    supabase/migrations/`);
    console.log(`Run 'npm run graph:update' if files were recently created.`);
    return;
  }

  matches.sort((a, b) => b.score - a.score);
  const top = matches.slice(0, 5);

  console.log(
    `[Graphify] Found ${matches.length} match(es) for '${term}' (showing top ${top.length}):\n`,
  );

  for (const { node } of top) {
    const callers = [];
    const callees = [];

    for (const edge of edges) {
      if (edge.target === node.id) {
        callers.push(edge.source_file || edge.source);
      }
      if (edge.source === node.id) {
        callees.push(edge.target);
      }
    }

    const uniqueCallers = [...new Set(callers)].slice(0, 3);
    const uniqueCallees = [...new Set(callees)].slice(0, 3);

    console.log(`• Symbol:   ${node.label || node.id}`);
    console.log(
      `  Location: ${node.source_file || "unknown"}${node.source_location ? ":" + node.source_location : ""}`,
    );
    if (node.community_name) {
      console.log(
        `  Cluster:  ${node.community_name} (${node.file_type || "code"})`,
      );
    }
    if (uniqueCallers.length > 0) {
      console.log(
        `  Callers:  ${uniqueCallers.map((c) => path.basename(c)).join(", ")}${callers.length > 3 ? ` (+${callers.length - 3} more)` : ""}`,
      );
    }
    if (uniqueCallees.length > 0) {
      console.log(
        `  Callees:  ${uniqueCallees.map((c) => c.split("_").pop()).join(", ")}${callees.length > 3 ? ` (+${callees.length - 3} more)` : ""}`,
      );
    }
    console.log("");
  }
}

function handleCallers(term) {
  if (!term) {
    console.error("Usage: npm run graph:callers <symbol>");
    process.exit(1);
  }
  const graph = loadGraph();
  if (!graph) return;

  const q = term.toLowerCase().trim();
  const nodes = graph.nodes || [];
  const edges = getEdges(graph);

  const matched = nodes.filter(
    (n) =>
      (n.label || "").toLowerCase().includes(q) ||
      (n.id || "").toLowerCase().includes(q),
  );
  if (matched.length === 0) {
    console.log(`[Graphify] No symbol found matching '${term}'.`);
    return;
  }

  const targetIds = new Set(matched.map((n) => n.id));
  const callerFiles = new Set();
  const callerSymbols = new Set();

  for (const edge of edges) {
    if (targetIds.has(edge.target)) {
      if (edge.source_file) callerFiles.add(edge.source_file);
      callerSymbols.add(edge.source);
    }
  }

  console.log(
    `[Graphify] Callers for '${term}' (${callerFiles.size} dependent files, ${callerSymbols.size} callers):`,
  );
  if (callerFiles.size === 0) {
    console.log(`  (No direct inbound callers recorded in graph)`);
    return;
  }
  for (const f of [...callerFiles].slice(0, 10)) {
    console.log(`  • ${f}`);
  }
  if (callerFiles.size > 10) {
    console.log(`  ... and ${callerFiles.size - 10} more files`);
  }
}

function handleBlast(term) {
  if (!term) {
    console.error("Usage: npm run graph:blast <symbol>");
    process.exit(1);
  }
  const graph = loadGraph();
  if (!graph) return;

  const q = term.toLowerCase().trim();
  const nodes = graph.nodes || [];
  const edges = getEdges(graph);

  const matched = nodes.filter(
    (n) =>
      (n.label || "").toLowerCase().includes(q) ||
      (n.id || "").toLowerCase().includes(q),
  );
  if (matched.length === 0) {
    console.log(`[Graphify] No symbol found matching '${term}'.`);
    return;
  }

  console.log(`[Graphify] Blast Radius Assessment for '${term}':\n`);
  for (const node of matched.slice(0, 3)) {
    let inDegree = 0;
    let outDegree = 0;
    const callerFiles = new Set();

    for (const edge of edges) {
      if (edge.target === node.id) {
        inDegree++;
        if (edge.source_file) callerFiles.add(edge.source_file);
      }
      if (edge.source === node.id) {
        outDegree++;
      }
    }

    const total = inDegree + outDegree;
    const isGodNode = total >= 15;

    console.log(
      `• Symbol: ${node.label || node.id} (${node.source_file || "unknown"})`,
    );
    console.log(
      `  Degree: ${total} edges (Inbound callers: ${inDegree}, Outbound calls: ${outDegree})`,
    );
    if (isGodNode) {
      console.log(
        `  ⚠️  HIGH BLAST RADIUS (God Node: ${total} edges). Plan surgical changes!`,
      );
    } else {
      console.log(`  ✓ Moderate/Low coupling (${total} edges).`);
    }
    if (callerFiles.size > 0) {
      console.log(
        `  Impacted files: ${[...callerFiles]
          .slice(0, 5)
          .map((f) => path.basename(f))
          .join(
            ", ",
          )}${callerFiles.size > 5 ? ` (+${callerFiles.size - 5} more)` : ""}`,
      );
    }
    console.log("");
  }
}

function handleSummary() {
  if (fs.existsSync(GRAPH_REPORT_PATH)) {
    const report = fs.readFileSync(GRAPH_REPORT_PATH, "utf-8");
    const godNodesMatch = report.match(/## God Nodes[\s\S]*?(?=\n## |\Z)/);
    const hubsMatch = report.match(/## Community Hubs[\s\S]*?(?=\n## |\Z)/);

    console.log("[Graphify] Codebase Architecture Summary:");
    if (godNodesMatch) {
      console.log(godNodesMatch[0].split("\n").slice(0, 8).join("\n"));
    }
    if (hubsMatch) {
      console.log("\nTop Hubs:");
      console.log(
        hubsMatch[0]
          .split("\n")
          .slice(1, 8)
          .map((l) => "  " + l)
          .join("\n"),
      );
    }
    return;
  }

  const graph = loadGraph();
  if (!graph) return;
  console.log(
    `[Graphify] Total Nodes: ${graph.nodes?.length || 0}, Total Edges: ${getEdges(graph).length}`,
  );
}

const [, , cmd, ...args] = process.argv;
const queryTerm = args.join(" ");

switch (cmd) {
  case "find":
    handleFind(queryTerm);
    break;
  case "callers":
    handleCallers(queryTerm);
    break;
  case "blast":
    handleBlast(queryTerm);
    break;
  case "summary":
    handleSummary();
    break;
  default:
    console.log(`Graphify Lightweight Query Tool`);
    console.log(`Commands:`);
    console.log(
      `  node scripts/graph_query.mjs find <term>     - Find symbol, file, community, & immediate callers`,
    );
    console.log(
      `  node scripts/graph_query.mjs callers <symbol> - List all source files depending on this symbol`,
    );
    console.log(
      `  node scripts/graph_query.mjs blast <symbol>   - Assess coupling degree and blast radius`,
    );
    console.log(
      `  node scripts/graph_query.mjs summary          - Display top God Nodes and architectural hubs`,
    );
    break;
}
