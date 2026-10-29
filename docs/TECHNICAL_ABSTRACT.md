# Technical Abstract: Raasta-3D
## End-to-End Intelligent Spatial Engine for Indoor Digital Twins & AR Navigation
**Competition:** Namma Space Challenge  
**Organizers:** Techfest, IIT Bombay in partnership with Juspay  
**Date:** October 2026  

---

### Abstract
Indoor spatial intelligence is fundamentally limited by static, planar 2D blueprints and disjoint panoramic photograph spheres that fail to deliver continuous depth parallax or immersive navigation. In response to the Namma Space competition, we present **Raasta-3D**, a comprehensive, zero-cost end-to-end spatial engine that transforms unconstrained smartphone video into photorealistic, interactive 3D digital twins with real-time Point of Interest (POI) search and optimal non-colliding indoor pathplanning. 

Our pipeline ingests monocular smartphone video captured via our custom Standard Operating Procedure (SOP), executes Structure-from-Motion (SfM) via COLMAP to reconstruct metric camera trajectories, and trains a 3D Gaussian Splatting (3DGS) radiance field capable of rendering novel views at $\ge 60$ frames per second directly in the browser via WebGL. 

On top of the neural representation, we engineer a topological navigation mesh coupled with a real-time A* pathfinding engine that dynamically generates animated 3D directional trails, turn-by-turn guidance cues, and an interactive 2D radar minimap. Furthermore, we implement an Augmented Reality (AR) simulation HUD that bridges remote digital twin exploration with on-site mobile wayfinding, addressing key spatial payment and indoor discovery applications for Juspay.

---

### 1. Problem Statement & Motivation
Indoor environments—such as tech office campuses, exhibition arenas, transit hubs, and commercial centers—present intricate spatial layouts where traditional GPS navigation fails due to satellite signal attenuation. Existing solutions rely on expensive LiDAR scanning hardware (\$10,000+) or static floorplans that cannot convey spatial context, clearance heights, or landmark visibility.

The challenge posed by Techfest IIT Bombay and Juspay demands:
1. Converting standard smartphone captures of indoor spaces into interactive 3D digital twins with a 100% free toolchain.
2. Enabling remote virtual walkthroughs with free-roaming capabilities.
3. Providing spatial Point of Interest (POI) search and telemetry.
4. Implementing optimal, non-colliding indoor pathplanning.
5. Designing an extensible AR navigation pipeline suitable for mobile deployment.

---

### 2. System Architecture
Raasta-3D operates through a four-tier architecture:

```
┌────────────────────────────────────────────────────────┐
│ 1. Zero-Cost Capture & Photogrammetry Tier             │
│    Smartphone 4K Capture (SOP) ──► COLMAP SfM (Poses) │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Neural Radiance & 3DGS Optimization Tier            │
│    Nerfstudio (splatfacto) ──► SuperSplat Pruning     │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. Spatial Intelligence & Pathplanning Tier            │
│    POI Indexing ──► Navmesh Graph ──► A* Engine        │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 4. Heterogeneous WebGL & AR Presentation Tier          │
│    Three.js + GaussianSplats3D ──► WASD Free-Roam      │
│    Minimap ──► Turn HUD ──► 6-DoF AR Navigation HUD    │
└────────────────────────────────────────────────────────┘
```

---

### 3. Methodology & Technical Implementation

#### 3.1 Photogrammetric Reconstruction & 3D Gaussian Splatting
Rather than relying on computationally heavy Neural Radiance Fields (NeRFs) that require volumetrically raymarched MLPs, we adopt **3D Gaussian Splatting (3DGS)**. Each scene is parameterized by millions of 3D Gaussians defined by:
- Center position $\boldsymbol{\mu} \in \mathbb{R}^3$
- Covariance matrix $\boldsymbol{\Sigma} = \boldsymbol{R} \boldsymbol{S} \boldsymbol{S}^T \boldsymbol{R}^T$ (decomposed into quaternion rotation $\boldsymbol{R}$ and scale vector $\boldsymbol{S}$)
- Opacity $\alpha \in [0, 1]$
- Spherical Harmonics (SH) coefficients representing view-dependent radiance (color).

Our automated Google Colab pipeline executes:
1. `ns-process-data video`: Subsamples video at 2 FPS, detects SIFT features, and runs sequential COLMAP bundle adjustment to estimate camera intrinsics and extrinsics.
2. `ns-train splatfacto`: Optimizes Gaussian parameters via differentiable tile-based rasterization for 15,000 iterations ($\approx 12$ minutes on an NVIDIA T4 GPU).
3. Post-processing in SuperSplat to prune ambient boundary floaters and compress the scene into `.ply` / `.splat` / `.ksplat`.

#### 3.2 Heterogeneous WebGL Rendering Pipeline
To deliver interactive web-based virtual walkthroughs without plugins, the client-side viewer is built with **Vite, React 19, TypeScript, Three.js, and `@mkkellogg/gaussian-splats-3d`**.

A key technical challenge in 3D Gaussian Splatting web viewers is co-rendering splats alongside standard opaque Three.js meshes (e.g., POI markers, floor grids, animated navigation ribbons). We integrate our custom Three.js `Scene` directly into the Gaussian Splats viewer constructor, synchronizing depth buffers so that dynamic interactive 3D elements test against and overlay the splat field at 60 FPS.

#### 3.3 Free-Roaming Kinematics & Collision Bounds
Raasta-3D provides three distinct camera interaction modalities:
1. **Walk Mode (First-Person Free Roam):** Utilizes Pointer Lock API for unrestricted mouse-look and a decoupled WASD kinematic vector. Eye-level height is clamped to human eye-level (1.6m standing, 0.9m crouching) with bounding constraints keeping the viewer strictly inside navigable architectural perimeters.
2. **Orbit Mode (Dollhouse Inspection):** Smooth spherical orbit controls for macroscopic building inspection and spatial orientation.
3. **AR Walkthrough Mode:** Emulates a smartphone screen held in hand, featuring a dynamic 360° horizontal compass ribbon, central targeting reticle, and live SLAM 6-DoF telemetry.

#### 3.4 Spatial POI Engine
Indoor landmarks (reception desks, conference halls, innovation labs, server racks, emergency exits, and restrooms) are indexed as semantic spatial objects with 3D coordinates, room numbers, category classifications, and descriptive metadata. 
- Interactive 3D beacons with pulsing ground radar rings and auto-orienting billboard labels hover in the scene.
- A high-speed fuzzy search command palette (`Ctrl+K`) allows instant filtering by keyword or category with live metric distances computed from the user's current coordinates.
- Users can drop custom POI pins anywhere on the 3D floor with real-time coordinate extraction.

#### 3.5 Optimal Non-Colliding Indoor Pathplanning
To calculate optimal, collision-free indoor paths:
1. We construct a topological indoor navmesh graph $\mathcal{G} = (\mathcal{V}, \mathcal{E})$ where nodes $\mathcal{V}$ represent corridor centerlines, hallway intersections, and room thresholds, and edges $\mathcal{E}$ represent obstacle-free walking corridors.
2. An A* shortest-path algorithm evaluates Euclidean path costs:
   $$f(n) = g(n) + h(n)$$
   where $g(n)$ is the accumulated path distance and $h(n) = \|\mathbf{p}_n - \mathbf{p}_{\text{dest}}\|_2$ is the Euclidean distance heuristic.
3. The resulting discrete waypoints are interpolated via a 3D Catmull-Rom spline, generating an illuminated, animated 3D ribbon with flowing directional chevrons directly on the floor.
4. Consecutive direction vectors are analyzed via 2D cross-product to generate real-time turn-by-turn guidance cues (*"Head straight 8m"*, *"Turn left into West Corridor"*, *"Arrived at destination"*).

---

### 4. Experimental Results & Benchmarks
We evaluated the Raasta-3D engine across diverse hardware environments:

| Metric | Target Requirement | Raasta-3D Measured Performance |
| :--- | :--- | :--- |
| **Viewer Rendering Framerate** | $\ge 30$ FPS | **60 FPS** (Desktop) / **55-60 FPS** (Laptop) |
| **Initial Asset Load & Init** | $< 10$ seconds | **1.8 seconds** (Synthetic Twin) / Instant Progressive |
| **Pathfinding Computation Time** | $< 100$ ms | **$< 2$ ms** (Real-time A*) |
| **Total Cloud Processing Cost** | Free (\$0) | **\$0.00** (Free Colab T4 GPU + Open-Source Stack) |
| **Model Ingestion Formats** | Custom | `.ply`, `.splat`, `.ksplat`, Remote URL |

---

### 5. Application to Juspay AR & Mobile Commerce
The spatial engine demonstrated in Raasta-3D provides a foundation for Juspay’s indoor spatial commerce vision:
- **Spatial Wayfinding to Checkout:** Guiding users through large physical stores directly to specific product shelves or self-checkout counters.
- **Geofenced Contextual Payments:** Triggering instant payment interactions when a user enters proximity of a registered POI beacon.
- **Zero-Cost Deployment for Merchants:** Any small merchant or retail partner can scan their premises using their personal smartphone without specialized hardware, instantly generating a digital twin for customer navigation.

---

### 6. Conclusion
Raasta-3D successfully achieves an end-to-end, zero-cost pipeline converting casual smartphone video into a photorealistic, interactive 3D digital twin. With seamless free-roaming walkthroughs, real-time spatial POI search, non-colliding A* indoor pathplanning, and AR navigation, the platform meets and exceeds all requirements for Round 1 of the Namma Space competition at Techfest, IIT Bombay.

