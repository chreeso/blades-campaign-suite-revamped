import { execSync } from "node:child_process";
import assert from "node:assert/strict";

console.log("=== Running Graph Query CLI Acceptance Tests ===");

// Helper to run graph_query
function runQuery(args) {
  try {
    const output = execSync(`node scripts/graph_query.mjs ${args}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { status: 0, output };
  } catch (error) {
    return {
      status: error.status ?? 1,
      output: (error.stdout || "") + (error.stderr || ""),
    };
  }
}

// Test 1: summary command
{
  console.log("Test 1: summary command...");
  const res = runQuery("summary");
  assert.equal(res.status, 0, "summary should exit with 0");
  assert.match(
    res.output,
    /Architecture Summary|Graph Summary/i,
    "Should show graph summary header",
  );
  assert.match(res.output, /God Nodes/i, "Should show God Nodes");
  console.log("  ✓ Test 1 passed");
}

// Test 2: find command with known symbol
{
  console.log("Test 2: find command...");
  const res = runQuery("find Clock");
  assert.equal(res.status, 0, "find should exit with 0");
  assert.match(res.output, /Clock/i, "Should match symbol name");
  assert.match(res.output, /Location:/i, "Should include location");
  console.log("  ✓ Test 2 passed");
}

// Test 3: callers command
{
  console.log("Test 3: callers command...");
  const res = runQuery("callers Clock");
  assert.equal(res.status, 0, "callers should exit with 0");
  assert.match(
    res.output,
    /src[\\/]components|src[\\/]types|src[\\/]app/i,
    "Should list callers for Clock",
  );
  console.log("  ✓ Test 3 passed");
}

// Test 4: blast command for God Node (>= 15 edges)
{
  console.log("Test 4: blast command for God Node...");
  const res = runQuery("blast Home");
  assert.equal(res.status, 0, "blast should exit with 0");
  assert.match(res.output, /God Node/i, "Should detect Home as God Node");
  assert.match(
    res.output,
    /Blast Radius|Coupling/i,
    "Should describe blast radius",
  );
  console.log("  ✓ Test 4 passed");
}

// Test 5: missing argument handling
{
  console.log("Test 5: missing argument error handling...");
  const res = runQuery("find");
  assert.notEqual(
    res.status,
    0,
    "find without target should exit with non-zero",
  );
  assert.match(res.output, /Usage:|Error:/i, "Should display error or usage");
  console.log("  ✓ Test 5 passed");
}

console.log("\n=== All Graph Query CLI Tests Passed Successfully! ===");
