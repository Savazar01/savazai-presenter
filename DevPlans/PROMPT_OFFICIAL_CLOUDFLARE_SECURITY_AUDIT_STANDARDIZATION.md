# Prompt: Official `cloudflare/security-audit-skill` Standardization — Savazai-presenter (MotionStudio)

## Objective
Standardize `Savazai-presenter` (`MotionStudio`, `:9090`) on the official Cloudflare Security Audit Skill (`https://github.com/cloudflare/security-audit-skill`):
1. Install the unmodified official `cloudflare/security-audit-skill` into `.agents/skills/cloudflare-security-audit/`.
2. Update `AGENTS.md`, `README.md`, and create `scripts/run-security-audit.mjs` (`npm run security:audit`).
3. Execute the full official security audit against static source, `Dockerfile`, and live `http://localhost:9090/`, remediate all findings (hardened `server.mjs` replacing `sirv --cors`, non-root `USER node`, all 6 security headers + `COOP`/`COEP`, upgrade `jspdf` to resolve `dompurify` XSS critical/high advisories), rebuild Docker non-destructively (`savazai-presenter`), sync `graphify`, and push to GitHub.
