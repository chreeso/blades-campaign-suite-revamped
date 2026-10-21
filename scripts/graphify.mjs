#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, '.graphify');

function getAllFiles(dir, extensions = ['.ts', '.tsx', '.md'], exclude = ['node_modules', '.next', '.graphify', '.git']) {
  let files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, extensions, exclude));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseTypeScriptFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  const symbols = [];
  const imports = [];

  function visit(node) {
    // Import Declarations
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier.text;
      if (node.importClause) {
        if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
          node.importClause.namedBindings.elements.forEach(el => {
            imports.push({ name: el.name.text, from: moduleSpecifier });
          });
        }
      }
    }

    // Interfaces & Types
    if (ts.isInterfaceDeclaration(node)) {
      symbols.push({
        id: `${relativePath}#${node.name.text}`,
        name: node.name.text,
        kind: 'interface',
        file: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        isExported: Boolean(node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword))
      });
    } else if (ts.isTypeAliasDeclaration(node)) {
      symbols.push({
        id: `${relativePath}#${node.name.text}`,
        name: node.name.text,
        kind: 'type',
        file: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        isExported: Boolean(node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword))
      });
    }

    // Functions & Components
    if (ts.isFunctionDeclaration(node) && node.name) {
      const isComponent = /^[A-Z]/.test(node.name.text);
      symbols.push({
        id: `${relativePath}#${node.name.text}`,
        name: node.name.text,
        kind: isComponent ? 'component' : 'function',
        file: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        isExported: Boolean(node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword))
      });
    }

    // Exported variable components / constants
    if (ts.isVariableStatement(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      node.declarationList.declarations.forEach(decl => {
        if (ts.isIdentifier(decl.name)) {
          const isComponent = /^[A-Z]/.test(decl.name.text);
          symbols.push({
            id: `${relativePath}#${decl.name.text}`,
            name: decl.name.text,
            kind: isComponent ? 'component' : 'const',
            file: relativePath,
            line: sourceFile.getLineAndCharacterOfPosition(decl.getStart()).line + 1,
            isExported: true
          });
        }
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { symbols, imports, file: relativePath };
}

function parseMarkdownKnowledge(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  const lines = content.split('\n');

  const symbols = [];
  lines.forEach((line, index) => {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      const heading = headingMatch[1].trim();
      symbols.push({
        id: `${relativePath}#${encodeURIComponent(heading)}`,
        name: heading,
        kind: 'rule_topic',
        file: relativePath,
        line: index + 1,
        isExported: true
      });
    }
  });

  return { symbols, imports: [], file: relativePath };
}

function buildGraph() {
  const tsFiles = getAllFiles(path.join(ROOT_DIR, 'src'), ['.ts', '.tsx']);
  const mdFiles = getAllFiles(path.join(ROOT_DIR, '.agent/knowledge'), ['.md']);

  const nodes = [];
  const edges = [];
  const symbolMap = new Map();

  // 1. Extract symbols
  for (const file of tsFiles) {
    const parsed = parseTypeScriptFile(file);
    parsed.symbols.forEach(s => {
      nodes.push(s);
      symbolMap.set(s.name, s.id);
    });

    // Edges from imports
    parsed.imports.forEach(imp => {
      edges.push({
        source: parsed.file,
        targetSymbol: imp.name,
        targetModule: imp.from,
        relationship: 'imports'
      });
    });
  }

  for (const file of mdFiles) {
    const parsed = parseMarkdownKnowledge(file);
    parsed.symbols.forEach(s => {
      nodes.push(s);
      symbolMap.set(s.name, s.id);
    });
  }

  // 2. Resolve edges
  const resolvedEdges = edges.map(e => {
    const resolvedTargetId = symbolMap.get(e.targetSymbol);
    return {
      source: e.source,
      target: resolvedTargetId || e.targetModule,
      symbol: e.targetSymbol,
      relationship: e.relationship
    };
  });

  // 3. Connect Rule Couplings
  const ruleCouplings = [
    { component: 'src/components/character/CharacterSheet.tsx', rule: '.agent/knowledge/character_playbooks.md' },
    { component: 'src/components/character/CharacterCreator.tsx', rule: '.agent/knowledge/character_playbooks.md' },
    { component: 'src/components/ui/LinearClock.tsx', rule: '.agent/knowledge/clocks_and_progress.md' },
    { component: 'src/components/roller/DiceRoller.tsx', rule: '.agent/knowledge/core_mechanics.md' },
    { component: 'src/components/downtime/DowntimeWizard.tsx', rule: '.agent/knowledge/downtime_and_economy.md' },
    { component: 'src/components/campaign/CrewSheet.tsx', rule: '.agent/knowledge/crew_playbooks.md' },
    { component: 'src/components/campaign/FactionsTracker.tsx', rule: '.agent/knowledge/factions_and_doskvol.md' },
    { component: 'supabase/migrations/20261020000000_init_blades.sql', rule: '.agent/skills/supabase-architecture/SKILL.md' }
  ];

  ruleCouplings.forEach(rc => {
    resolvedEdges.push({
      source: rc.component,
      target: rc.rule,
      symbol: 'governs_rule',
      relationship: 'governed_by'
    });
  });

  return { nodes, edges: resolvedEdges };
}

function generateMarkdownIndex(nodes, edges) {
  let md = `# Graphify AST Index — Blades Campaign Suite\n\n`;
  md += `*Generated automatically by \`graphify\` on ${new Date().toISOString()}*\n\n`;
  md += `| Category | Total Count |\n| :--- | :--- |\n`;
  md += `| **Total AST Nodes** | ${nodes.length} |\n`;
  md += `| **Total Edges / Imports** | ${edges.length} |\n\n`;

  md += `## 1. Core Interfaces & Type Definitions\n\n`;
  const types = nodes.filter(n => n.kind === 'interface' || n.kind === 'type');
  md += `| Symbol | Kind | Defined In | Line |\n| :--- | :--- | :--- | :--- |\n`;
  types.forEach(t => {
    md += `| \`${t.name}\` | ${t.kind} | [\`${t.file}\`](file:///${path.resolve(ROOT_DIR, t.file).replace(/\\/g, '/')}) | ${t.line} |\n`;
  });

  md += `\n## 2. React UI Components\n\n`;
  const components = nodes.filter(n => n.kind === 'component');
  md += `| Component | File | Line |\n| :--- | :--- | :--- |\n`;
  components.forEach(c => {
    md += `| \`<${c.name} />\` | [\`${c.file}\`](file:///${path.resolve(ROOT_DIR, c.file).replace(/\\/g, '/')}) | ${c.line} |\n`;
  });

  md += `\n## 3. Core Engine Functions & Utilities\n\n`;
  const functions = nodes.filter(n => n.kind === 'function');
  md += `| Function | File | Line |\n| :--- | :--- | :--- |\n`;
  functions.forEach(f => {
    md += `| \`${f.name}()\` | [\`${f.file}\`](file:///${path.resolve(ROOT_DIR, f.file).replace(/\\/g, '/')}) | ${f.line} |\n`;
  });

  md += `\n## 4. Rule Knowledge Couplings\n\n`;
  const ruleEdges = edges.filter(e => e.relationship === 'governed_by');
  md += `| Component / Subsystem | Governed By Rule / Skill |\n| :--- | :--- |\n`;
  ruleEdges.forEach(re => {
    md += `| \`${re.source}\` | \`${re.target}\` |\n`;
  });

  return md;
}

// Main execution
const args = process.argv.slice(2);
const command = args[0] || 'scan';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

if (command === 'scan') {
  console.log('⚡ Scanning TypeScript AST and Knowledge graphs...');
  const { nodes, edges } = buildGraph();

  const graphJson = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      totalNodes: nodes.length,
      totalEdges: edges.length
    },
    nodes,
    edges
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'graph.json'), JSON.stringify(graphJson, null, 2), 'utf8');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.md'), generateMarkdownIndex(nodes, edges), 'utf8');

  console.log(`✓ Graph generated: ${nodes.length} nodes, ${edges.length} edges`);
  console.log(`✓ Index written to .graphify/index.md & .graphify/graph.json`);
} else if (command === 'query') {
  const query = args[1]?.toLowerCase();
  if (!query) {
    console.error('Please specify a symbol to query, e.g.: npm run graphify query Clock');
    process.exit(1);
  }

  const graphPath = path.join(OUTPUT_DIR, 'graph.json');
  if (!fs.existsSync(graphPath)) {
    console.error('No graph found. Run `npm run graphify` first.');
    process.exit(1);
  }

  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
  const matches = graph.nodes.filter(n => n.name.toLowerCase().includes(query));

  console.log(`\nFound ${matches.length} matches for "${query}":`);
  matches.forEach(m => {
    console.log(`- [${m.kind}] ${m.name} in ${m.file}:${m.line}`);
  });

  const relatedEdges = graph.edges.filter(e => e.symbol?.toLowerCase().includes(query) || e.source?.toLowerCase().includes(query));
  if (relatedEdges.length > 0) {
    console.log(`\nConnected Dependencies (${relatedEdges.length}):`);
    relatedEdges.slice(0, 10).forEach(e => {
      console.log(`  ${e.source} -> [${e.relationship}] -> ${e.target}`);
    });
  }
}
