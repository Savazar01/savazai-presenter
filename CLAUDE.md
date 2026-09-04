# CLAUDE.md — Agent System Pointer & Operational Guide

> This project follows all directives and rules defined in [@AGENTS.md](AGENTS.md).

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

# Preview build on port 9090
npm run preview

# Docker build and run on port 9090
docker compose up --build
```

## Governance & Architecture Directives
Refer to [@AGENTS.md](AGENTS.md) for complete details on:
- Chronological DevPlans persistence
- Local-first client-side rendering pipeline (Three.js, Web Audio, Anime.js, jsPDF, JSZip)
- Shadcn UI, Playwright, Graphify, and Cloudflare security standards
- 3D device staging, dynamic video texture binding, and multi-surface export pipelines
