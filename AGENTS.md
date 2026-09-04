# AGENTS.md — MotionStudio Autonomous Engineering Directives & Standards

## 1. Project Overview & Identity
- **Project Name**: MotionStudio (Savazai-Presenter)
- **Primary Repository**: `https://github.com/Savazar01/savazai-presenter`
- **Architecture Principle**: 100% Local-First & Zero-Backend Dependency. All screen recording, WebGL 3D device canvas compositing, Web Audio graph mixing, PDF rasterization, and EPUB3 container generation run strictly client-side in the browser.
- **Port Mandate**: All servers (Vite Dev, Vite Preview, and Docker) MUST bind and listen strictly on **Port 9090** (`0.0.0.0:9090`).

---

## 2. Mandatory Rules & Governance

### Rule 1: Chronological DevPlans Archive Policy
Every development iteration MUST preserve all prompts, implementation plans, and walkthroughs in the dedicated `/DevPlans/` directory:
- Prompts: `/DevPlans/00X_prompt_<feature_name>.md`
- Implementation Plans: `/DevPlans/00X_plan_<feature_name>.md`
- Walkthroughs / Verification: `/DevPlans/00X_walkthrough_<feature_name>.md`
No deletion or overwrite of historical plan files is allowed.

### Rule 2: Code Quality & No Placeholders
- Production-grade code only. No `TODO`, `// placeholder`, `/* implement later */`, or incomplete mock functions.
- Strict TypeScript (`noImplicitAny`, strict null checks).
- Clean resource disposal for Three.js (geometries, materials, textures) and Web Audio (closing AudioContext, disconnecting nodes, stopping media tracks).

### Rule 3: Cross-Origin Isolation & Security
- Vite and Docker servers must deliver headers:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: credentialless`
- Allows high-performance buffers and offscreen workers without blocking external assets/fonts.

---

## 3. Technology Stack & Ecosystem Skills

### 3.1 Shadcn UI & Component Architecture
- Use Tailwind CSS with clean utility classes and accessible component patterns.
- Consistent dark-mode theme: slate/zinc palettes with subtle glassmorphism (`backdrop-blur-md bg-slate-900/80 border border-slate-700/50`).
- Interactive controls: custom sliders, dropdowns, segmented toggles, tabs, and tooltips.

### 3.2 Playwright & E2E Testing Verification
- Build robust, deterministic UI assertions without flaky timing.
- Test viewport rendering, canvas initialization, stream ingestion simulation, and export blob creation.

### 3.3 Graphify Knowledge & State Structuring
- Structure state predictably: Centralized state engine managing capture streams, 3D device transforms, timeline cues, audio nodes, and export jobs.
- Clear unidirectional data flow from State Coordinator -> ThreeSceneManager / TimelineController -> Studio Viewport.

### 3.4 Cloudflare Security & Defensive Client-Side Patterns
- Sanitize any imported JSON / SVG content against XSS before DOM insertion.
- Enforce strict Content Security Policies in exported EPUB3 and HTML presentation bundles.
- Validate binary payloads (MediaRecorder chunks, JSZip buffers, jsPDF buffers) before triggering file downloads.

---

## 4. Multi-Surface Publishing Specifications
1. **Video Exporter**: Deterministic render loop stepping through Anime.js timeline (`timeline.seek(t)`) rendering Three.js canvas + DOM overlays into `MediaRecorder` or WebCodecs offscreen pump.
2. **Interactive Slide Presentation**: Fullscreen presentation mode supporting keyboard cue point stepping (`Space`, `ArrowRight`, `ArrowLeft`), animated transitions, and speaker notes.
3. **PDF Exporter**: 1920x1080 landscape slide deck generator using `jsPDF` and `html2canvas-pro`.
4. **EPUB3 Publisher**: Valid EPUB3 container generator using `JSZip` containing `mimetype`, `META-INF/container.xml`, `content.opf`, `toc.xhtml`, `toc.ncx`, and styled XHTML slide chapters.

---

## 5. Development & Docker Commands
- `npm run dev` — Starts Vite dev server on `http://0.0.0.0:9090`
- `npm run build` — Type checks and builds production bundle to `/dist`
- `npm run preview` — Previews production build on `http://0.0.0.0:9090`
- `docker compose up --build` — Builds and runs the container on `http://localhost:9090`

---

## 6. Mandatory Task Completion & Deployment Protocol
Every prompt, code modification, feature addition, or refactor MUST strictly complete the following 6-step loop before presenting the walkthrough:
1. **TypeScript Validation**: `npx tsc --noEmit` must return exit code 0.
2. **Production Bundle Check**: `npm run build` must compile cleanly.
3. **Automated Docker Deployment**: Automatically run `docker compose up --build -d` to rebuild the container and deploy to Docker Desktop.
4. **Port 9090 Verification**: Programmatically verify that `http://localhost:9090` returns HTTP 200 OK using curl or an automated health probe.
5. **Knowledge Graph Sync**: Always run `graphify update .` to keep repository architecture and dependency graphs synchronized.
6. **Chronological DevPlans Logging**: Document all actions, logs, and verification outputs inside `/DevPlans/` following the established prefix numbering convention.

> [!IMPORTANT]
> A task is **STRICTLY INCOMPLETE** if the Docker container is not active in Docker Desktop and serving on port 9090.
