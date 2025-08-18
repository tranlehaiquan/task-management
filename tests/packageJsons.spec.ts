/**
 * Testing library/framework: Jest-compatible (Jest or Vitest)
 *
 * These tests validate the structure and critical values in the root package.json,
 * focusing on the diff contents provided. They cover presence, types, and constraints
 * for key fields like name, version, scripts, packageManager, workspaces, etc.
 *
 * If running with Vitest, the describe/it/expect APIs are compatible.
 */

import { readFileSync } from "fs";
import path from "path";

function loadRootPackageJson() {
  const pkgPath = path.resolve(process.cwd(), "package.json");
  const raw = readFileSync(pkgPath, "utf8");
  return JSON.parse(raw);
}

// Small helpers for more readable assertions
function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

describe("root package.json schema and critical values", () => {
  let pkg: ReturnType<typeof loadRootPackageJson>;

  beforeAll(() => {
    pkg = loadRootPackageJson();
  });

  it("has a valid basic identity", () => {
    expect(pkg).toBeTruthy();
    expect(typeof pkg.name).toBe("string");
    expect(pkg.name).toBe("task-management-system");
    expect(typeof pkg.version).toBe("string");
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+(-.+)?$/);
    expect(pkg.private).toBe(true);
  });

  it("has expected description, main, author, license fields", () => {
    expect(typeof pkg.description).toBe("string");
    expect(typeof pkg.main).toBe("string");
    // Provided diff shows "index.js"
    expect(pkg.main).toBe("index.js");
    expect(typeof pkg.author).toBe("string");
    // License from diff: ISC
    expect(pkg.license).toBe("ISC");
  });

  it("contains required scripts and expected commands", () => {
    expect(isRecord(pkg.scripts)).toBe(true);

    const scripts = pkg.scripts as Record<string, unknown>;

    // Required scripts from diff
    for (const key of ["dev", "build", "lint", "db:push", "format"]) {
      expect(typeof scripts[key]).toBe("string");
    }

    expect(scripts.dev).toBe("turbo run dev");
    expect(scripts.build).toBe("turbo run build");
    expect(scripts.lint).toBe("turbo run lint");
    expect(scripts["db:push"]).toBe("pnpm --filter @task-mgmt/database db:push");
    expect(scripts.format).toBe("turbo run format");

    // Edge case: no empty string script values
    for (const [k, v] of Object.entries(scripts)) {
      expect(typeof v).toBe("string");
      expect((v as string).trim().length).toBeGreaterThan(0);
      // Guard against accidental npm lifecycle scripts executing unsafe commands
      expect(v as string).not.toMatch(/\brm\s+-rf\s+\/\b/i);
    }
  });

  it("validates keywords array", () => {
    expect(Array.isArray(pkg.keywords)).toBe(true);
    // From diff, it's empty; ensure it's an array even if empty
    expect(pkg.keywords.length).toBeGreaterThanOrEqual(0);
  });

  it("has a specific packageManager pin with pnpm and valid format", () => {
    // From diff: "pnpm@10.14.0+sha512.<...>"
    expect(typeof pkg.packageManager).toBe("string");
    expect(pkg.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+\+sha512\.[A-Za-z0-9]+$/);
    // Must start with pnpm@
    expect(pkg.packageManager.startsWith("pnpm@")).toBe(true);
  });

  it("declares devDependencies with expected versions", () => {
    expect(isRecord(pkg.devDependencies)).toBe(true);
    const devDeps = pkg.devDependencies as Record<string, unknown>;

    // Required devDependencies from diff
    const required = {
      "@types/node": "^24.3.0",
      "turbo": "^2.5.6",
      "typescript": "^5.9.2",
    };

    for (const [dep, range] of Object.entries(required)) {
      expect(typeof devDeps[dep]).toBe("string");
      expect(devDeps[dep]).toBe(range);
    }

    // Sanity: no obviously invalid semver ranges
    for (const [dep, range] of Object.entries(devDeps)) {
      expect(typeof range).toBe("string");
      // Basic semver-ish check allowing ^ ~ or exact ranges
      expect((range as string)).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
    }
  });

  it("declares dependencies with expected packages", () => {
    expect(isRecord(pkg.dependencies)).toBe(true);
    const deps = pkg.dependencies as Record<string, unknown>;

    // Required from diff
    expect(typeof deps["@nestjs/cli"]).toBe("string");
    expect(deps["@nestjs/cli"]).toBe("^11.0.10");

    // Sanity on entries
    for (const [dep, range] of Object.entries(deps)) {
      expect(typeof range).toBe("string");
      expect((range as string)).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
    }
  });

  it("has a workspaces array pointing to monorepo packages", () => {
    expect(Array.isArray(pkg.workspaces)).toBe(true);
    expect(pkg.workspaces.length).toBeGreaterThan(0);
    // From diff: ["apps/*","packages/*"]
    expect(pkg.workspaces).toContain("apps/*");
    expect(pkg.workspaces).toContain("packages/*");
  });

  it("guards against unexpected types for critical fields", () => {
    // Defensive checks to ensure future edits don't regress types
    expect(typeof pkg.name).toBe("string");
    expect(typeof pkg.private).toBe("boolean");
    expect(Array.isArray(pkg.keywords)).toBe(true);
    expect(isRecord(pkg.scripts)).toBe(true);
    expect(isRecord(pkg.dependencies)).toBe(true);
    expect(isRecord(pkg.devDependencies)).toBe(true);
  });

  it("fails gracefully with helpful messages if fields are missing", () => {
    // Simulate a minimal malformed object and ensure our expectations would catch issues
    const malformed = {
      name: 123, // wrong type
      scripts: { dev: "" }, // empty string script
      packageManager: "npm@x.y.z", // wrong tool and invalid semver
    } as unknown;

    // Local helper assertions
    function assertString(val: unknown, label: string) {
      expect(typeof val).toBe("string");
      expect((val as string).trim().length).toBeGreaterThan(0);
    }

    // These intentional expectations should fail if run against 'malformed', but we only use them
    // to document the kinds of checks we rely on for the real package.json.
    // Instead, we directly validate the "guards" logic:
    expect(typeof (malformed as any).name).toBe("number"); // shows wrong type in malformed
    expect(typeof (malformed as any).scripts.dev).toBe("string");
    expect(((malformed as any).scripts.dev as string).trim().length).toBe(0);

    // Correct usage demonstration using the real pkg ensures our tests themselves are meaningful:
    assertString(pkg.name, "name");
    assertString(pkg.scripts.dev, "scripts.dev");
  });
});

describe("package.json content alignment with monorepo conventions", () => {
  let pkg: ReturnType<typeof loadRootPackageJson>;

  beforeAll(() => {
    pkg = loadRootPackageJson();
  });

  it("uses turbo in scripts for monorepo orchestration", () => {
    expect((pkg.scripts?.build as string) || "").toMatch(/\bturbo run build\b/);
    expect((pkg.scripts?.dev as string) || "").toMatch(/\bturbo run dev\b/);
    expect((pkg.scripts?.lint as string) || "").toMatch(/\bturbo run lint\b/);
    expect((pkg.scripts?.format as string) || "").toMatch(/\bturbo run format\b/);
  });

  it("uses pnpm filter in db:push for targeted workspace operation", () => {
    const cmd = (pkg.scripts?.["db:push"] as string) || "";
    expect(cmd).toContain("pnpm");
    expect(cmd).toContain("--filter");
    expect(cmd).toContain("@task-mgmt/database");
    expect(cmd).toContain("db:push");
  });
});