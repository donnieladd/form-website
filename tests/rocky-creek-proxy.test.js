import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const mount = "/rockycreek-proposal";
const origin = "https://rocky-creek-proposal.vercel.app/rockycreek-proposal";

test("the canonical Rocky Creek mount proxies to the dedicated proposal project", () => {
  assert.deepEqual(config.rewrites.slice(0, 2), [
    { source: mount, destination: origin },
    { source: `${mount}/:path*`, destination: `${origin}/:path*` },
  ]);
});

test("the parent static CSP excludes the proxied proposal mount", () => {
  const staticSecurity = config.headers.find(({ headers }) =>
    headers.some(({ key }) => key === "Content-Security-Policy"),
  );
  assert.equal(staticSecurity?.source, "/((?!rockycreek-proposal(?:/|$)).*)");
  assert.notEqual(staticSecurity?.source, "/(.*)");
});
