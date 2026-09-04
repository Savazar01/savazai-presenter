# 004 - Prompt: Docker Desktop Live Run & Verification Mandate

**Date:** 2026-09-04
**Author / Initiator:** Lead Architect
**Status:** In Progress

---

## User Prompt

```text
Prompt - NO TASK IS COMPLETE UNTIL IT IS RUNNING LIVE IN DOCKER DESKTOP AT http://localhost:9090 AND VERIFIED VIA HEALTHCHECK.
Act as the Principal Full-Stack Engineer. I am the Lead Architect.

While the TypeScript typecheck and Vite build succeeded in the walkthrough, you stopped before actually executing the Docker build, running the container, and updating the project knowledge graph. 

Our core operating principle is: NO TASK IS COMPLETE UNTIL IT IS RUNNING LIVE IN DOCKER DESKTOP AT http://localhost:9090 AND VERIFIED VIA HEALTHCHECK.

Execute the following three mandates immediately:

================================================================================
MANDATE 1: RUN DOCKER BUILD & DEPLOY LOCALLY NOW
================================================================================
Execute the following commands right now:
1. Build and run the container in detached mode:
   docker compose down --remove-orphans
   docker compose up --build -d
2. Inspect the runtime status to confirm it is up and healthy:
   docker compose ps
   docker logs motion_studio_app --tail 20
3. Issue an HTTP probe directly against port 9090 (via curl or PowerShell Invoke-WebRequest) to prove it serves HTTP 200:
   curl -I http://localhost:9090
4. Report the exact CLI output of these steps.

================================================================================
MANDATE 2: UPDATE KNOWLEDGE GRAPH
================================================================================
Run the Graphify update command to sync all newly created modules, components, and export services into the local knowledge graph:
   graphify update .

Confirm the command executed cleanly.

================================================================================
MANDATE 3: PERMANENTLY UPDATE AGENTS.md & CLAUDE.md
================================================================================
Update `AGENTS.md` (and ensure `CLAUDE.md` links to it) with an immutable "Mandatory Delivery Protocol" section so you automatically perform this full cycle on EVERY task, change, or update without needing manual reminders:

Add the following protocol to `AGENTS.md`:

### Mandatory Task Completion & Deployment Protocol
Every prompt, code modification, feature addition, or refactor MUST strictly complete the following 6-step loop before presenting the walkthrough:
1. TypeScript Validation: `npx tsc --noEmit` must return exit code 0.
2. Production Bundle Check: `npm run build` must compile cleanly.
3. Automated Docker Deployment: Automatically run `docker compose up --build -d` to rebuild the container and deploy to Docker Desktop.
4. Port 9090 Verification: Programmatically verify that `http://localhost:9090` returns HTTP 200 OK using curl or an automated health probe.
5. Knowledge Graph Sync: Always run `graphify update .` to keep repository architecture and dependency graphs synchronized.
6. Chronological DevPlans Logging: Document all actions, logs, and verification outputs inside `/DevPlans/` following the established prefix numbering convention.

A task is STRICTLY INCOMPLETE if the Docker container is not active in Docker Desktop and serving on port 9090.
```
