# Graph Report - Savazai-presenter  (2026-09-04)

## Corpus Check
- 32 files · ~21,237 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 290 nodes · 513 edges · 20 communities (19 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ccc681c5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `ThreeSceneManager` - 43 edges
2. `TimelineController` - 33 edges
3. `CaptureEngine` - 32 edges
4. `compilerOptions` - 18 edges
5. `VideoRecorder` - 15 edges
6. `PipConfig` - 15 edges
7. `CalloutOverlay` - 13 edges
8. `CuePoint` - 12 edges
9. `DeviceType` - 10 edges
10. `TrimRange` - 10 edges

## Surprising Connections (you probably didn't know these)
- `AudioVisualizerProps` --references--> `CaptureEngine`  [EXTRACTED]
  src/components/AudioVisualizer.tsx → src/core/capture/CaptureEngine.ts
- `CaptureControlsProps` --references--> `AudioLevels`  [EXTRACTED]
  src/components/CaptureControls.tsx → src/types/index.ts
- `CaptureControlsProps` --references--> `PipConfig`  [EXTRACTED]
  src/components/CaptureControls.tsx → src/types/index.ts
- `ExportModalProps` --references--> `SlideData`  [EXTRACTED]
  src/components/ExportModal.tsx → src/types/index.ts
- `ExportModalProps` --references--> `CuePoint`  [EXTRACTED]
  src/components/ExportModal.tsx → src/types/index.ts

## Communities (20 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (30): DeviceControls(), DeviceControlsProps, ExportModal(), StudioCanvas(), StudioCanvasProps, TimelineBar(), TimelineBarProps, VideoEditorPanel() (+22 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (10): CaptureEngine, AudioVisualizer(), AudioVisualizerProps, CaptureControls(), CaptureControlsProps, Header(), HeaderProps, PipPlacementPreset (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (4): PresentationMode(), PresentationModeProps, TimelineController, SlideData

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (34): dependencies, animejs, clsx, html2canvas-pro, jspdf, jszip, lucide-react, react (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (15): 003 - Walkthrough & Verification: MotionStudio Visual Showcase Platform, 1. System Overview & Verification Results, 2. Key Modules & Delivered Architecture, 3. Detailed Feature Breakdown, 4. How to Run & Verify, code:block1 (├── AGENTS.md                                # Autonomous en), code:bash (npm install), code:bash (docker compose up --build) (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (14): 1. Project Overview & Identity, 2. Mandatory Rules & Governance, 3.1 Shadcn UI & Component Architecture, 3.2 Playwright & E2E Testing Verification, 3.3 Graphify Knowledge & State Structuring, 3.4 Cloudflare Security & Defensive Client-Side Patterns, 3. Technology Stack & Ecosystem Skills, 4. Multi-Surface Publishing Specifications (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (3): ExportModalProps, VideoRecorder, PipConfig

### Community 9 - "Community 9"
Cohesion: 0.20
Nodes (9): 002 - Implementation Plan: MotionStudio Visual Showcase & Publishing Platform, 1. Executive Summary & Core Objectives, 2. Strict Environment & Governance Constraints, 3. Architecture Specification, 4. Deliverables Checklist, Module 1: Media Ingestion & Web Audio Engine (`src/core/capture/CaptureEngine.ts`), Module 2: 3D Spatial Canvas Engine (`src/core/scene/ThreeSceneManager.ts`), Module 3: Anime.js v4 Unified Motion Choreography (`src/core/motion/TimelineController.ts`) (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict, include

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (6): CLAUDE.md — Agent System Pointer & Operational Guide, code:bash (# Install dependencies), Governance & Architecture Directives, Key Commands, Mandatory Task Completion & Deployment Protocol, Quick Reference

### Community 12 - "Community 12"
Cohesion: 0.50
Nodes (3): 001 - Initial Prompt: MotionStudio Visual Showcase Platform, code:text (Act as the Principal Full-Stack Engineer and Graphics System), User Prompt

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (3): 004 - Prompt: Docker Desktop Live Run & Verification Mandate, code:text (Prompt - NO TASK IS COMPLETE UNTIL IT IS RUNNING LIVE IN DOC), User Prompt

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (11): 005 - Walkthrough & Verification: Docker Desktop Live Run & Knowledge Graph Sync, 1. Executive Summary & Verification Gates Passed, 2. Exact Console Execution Logs, 3. Updated Governance in AGENTS.md, A. Docker Deployment & Container Status, B. HTTP Probe on Port 9090, C. Graphify Knowledge Graph Update, code:bash (> docker compose up --build -d) (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (7): 004 - Studio Editor Enhancements & Verification, 1. Architectural Scope & Objectives, 2. Verification Protocol, A. Additional 3D Device Formats (`src/core/scene/ThreeSceneManager.ts`), B. In-Canvas WebGL Webcam Compositing (`src/core/exporters/VideoRecorder.ts` & `src/components/CaptureControls.tsx`), B. In-Canvas WebGL Webcam Compositing (`src/core/scene/ThreeSceneManager.ts` & `src/core/capture/CaptureEngine.ts`), C. Studio Video Editor & Asset Uploader (`src/components/VideoEditorPanel.tsx` & `src/App.tsx`)

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (4): 005 - MotionStudio Production & UX Remediation Walkthrough, 1. Executive Summary & Root Cause Analysis, 2. Mandatory Protocol Verification Matrix, 3. Git Commit Verification

## Knowledge Gaps
- **104 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ThreeSceneManager` connect `Community 2` to `Community 0`, `Community 8`, `Community 4`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `CaptureEngine` connect `Community 1` to `Community 0`, `Community 8`, `Community 2`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `TimelineController` connect `Community 4` to `Community 0`, `Community 8`, `Community 2`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13140096618357489 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11174242424242424 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10052910052910052 - nodes in this community are weakly interconnected._