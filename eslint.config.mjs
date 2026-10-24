import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Claude Code worktrees (e.g. .claude/worktrees/*) live nested inside
    // this directory and have their own .next build output that the
    // patterns above don't reach — exclude the whole tree.
    ".claude/**",
  ]),
]);

export default eslintConfig;
