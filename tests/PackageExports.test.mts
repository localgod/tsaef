import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as root from "../src/index.mjs";
import * as node from "../src/node/index.mjs";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE = JSON.parse(readFileSync(resolve(ROOT_DIR, "package.json"), "utf-8"));
const IMPORT_PATTERN =
  /(?:import|export)\s[^"']*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
const NODE_BUILTINS = new Set(builtinModules);

// Source files reachable from `entry` and the bare specifiers they import.
function importGraph(entry: string): { files: string[]; packages: Set<string> } {
  const files: string[] = [];
  const packages = new Set<string>();
  const pending = [entry];
  while (pending.length > 0) {
    const file = pending.pop()!;
    if (files.includes(file)) continue;
    files.push(file);
    for (const match of readFileSync(file, "utf-8").matchAll(IMPORT_PATTERN)) {
      const specifier = match[1] ?? match[2];
      if (specifier.startsWith(".")) {
        pending.push(resolve(dirname(file), specifier.replace(/\.mjs$/, ".mts")));
      } else {
        packages.add(specifier);
      }
    }
  }
  return { files, packages };
}

describe("root export (tsaef)", () => {
  const graph = importGraph(resolve(ROOT_DIR, "src/index.mts"));

  it("imports no Node built-ins anywhere in its module graph", () => {
    const builtins = [...graph.packages].filter(
      (specifier) => specifier.startsWith("node:") || NODE_BUILTINS.has(specifier),
    );
    expect(builtins).toEqual([]);
    expect(graph.files.some((file) => file.includes("/src/node/"))).toBe(false);
  });

  it("only depends on browser-safe runtime packages", () => {
    expect([...graph.packages].sort()).toEqual(Object.keys(PACKAGE.dependencies).sort());
  });

  it("does not export TsAEF", () => {
    expect(root).not.toHaveProperty("TsAEF");
    expect(root).toHaveProperty("Serializer");
    expect(root).toHaveProperty("IOError");
  });
});

describe("node export (tsaef/node)", () => {
  it("exports TsAEF", () => {
    expect(typeof node.TsAEF).toBe("function");
  });
});

describe("package.json exports", () => {
  it.each([
    [".", "src/index.mts"],
    ["./node", "src/node/index.mts"],
  ])("%s lists types first and points at the build of %s", (subpath, source) => {
    const entry = PACKAGE.exports[subpath];
    expect(Object.keys(entry)).toEqual(["types", "import"]);
    const built = source.replace(/^src\//, "./dist/").replace(/\.mts$/, "");
    expect(entry).toEqual({ types: `${built}.d.mts`, import: `${built}.mjs` });
    expect(existsSync(resolve(ROOT_DIR, source))).toBe(true);
  });
});
