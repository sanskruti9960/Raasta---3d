# Standard Operating Procedure (SOP)
## Smartphone Monocular Video Capture for 3D Gaussian Splatting
**Project:** Raasta-3D  
**Competition:** Namma Space, Techfest IIT Bombay & Juspay  
**Target:** 100% Free, Accessible, High-Fidelity Indoor 3D Reconstruction  

---

### 1. Objective
This Standard Operating Procedure (SOP) establishes a rigorous, repeatable methodology for converting standard smartphone handheld video into metric 3D Gaussian Splatting (3DGS) digital twins without LiDAR, specialized depth rigs, or paid commercial software.

---

### 2. Required Equipment
| Item | Specification | Cost |
| :--- | :--- | :--- |
| **Capture Device** | Any standard smartphone (iOS / Android) capable of 1080p or 4K recording | Free (Existing phone) |
| **Gimbal / Tripod** | Optional (smooth handheld walking is fully supported) | Free |
| **Target Space** | Indoor room, office, lab, or apartment (200 – 2,000 sq. ft.) | Free |

---

### 3. Pre-Capture Facility Preparation
1. **Lighting Equalization:**
   - Turn on all overhead ceiling lights to achieve uniform, diffuse ambient illumination.
   - Close blinds or curtains if harsh outdoor sunlight casts rapid, sharp shadows on the floor.
   - Avoid strobe lighting or variable RGB ambient LEDs.
2. **Environment Stabilization:**
   - Clear all dynamic elements: people, pets, and movable clutter from the walking path.
   - Keep interior doors fully open or fully closed throughout the duration of the scan.
3. **Reflective & Transparent Surfaces:**
   - Large mirrors or clear glass doors lack distinctive optical features. Place small visual fiducials (e.g., small sticky notes or tape crosses) on glass corners to allow COLMAP feature triangulation.

---

### 4. Camera Software Configuration
Before pressing Record, apply the following settings in your native smartphone camera app:

| Parameter | Recommended Setting | Rationale |
| :--- | :--- | :--- |
| **Resolution** | 4K UHD (3840×2160) or 1080p FHD | Maximizes sub-pixel feature detection in distant corners. |
| **Framerate** | 30 FPS or 60 FPS | Minimizes rolling shutter distortion; 60 FPS is optimal for sharper frames. |
| **AE/AF Lock** | **LOCKED (Mandatory)** | Tap and hold the center of the room to lock Exposure and Autofocus. Prevents sudden illumination jumps when panning toward bright lamps or dark corners. |
| **Color Profile** | Standard / Natural (HDR OFF) | Dynamic HDR tonemapping causes photometric inconsistency across frames. |
| **Stabilization** | Standard EIS enabled | Reduces jerky high-frequency handheld vibration. |

---

### 5. Kinematic Capture Trajectory
Structure-from-Motion (SfM) requires dense optical parallax ($\ge 75\%$ overlap between consecutive keyframes). Follow this two-pass loop trajectory:

```
[Start Point] ─── Pass 1: Forward Perimeter Loop ───┐
     ▲                                                │
     │                                                ▼
[Loop Closure] ◄── Pass 2: Inward POI Sweep ──────────┘
```

#### Step 5.1: The Gait
- Adopt a "Ninja Walk" (knees slightly bent, rolling foot from heel to toe) to maintain a smooth, vibration-free camera trajectory.
- Walk at a steady pace of approximately **0.3 to 0.5 meters per second** (do not rush).

#### Step 5.2: Pass 1 — Perimeter & Structural Boundary Loop
- Start at the main entrance doorway.
- Keep the phone held horizontally at chest/eye level (~1.5m above ground).
- Walk slowly along the outer perimeter of the room, facing straight ahead.
- When turning corners, pivot your entire body gradually rather than snapping the camera abruptly.

#### Step 5.3: Pass 2 — Internal POI & Feature Inward Sweep
- After completing the outer boundary, walk an interior concentric track.
- Angle the camera $25^\circ - 35^\circ$ inward toward central landmarks: workstations, conference tables, server racks, signage, and equipment.
- Orbit around key Points of Interest (POIs) to ensure $360^\circ$ volumetric coverage.

#### Step 5.4: Loop Closure (Crucial)
- Finish your recording trajectory at the exact point and orientation where you started.
- Re-capturing the starting frame allows COLMAP's global bundle adjustment to detect loop closure and eliminate accumulated metric drift.

---

### 6. Recommended Duration & Video Size
- **Small Room (150 – 300 sq. ft.):** 1.5 – 2.5 minutes ($\approx 300 - 500$ frames at 2 FPS).
- **Medium Lab / Office (500 – 1,200 sq. ft.):** 2.5 – 4 minutes ($\approx 600 - 900$ frames).
- **Video File Size:** Typically $300\text{MB} - 1.2\text{GB}$.

---

### 7. Post-Capture Verification Checklist
Before leaving the physical space, verify:
- [ ] No extreme motion blur during corner transitions.
- [ ] No sudden exposure shifts or blown-out white balance.
- [ ] Complete loop closure achieved.
- [ ] All relevant POIs (entrances, tech bays, exits) clearly visible from at least 3 distinct camera angles.

---

### 8. Cloud Reconstruction Execution
Transfer the recorded `.mp4` video directly to Google Colab using the provided `pipeline/Namma_Space_Raasta3D_Pipeline.ipynb` script:
```bash
# Automated COLMAP + Frame Extraction
ns-process-data video --data indoor_capture.mp4 --output-dir /content/processed_data

# Train 3D Gaussian Splats (splatfacto)
ns-train splatfacto --data /content/processed_data --max-num-iterations 15000

# Export & Clean in SuperSplat
ns-export gaussian-splat --load-config /content/outputs/.../config.yml --output-dir /content/exported_splat
```
The resulting `.ply` / `.splat` file is immediately dropped into **Raasta-3D** for real-time web walkthroughs and AR indoor pathplanning.

