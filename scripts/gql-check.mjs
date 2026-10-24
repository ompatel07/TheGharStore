// Windows-safe replacement for `hydrogen gql check --fail-on-warn`.
//
// Hydrogen's checker passes the schema as an absolute path (E:\...), which gql.tada
// parses as a URL with scheme "e:" and tries to fetch. Using relative schema paths
// runs the exact same check. On Linux/macOS (and CI) `npm run typecheck` is fine.
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { rmSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const hydrogenRequire = createRequire(require.resolve("@shopify/hydrogen/package.json"));
const cli = join(dirname(hydrogenRequire.resolve("gql.tada/package.json")), "bin/cli.js");

const tsconfig = `.hydrogen-gql-${randomUUID()}.json`;
writeFileSync(
  tsconfig,
  JSON.stringify({
    extends: "./tsconfig.json",
    compilerOptions: {
      plugins: [
        {
          name: "gql.tada/ts-plugin",
          schemas: [
            {
              name: "storefront",
              schema: "./node_modules/@shopify/hydrogen/dist/storefront.schema.json",
              tadaOutputLocation: "storefront-graphql-env.d.ts",
            },
            {
              name: "customer-account",
              schema: "./node_modules/@shopify/hydrogen/dist/customer-account.schema.json",
              tadaOutputLocation: "customer-account-graphql-env.d.ts",
            },
          ],
          trackFieldUsage: false,
        },
      ],
    },
  }),
);

try {
  const result = spawnSync(
    process.execPath,
    [cli, "check", "--tsconfig", tsconfig, "--level", "info", "--fail-on-warn"],
    { stdio: "inherit" },
  );
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(tsconfig, { force: true });
}
