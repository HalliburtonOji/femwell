#!/usr/bin/env node
// deploy.mjs — one-command FemWell deploy, no Chrome / no builder page.
//
// HOW IT WORKS
//   Deploys are authenticated by a Base44 *platform* OAuth token (client `base44_cli`,
//   scope apps:read apps:write) — NOT by a BASE44_API_KEY (the api_key only reaches the
//   SDK data API and 401s on /deploy). The token lives in ~/.base44/auth/auth.json,
//   written once by `base44 login` (device-code flow). This script:
//     1. reads that token,
//     2. auto-refreshes it via oauth/token (grant_type=refresh_token) when expired,
//     3. POSTs /api/apps/<id>/deploy  (the same call the builder's "Publish" makes),
//     4. polls femwells.com until the live bundle hash flips.
//
// SETUP (once, secure — nothing pasted into chat):
//     npm i -g base44   &&   base44 login      (confirm the device code in the browser)
//   That writes ~/.base44/auth/auth.json. The refresh token rotates on each use, so as
//   long as you deploy at least every ~30 days it stays alive; if it ever lapses, just
//   re-run `base44 login`.
//
// USAGE:   node scripts/deploy.mjs
//
// NOTE: auth.json lives in your HOME dir (~/.base44), NOT in this repo, so it can never
// be committed. This script contains no secrets.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const APP_ID = process.env.BASE44_APP_ID || "69a9891a6ccccc1822bbb4bc";
const API = process.env.BASE44_API_URL || "https://app.base44.com";
const AUTH_PATH = path.join(os.homedir(), ".base44", "auth", "auth.json");
const LIVE_URL = process.env.FEMWELL_URL || "https://femwells.com/";
const CLIENT_ID = "base44_cli";

const log = (...a) => console.log(...a);
const die = (msg) => { console.error("✗ " + msg); process.exit(1); };

function readAuth() {
  if (!fs.existsSync(AUTH_PATH))
    die(`No token at ${AUTH_PATH}. Run once:  npm i -g base44 && base44 login`);
  return JSON.parse(fs.readFileSync(AUTH_PATH, "utf8"));
}
function writeAuth(a) { fs.writeFileSync(AUTH_PATH, JSON.stringify(a)); }

async function refresh(auth) {
  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("refresh_token", auth.refreshToken);
  body.set("client_id", CLIENT_ID);
  const r = await fetch(`${API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Base44 CLI" },
    body: body.toString(),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !(j.access_token || j.accessToken))
    die(`Token refresh failed (${r.status}: ${j.error || ""}). Re-run: base44 login`);
  const at = j.access_token || j.accessToken;
  const claims = JSON.parse(Buffer.from(at.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
  const updated = {
    ...auth,
    accessToken: at,
    refreshToken: j.refresh_token || j.refreshToken || auth.refreshToken,
    expiresAt: claims.exp ? claims.exp * 1000 : Date.now() + (j.expires_in || 3600) * 1000,
  };
  writeAuth(updated);
  log("• refreshed access token");
  return updated;
}

async function validToken() {
  let auth = readAuth();
  if (Date.now() >= auth.expiresAt - 60_000) {
    log("• token expired — refreshing…");
    auth = await refresh(auth);
  }
  return auth.accessToken;
}

async function currentHash() {
  const html = await fetch(LIVE_URL, { cache: "no-store" }).then((r) => r.text());
  const m = html.match(/index-[A-Za-z0-9_-]+\.js/);
  return m ? m[0] : null;
}

async function main() {
  const token = await validToken();
  const H = { Authorization: `Bearer ${token}` };

  // 1. PULL the latest commits from GitHub into Base44's managed source. Base44 does NOT
  //    auto-pull on push — without this, /deploy just rebuilds the previously-synced code.
  const sync = await fetch(`${API}/api/apps/${APP_ID}/github/sync`, {
    method: "POST", headers: { ...H, "Content-Type": "application/json" }, body: "{}",
  });
  if (sync.status === 401) die("Token rejected (401). Re-run: base44 login");
  const sj = await sync.json().catch(() => ({}));
  if (sync.status !== 200) die(`github/sync failed: ${sync.status} ${JSON.stringify(sj).slice(0, 160)}`);
  log(`• synced GitHub → ${(sj.latest_commit_hash || "?").slice(0, 7)}${sj.already_up_to_date ? " (already up to date)" : ` (+${sj.commits_pulled} commit${sj.commits_pulled === 1 ? "" : "s"})`}`);

  // 2. confirm app is in a deployable state
  const meta = await fetch(`${API}/api/apps/${APP_ID}`, { headers: H });
  if (meta.status === 401) die("Token rejected (401). Re-run: base44 login");
  const mj = await meta.json().catch(() => ({}));
  const state = mj.status && (mj.status.state || mj.status.status);
  log(`• app: ${mj.name || APP_ID} · state: ${state || "?"}`);

  const before = await currentHash();
  log(`• live bundle before: ${before}`);

  const dep = await fetch(`${API}/api/apps/${APP_ID}/deploy`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: "{}",
  });
  if (dep.status !== 200) die(`Deploy POST failed: ${dep.status} ${(await dep.text()).slice(0, 200)}`);
  log("✓ deploy POST 200 — watching the live bundle…");

  // The bundle hash only changes when the built output differs. A re-deploy of
  // identical code keeps the same hash — that's success, not a failure. So: poll
  // for a flip for ~90s; if it flips, the new code is live; if not, the deploy
  // still succeeded and the live content is unchanged.
  for (let i = 1; i <= 15; i++) {
    await new Promise((r) => setTimeout(r, 6000));
    const h = await currentHash();
    if (h && h !== before) { log(`✓ LIVE: ${before} → ${h}  (after ~${i * 6}s)`); return; }
    if (i % 3 === 0) log(`  …still ${h} (${i * 6}s)`);
  }
  log(`✓ Deployed OK. Bundle unchanged (${before}) — no code diff since the last deploy, so the hash stays the same. If you just pushed new code, give Base44 a moment to finish building, then re-run.`);
}

main().catch((e) => die(e.message || String(e)));
