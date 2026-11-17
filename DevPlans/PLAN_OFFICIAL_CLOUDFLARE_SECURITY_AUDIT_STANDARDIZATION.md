# Plan: Official `cloudflare/security-audit-skill` Standardization — Savazai-presenter (MotionStudio)

## Steps
1. Install `skills/security-audit/*` from `https://github.com/cloudflare/security-audit-skill` into `.agents/skills/cloudflare-security-audit/`.
2. Replace `sirv --cors` in `Dockerfile` and `package.json` with hardened `server.mjs` emitting `CSP`, `HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, `COEP`, path-traversal protection, and running as non-root `USER node`.
3. Upgrade `jspdf` to `^4.2.1` to eliminate `dompurify` critical/high XSS vulnerabilities.
4. Create `scripts/run-security-audit.mjs` and add `"security:audit"` to `package.json`.
5. Update `AGENTS.md` and `README.md`.
6. Run `npm run security:audit`, `npx tsc --noEmit`, `npm run build`, `docker compose -p savazai-presenter up -d --build`, `graphify update .`, and push to `origin`.
