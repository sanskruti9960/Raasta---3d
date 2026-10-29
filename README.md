# 🌌 Raasta-3D: Intelligent Spatial Engine
### Namma Space Competition • Techfest, IIT Bombay × Juspay
> **Transforming standard smartphone video captures into photorealistic, interactive 3D digital twins with spatial POI search and optimal non-colliding indoor pathplanning.**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black.svg)](https://threejs.org/)
[![Gaussian Splatting](https://img.shields.io/badge/3D%20Gaussian%20Splatting-Nerfstudio-orange.svg)](https://docs.nerf.studio/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Hosting](https://img.shields.io/badge/Deploy-Vercel%20%2F%20Netlify-cyan.svg)](https://vercel.com/)

---

## 🎯 Competition Context
The **Namma Space competition by Techfest, IIT Bombay** (in partnership with **Juspay**) challenges participants to build an end-to-end intelligent spatial engine that converts smartphone video of indoor spaces into interactive 3D digital twins. Instead of static 2D blueprints, the platform enables:
1. **Remote Virtual Walkthroughs** (Free-roam WASD + Pointer Lock, 60 FPS 3D Gaussian Splatting)
2. **Spatial Point of Interest (POI) Search & Management** (Interactive 3D beacons, fuzzy search palette, telemetry)
3. **Optimal Non-Colliding Indoor Pathplanning** (A* navmesh pathfinding, glowing 3D animated floor trail, turn-by-turn guidance HUD)
4. **AR Navigation Simulation** (Mobile HUD with 360° compass tape, spatial targeting reticle, and wayfinding cues for next-gen Juspay checkout and retail exploration)

---

## 🛠️ 100% Free Technology Stack
| Layer | Tool / Library | Purpose | Cost |
| :--- | :--- | :--- | :--- |
| **Capture Device** | Standard Smartphone | 4K/1080p Monocular Video via custom SOP | **Free** |
| **Video Decomposition** | `ffmpeg` | Extracts dense keyframes at optimal FPS | **Free** |
| **Structure-from-Motion** | `COLMAP` (via Nerfstudio) | Computes 6-DoF camera poses & sparse point cloud | **Free** |
| **Radiance Field Training** | `Nerfstudio (splatfacto)` | Trains 3D Gaussian Splatting representation | **Free** |
| **Cloud Computing** | Google Colab / Kaggle | Free NVIDIA T4 GPU accelerator (15-min training) | **Free** |
| **Splat Pruning & LOD** | `SuperSplat` | Web editor to crop floaters & compress to `.splat`/`.ksplat` | **Free** |
| **Client Engine** | React 19 + Vite + TypeScript | Modern, high-performance web architecture | **Free** |
| **3D Rendering** | Three.js + `gaussian-splats-3d` | 60 FPS WebGL splat rasterization & depth-tested meshes | **Free** |
| **Kinematics & Controls** | Pointer Lock + OrbitControls | Seamless toggle between First-Person Walk & Orbit | **Free** |
| **Pathfinding** | A* Graph Engine | Non-colliding shortest path with turn heuristic analysis | **Free** |
| **Free Cloud Hosting** | Vercel / Netlify | Instant live deployment with 1-click CI/CD | **Free** |

---

## 📁 Repository Structure
```
Raasta-3D/
├── docs/                                  # Competition Submission Deliverables
│   ├── CAPTURE_SOP.md                     # Standard Operating Procedure for smartphone capture
│   ├── TECHNICAL_ABSTRACT.md              # Formal technical abstract for Techfest IIT Bombay
│   └── DEMO_VIDEO_SCRIPT.md               # 3-5 minute video narration & storyboard
├── pipeline/                              # 100% Free Processing Pipeline
│   └── Namma_Space_Raasta3D_Pipeline.ipynb# Ready-to-run Google Colab GPU training notebook
├── public/
│   ├── models/                            # Place trained .ply / .splat / .ksplat models here
│   │   └── .gitkeep
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                            # Brand assets
│   ├── components/
│   │   ├── SplatViewer.tsx                # Master 3D Spatial Engine & Splat Renderer
│   │   ├── TopNavbar.tsx                  # Mode toggles, actions, live FPS counter
│   │   ├── Minimap.tsx                    # 2D Interactive radar with player cone & route
│   │   ├── POISearchModal.tsx             # Command palette (Ctrl+K) with distance sorting
│   │   ├── POIDetailsCard.tsx             # Floating 3D POI inspector & navigate trigger
│   │   ├── NavigationHUD.tsx              # Turn-by-turn guidance banner & distance tracker
│   │   ├── AROverlay.tsx                  # 360° Compass tape & spatial target reticle
│   │   ├── UploadModal.tsx                # Drag-and-drop model loader (.ply/.splat/.ksplat/URL)
│   │   ├── DocumentationModal.tsx         # In-app viewer for SOP, pipeline, & abstract
│   │   └── AddPOIDialog.tsx               # Click-on-floor custom POI creation
│   ├── data/
│   │   └── defaultPOIs.ts                 # Default campus & tech facility POIs
│   ├── types/
│   │   ├── spatial.ts                     # TypeScript definitions for POIs, navmesh, & telemetry
│   │   └── gaussian-splats-3d.d.ts        # Type declarations for Gaussian Splats viewer
│   ├── utils/
│   │   ├── navGraph.ts                    # Waypoint graph, Dijkstra/A* pathfinder, turn analysis
│   │   └── indoorSceneBuilder.ts          # 3D digital twin architecture, beacons, & ribbons
│   ├── App.tsx                            # Root application & state orchestrator
│   ├── App.css                            # Glassmorphism dark-cyberpunk UI stylesheet
│   ├── index.css                          # Global viewport reset
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) installed.

### 2. Install Dependencies
```bash
git clone https://github.com/your-username/Raasta-3D.git
cd Raasta-3D
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## ☁️ 1-Click Free Deployment (Vercel / Netlify)
You can deploy Raasta-3D directly to Vercel or Netlify for free:

### Deploy with Vercel CLI:
```bash
npm i -g vercel
vercel
```
Or connect your GitHub repository directly in the **[Vercel Dashboard](https://vercel.com/new)**:
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## 📸 How to Capture and Train Your Own Space
1. **Record Video:** Follow the [Capture SOP](docs/CAPTURE_SOP.md) with your smartphone (slow continuous walk, locked exposure, 70% overlap).
2. **Train in Google Colab:** Open [`pipeline/Namma_Space_Raasta3D_Pipeline.ipynb`](pipeline/Namma_Space_Raasta3D_Pipeline.ipynb) in Google Colab on a free T4 GPU.
3. **Download Model:** Download your trained `.ply` or `.splat` file.
4. **Clean in SuperSplat:** Prune floaters at [SuperSplat Web Editor](https://playcanvas.com/supersplat/editor).
5. **View in Raasta-3D:** Click **Load Model** in the app and drop your file straight into the viewer!

---

## 🏆 Round 1 Submission Checklist
- [x] **Technical Abstract:** [`docs/TECHNICAL_ABSTRACT.md`](docs/TECHNICAL_ABSTRACT.md)
- [x] **Standard Operating Procedure (SOP):** [`docs/CAPTURE_SOP.md`](docs/CAPTURE_SOP.md)
- [x] **3-5 Minute Demo Video Script:** [`docs/DEMO_VIDEO_SCRIPT.md`](docs/DEMO_VIDEO_SCRIPT.md)
- [x] **Proof of Concept Web Viewer:** Responsive, 60 FPS, with free-roam, search, and pathplanning.
- [x] **Open-Source Code Repository:** Production-ready TypeScript + React + Three.js codebase.

---

## 🤝 Acknowledgements & Credits
- **Techfest, IIT Bombay** – Asia's Largest Science & Technology Festival.
- **Juspay** – Leaders in high-scale payment processing, spatial commerce, and mobility innovation.
- **Nerfstudio Team** – Open-source radiance fields & splatfacto engine.
- **Mark Kellogg** – `@mkkellogg/gaussian-splats-3d` Three.js viewer.
