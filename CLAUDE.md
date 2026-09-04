# CLAUDE.md — Agent System Pointer & Operational Guide

> This project strictly enforces all directives, governance rules, and the Mandatory Delivery Protocol defined in [@AGENTS.md](AGENTS.md).

## Quick Reference
- **Project**: MotionStudio (Visual Showcase & Multi-Surface Publishing Platform)
- **Repository**: [Savazai-presenter](https://github.com/Savazar01/savazai-presenter)
- **Port**: Strictly **9090** (`http://localhost:9090`)
- **DevPlans Archive**: All prompts, plans, and walkthroughs are saved under `/DevPlans/`

## Key Commands
```bash
# Install dependencies
npm install

# Start Vite dev server on port 9090
npm run dev

# Run TypeScript compilation check
npx tsc --noEmit

# Production build
npm run build

# Docker build and run on port 9090
docker compose up --build -d

# Verify live port 9090 health
curl -I http://localhost:9090

# Sync knowledge graph
graphify update .
```

## Mandatory Task Completion & Deployment Protocol
As mandated in [@AGENTS.md](AGENTS.md) Section 6, EVERY task is incomplete until it passes the 6-step loop:
1. `npx tsc --noEmit` returns exit code 0.
2. `npm run build` compiles cleanly.
3. `docker compose up --build -d` deploys container to Docker Desktop.
4. `http://localhost:9090` returns HTTP 200 OK.
5. `graphify update .` synchronizes codebase graph.
6. All actions and logs documented in `/DevPlans/`.
