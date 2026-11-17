# Graph Report - Savazai-presenter  (2026-11-17)

## Corpus Check
- 82 files · ~69,077 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 744 nodes · 1098 edges · 60 communities (55 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b4b56e13`
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
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]

## God Nodes (most connected - your core abstractions)
1. `ThreeSceneManager` - 44 edges
2. `CaptureEngine` - 37 edges
3. `TimelineController` - 33 edges
4. `VideoRecorder` - 27 edges
5. `ProcessedWebcamPipeline` - 26 edges
6. `PipConfig` - 23 edges
7. `CalloutOverlay` - 21 edges
8. `compilerOptions` - 18 edges
9. `WebcamProcessor` - 16 edges
10. `TrimRange` - 16 edges

## Surprising Connections (you probably didn't know these)
- `AudioVisualizerProps` --references--> `CaptureEngine`  [EXTRACTED]
  src/components/AudioVisualizer.tsx → src/core/capture/CaptureEngine.ts
- `CaptureControlsProps` --references--> `CaptureEngine`  [EXTRACTED]
  src/components/CaptureControls.tsx → src/core/capture/CaptureEngine.ts
- `CaptureControlsProps` --references--> `ProcessedWebcamPipeline`  [EXTRACTED]
  src/components/CaptureControls.tsx → src/core/capture/ProcessedWebcamPipeline.ts
- `ExportModalProps` --references--> `SlideData`  [EXTRACTED]
  src/components/ExportModal.tsx → src/types/index.ts
- `ExportModalProps` --references--> `ThreeSceneManager`  [EXTRACTED]
  src/components/ExportModal.tsx → src/core/scene/ThreeSceneManager.ts

## Communities (60 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (52): AudioVisualizer(), CaptureControls(), CaptureControlsProps, DeviceControls(), DeviceControlsProps, ExportModalProps, Header(), HeaderProps (+44 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (14): ExportModal(), PresentationMode(), PresentationModeProps, escapeXml(), exportDeckToPdf(), exportToEpub(), triggerFileDownload(), DEFAULT_CUE_POINTS (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (36): dependencies, animejs, clsx, html2canvas-pro, jspdf, jszip, lucide-react, @mediapipe/selfie_segmentation (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (15): 003 - Walkthrough & Verification: MotionStudio Visual Showcase Platform, 1. System Overview & Verification Results, 2. Key Modules & Delivered Architecture, 3. Detailed Feature Breakdown, 4. How to Run & Verify, code:block1 (├── AGENTS.md                                # Autonomous en), code:bash (npm install), code:bash (docker compose up --build) (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (15): 1. Project Overview & Identity, 2. Mandatory Rules & Governance, 3.1 Shadcn UI & Component Architecture, 3.2 Playwright & E2E Testing Verification, 3.3 Graphify Knowledge & State Structuring, 3.4 Cloudflare Security & Defensive Client-Side Patterns, 3.4 Official Cloudflare Security Audit & Quality Gates (`cloudflare/security-audit-skill`), 3. Technology Stack & Ecosystem Skills (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (4): ProcessedWebcamPipeline, WebcamProcessor, VideoRecorder, WebcamBackgroundConfig

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

### Community 20 - "Community 20"
Cohesion: 0.40
Nodes (4): 1. Objectives & Overview, 2. File Deliverables & Key Changes, 3. Protocol Verification Results, DevPlan 008: Native Resolution Dynamic Aspect-Ratio, True Live Recording Switcher & Working Virtual Background Pipeline

### Community 21 - "Community 21"
Cohesion: 0.40
Nodes (4): 020 — Savazar Ecosystem Branding Refactor & Remote Freeze, 1. Executive Summary, 2. Terminology & Branding Alignment, 3. Pre-Push Validation Protocol

### Community 22 - "Community 22"
Cohesion: 0.40
Nodes (4): 1. Overview & Objectives, 2. File Modifications & New Modules, 3. Protocol Verification Results, DevPlan 006: Recording Booth, Web Audio DSP, and Webcam Overhaul

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (4): 1. Objectives & Overview, 2. File Changes & Deliverables, 3. Protocol Verification Results, DevPlan 007: Unified Compositor, Interactive Recording Paradigm & Streamlined UX Overhaul

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (7): DocumentPipCallbacks, DocumentPipManager, DocumentPipState, RecordingBoothOverlay(), RecordingBoothOverlayProps, MotionStudioRecordingPill(), MotionStudioRecordingPillProps

### Community 25 - "Community 25"
Cohesion: 0.50
Nodes (3): 1. Architectural Overview & Context, 2. Core Remediation Components, 3. Verification & Mandatory Delivery Protocol

### Community 26 - "Community 26"
Cohesion: 0.50
Nodes (3): 1. Architectural Overview & Problem Context, 2. Implemented Solutions, 3. Mandatory Delivery Verification Loop

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (7): 1. Problem Statement & Root Cause Analysis, 2. Implemented Architecture & Solutions, 3. Verification Protocol & Live Status, A. Non-Blocking Export Pipeline with Active Cancellation (\VideoRecorder.ts\ & \ExportModal.tsx\), B. Mutable Ref Transport State Machine (\App.tsx\ & \VideoRecorder.ts\), C. Zero-GC Reusable Composite Buffers & Solid Avatar Base (\ProcessedWebcamPipeline.ts\), DevPlan 012 � Export 95% Deadlock Resolution, Transport State Synchronization, Robust Mask Retention & Stream Isolation

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (3): 1. Context & Architectural Root Causes, 2. Key Architectural Remediations, 3. Mandatory Delivery Verification Loop

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (7): 1. Problem Statement & Root Cause, 2. Implemented Architecture & Solutions, 3. Verification Protocol & Live Status, A. True 2-Layer Avatar Compositor (\ProcessedWebcamPipeline.ts\), B. Zero-Click Automatic Document PiP & Ghost Mode (\DocumentPipManager.ts\ & \RecordingBoothOverlay.tsx\), C. Curated Categorized Background Dropdown (\CaptureControls.tsx\), DevPlan 013 � True Multi-Layer Avatar Compositing, Automatic Document PiP Activation, and Curated Background Dropdown

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (8): 014: Restore Entire Screen Capture, Zero-Click Document PiP Activation & Segmentation Stabilization, 1. Capture Engine (`src/core/capture/CaptureEngine.ts`), 2. Studio Canvas (`src/components/StudioCanvas.tsx`), 3. MediaPipe & Webcam Pipeline (`src/core/capture/ProcessedWebcamPipeline.ts`), 4. Document PiP Manager & Controller (`src/core/capture/DocumentPipManager.ts`, `src/App.tsx`, `src/components/RecordingBoothOverlay.tsx`), Changes Implemented, Objective, Verification & Deployment

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (7): 015: MotionStudio Complete UI/UX Suite Refactor, Setup Modal & Multi-Track Studio, 1. Pre-Recording Setup Modal (`src/components/setup/MotionStudioSetupModal.tsx`), 2. Streamlined Recording Transport Pill (`src/components/setup/MotionStudioRecordingPill.tsx`), 3. MotionStudio Multi-Track Studio Suite, Key Architecture & Features Delivered, Objective, Verification & Deployment Summary

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (4): ProjectModal(), ProjectModalProps, MotionStudioProjectSummary, ProjectManager

### Community 33 - "Community 33"
Cohesion: 0.20
Nodes (9): 016: MotionStudio Green Screen Fix, Dual-Bar Cleanup, In-Memory Studio Ingestion, Video Upload & IndexedDB Project Management, 1. WebGL & Video Recorder (`ThreeSceneManager.ts`, `VideoRecorder.ts`), 2. Streamlined Controller (`MotionStudioRecordingPill.tsx`), 3. In-Memory Studio Ingestion (`App.tsx`), 4. Video & Photo Upload Engine (`App.tsx`, `LeftToolRail.tsx`), 5. Local-First Project Management (`ProjectManager.ts`, `ProjectModal.tsx`, `Header.tsx`), Architectural Changes, Objective (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.18
Nodes (10): 017 — Default Frameless Staging, Single Controller Enforcement, Guaranteed Recording Ingestion & Audio Device Priority, 1. Executive Summary & Problem Resolution, 2.1 [ProjectManager.ts](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/core/projects/ProjectManager.ts) & [App.tsx](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/App.tsx), 2.2 [MotionStudioRecordingPill.tsx](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/components/setup/MotionStudioRecordingPill.tsx), 2.3 [StudioCanvas.tsx](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/components/StudioCanvas.tsx), 2.4 [App.tsx](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/App.tsx), 2.5 [MotionStudioSetupModal.tsx](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/components/setup/MotionStudioSetupModal.tsx), 2. Key Code Modifications (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.22
Nodes (8): 018 — Project Hold Checkpoint & Repository State Ledger, 1. Project Overview & Operational Status, 2.1 Core Graphics, Canvas & Audio Engine, 2.2 UI & Timeline Architecture, 2.3 Multi-Surface Publishing, 2. Current Architectural Status, 3. Known Open Issues Ledger (For Future Remediation), 4. Verification & Sync Record

### Community 36 - "Community 36"
Cohesion: 0.09
Nodes (23): 🎙️ 1. Interactive Capture Setup, 1. Run Containerized on Port 9090 (Recommended), 2. Run Locally for Development, 🎨 2. Studio Editor Suite, 🎞️ 3. Multi-Track Timeline & Ingestion, 💾 4. Local-First Project Management, 📦 5. Multi-Surface Publishing Exporters, code:bash (# Build and start container in detached mode) (+15 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (16): 1. Architectural Philosophy & Constraints, 1. Architectural Philosophy & Principles, 2. High-Level System Architecture, 3.1 ThreeSceneManager (WebGL 3D Staging Engine), 3.2 ProcessedWebcamPipeline & Segmentation, 3.3 CaptureEngine & Web Audio Mixer, 3.4 VideoRecorder (Deterministic & Live Exporter), 3.5 TimelineController (Kinematics & Cue Sequencing) (+8 more)

### Community 38 - "Community 38"
Cohesion: 0.40
Nodes (4): 019 — Production Documentation & Repository Hold Freeze, 1. Executive Summary, 2. Deliverables Added, 3. Pre-Push Verification Record

### Community 39 - "Community 39"
Cohesion: 0.11
Nodes (18): Anti-patterns, Core principles, Cost budget, Coverage and prior runs, Full audit planning, Full audit setup, Full audit workflow, Operating modes (+10 more)

### Community 40 - "Community 40"
Cohesion: 0.12
Nodes (14): bannedCode, bannedSources, codeFiles, content, dockerfile, failures, lower, probeLive() (+6 more)

### Community 41 - "Community 41"
Cohesion: 0.12
Nodes (15): code:text (## Defensive vulnerability-finding method), code:text (Artifact promotion procedure (trusted parent-side code only)), code:text (## Candidate gate), code:json ({), code:json ({), Core hunting method — include in every hunter prompt, Core validation rules — include in every hunter prompt, Coverage-critic waves (+7 more)

### Community 42 - "Community 42"
Cohesion: 0.15
Nodes (12): Candidate-verifier prompt, code:text (You did not write this candidate. Try to refute it from repo), code:text (Artifact promotion procedure (trusted parent-side code only)), code:sh (node <skill-dir>/validate-findings.cjs <output-dir>/findings), `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`, Phase 3: Independently validate every candidate, Phase 4: Write and validate `findings.json` (+4 more)

### Community 43 - "Community 43"
Cohesion: 0.17
Nodes (11): Client-Side and Browser Hunting, code:block1 (- A client-side candidate needs a controllable source and an), Core discipline (include in every agent prompt for this domain), Cross-origin messaging and network attack classes (subagent_type: `general`), Cross-site information leak classes (subagent_type: `general`), DOM and object-state attack classes (subagent_type: `general`), Service-worker and browser-storage attack classes (subagent_type: `general`), UI-redress and navigation attack classes (subagent_type: `general`) (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.17
Nodes (11): Cloud and Deployment Hunting, code:block1 (- Do not infer a live exposure from a manifest alone. Establ), Configuration and secret lifecycle attack classes (subagent_type: `general`), Container and orchestration attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Ingress, network, and control-plane attack classes (subagent_type: `general`), Managed storage, events, and edge attack classes (subagent_type: `general`), Universal moves (apply across the above) (+3 more)

### Community 45 - "Community 45"
Cohesion: 0.17
Nodes (11): Application-state and device-lifecycle attack classes (subagent_type: `general`), code:block1 (- Establish the realistic local or remote-content attacker: ), Core discipline (include in every agent prompt for this domain), Deep-link, callback, and navigation attack classes (subagent_type: `general`), Desktop, Mobile, and Local IPC Hunting, Local IPC and exported-component attack classes (subagent_type: `general`), Privileged-helper and local-file attack classes (subagent_type: `general`), Universal moves (apply across the above) (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.17
Nodes (11): Binary loading and runtime attack classes (subagent_type: `general`), Bounds, integer, and representation attack classes (subagent_type: `general`), code:block1 (- Re-derive every bound and lifetime from attacker-controlle), Core discipline (include in every agent prompt for this domain), FFI and ABI attack classes (subagent_type: `general`), Kernel and privileged-interface attack classes (subagent_type: `general`), Lifetime, type, and concurrency attack classes (subagent_type: `general`), Memory Safety, Binary, and Kernel Hunting (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.17
Nodes (11): API-key and mTLS attack classes (subagent_type: `general`), Browser-session attack classes (subagent_type: `general`), code:block1 (- Framing and cache findings require two interpretations of ), Core discipline (include in every agent prompt for this domain), Federated-identity attack classes (subagent_type: `general`), HTTP framing and cache attack classes (subagent_type: `general`), HTTP-Protocol and Authentication Hunting, MFA, passkey, and account-transition attack classes (subagent_type: `general`) (+3 more)

### Community 48 - "Community 48"
Cohesion: 0.18
Nodes (10): AI, LLM, and Agent Hunting, code:block1 (- Prompt injection alone is not a finding. Require a code-le), Context, retrieval, and memory attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), MCP and sub-agent trust classes (subagent_type: `general`), Output and disclosure attack classes (subagent_type: `general`), Tool and action attack classes (subagent_type: `general`), Universal moves (apply across the above) (+2 more)

### Community 49 - "Community 49"
Cohesion: 0.18
Nodes (10): code:block1 (- A tenant or owner field on a record is not isolation. Find), Core discipline (include in every agent prompt for this domain), Data Isolation and Lifecycle Hunting, Deletion, revocation, and lifecycle attack classes (subagent_type: `general`), Derived-data and disclosure attack classes (subagent_type: `general`), Export, backup, restore, and migration attack classes (subagent_type: `general`), Tenant and object-isolation attack classes (subagent_type: `general`), Universal moves (apply across the above) (+2 more)

### Community 50 - "Community 50"
Cohesion: 0.18
Nodes (10): Broker and queue isolation attack classes (subagent_type: `general`), code:block1 (- "Internal" is not authentication. Name the peer identity a), Core discipline (include in every agent prompt for this domain), Framing, schema, and interpretation attack classes (subagent_type: `general`), Protocols, RPC, and Messaging Hunting, Replay, ordering, and transaction attack classes (subagent_type: `general`), RPC identity and authorization attack classes (subagent_type: `general`), Universal moves (apply across the above) (+2 more)

### Community 51 - "Community 51"
Cohesion: 0.18
Nodes (10): Architecture summary and companion selection, code:text (Read the target at <target>. Do not use network access. Retu), code:text (Read all source that establishes identity, authorization, is), code:text (Inventory every source-visible place external or lower-trust), code:text (Read tests, build definitions, manifests, packaging, and mai), code:json ({), Deterministic coverage ledger, Phase 1: Map the source and plan coverage (+2 more)

### Community 52 - "Community 52"
Cohesion: 0.18
Nodes (10): code:block1 (- Require an input-to-cost path, a missing effective bound, ), Computational amplification attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Failure and recovery attack classes (subagent_type: `general`), Quota and scheduling attack classes (subagent_type: `general`), Resource accumulation attack classes (subagent_type: `general`), Resource Exhaustion and Availability Hunting, Universal moves (apply across the above) (+2 more)

### Community 53 - "Community 53"
Cohesion: 0.20
Nodes (9): CI and automation attack classes (subagent_type: `general`), code:block1 (- A mutable or known-vulnerable dependency is not a finding ), Core discipline (include in every agent prompt for this domain), Dependency and build-input attack classes (subagent_type: `general`), Release and update attack classes (subagent_type: `general`), Supply Chain and Release Hunting, Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (5): CSP_POLICY, __dirname, distDir, MIME_TYPES, server

### Community 55 - "Community 55"
Cohesion: 0.40
Nodes (4): $comment, items, oneOf, type

### Community 56 - "Community 56"
Cohesion: 0.40
Nodes (4): 1. Skill & Governance Standardization, 2. Official Security Audit Findings & Remediation Summary, 3. Sign-Off, Walkthrough: Official `cloudflare/security-audit-skill` Standardization — Savazai-presenter (MotionStudio)

## Knowledge Gaps
- **344 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+339 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ThreeSceneManager` connect `Community 2` to `Community 0`, `Community 8`, `Community 4`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `CaptureEngine` connect `Community 1` to `Community 0`, `Community 24`, `Community 8`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `TimelineController` connect `Community 4` to `Community 0`, `Community 8`, `Community 2`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _344 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0958904109589041 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1422924901185771 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10541310541310542 - nodes in this community are weakly interconnected._