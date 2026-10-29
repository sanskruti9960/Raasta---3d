# 3 to 5-Minute Demonstration Video Guide & Script
## Project: Raasta-3D (Round 1 Submission)
**Competition:** Namma Space, Techfest IIT Bombay & Juspay  
**Format:** Screen Recording + Voiceover (or Webcam Picture-in-Picture)  
**Total Target Duration:** 3:30 – 4:30 Minutes  

---

### Video Outline & Timeline
| Timestamp | Segment | Primary Visual on Screen |
| :--- | :--- | :--- |
| **0:00 – 0:45** | **1. Scope & Objective** | Web viewer opening, title badge, Round 1 problem statement. |
| **0:45 – 1:30** | **2. Capture SOP & Cloud Pipeline** | Video capture technique + Google Colab T4 GPU notebook & SuperSplat. |
| **1:30 – 2:30** | **3. 3D Web Walkthrough & Roaming** | First-person Walk Mode (WASD + mouse look), collision bounds, crouching, 60 FPS counter. |
| **2:30 – 3:15** | **4. POI & Room Labeling** | Clicking room floors to reveal designated names, Ctrl+K command palette, 3D pins. |
| **3:15 – 4:00** | **5. Desktop Pathplanning & Obstacle Avoidance** | "Navigate Here" click, glowing 3D trail avoiding sofa & island, turn HUD, Minimap radar. |
| **4:00 – 4:30** | **6. AR Navigation Bonus & Conclusion** | AR HUD, 360° compass tape, Juspay indoor commerce vision, thank you. |

---

### Step-by-Step Spoken Script & Screen Actions

#### Segment 1: Introduction & Scope (0:00 – 0:45)
- **Visual:** Open browser to the live Raasta-3D viewer. Show the top navbar with "Raasta-3D | Namma Space • Round 1 • IIT Bombay × Juspay".
- **Spoken Audio:**
  > *"Hello judges and team at Techfest, IIT Bombay and Juspay! Welcome to our demonstration of **Raasta-3D**—an end-to-end intelligent spatial engine built for the Namma Space competition.*
  > 
  > *While physical spaces remain essential, deciphering static 2D blueprints or disorienting photo spheres is outdated. For Round 1, our mission is to build a complete software pipeline that turns ordinary smartphone captures of real indoor environments—specifically an accessible home space—into an interactive 3D digital twin. Remote visitors can freely explore in first person, search for specific items or rooms, and see the best walking path that routes cleanly around real physical obstacles like walls and furniture."*

---

#### Segment 2: Custom Smartphone Capture SOP & 100% Free Cloud Pipeline (0:45 – 1:30)
- **Visual:** Click the **Round 1 Submission Kit** button on the navbar. Show the Capture SOP grid and the Google Colab pipeline code blocks.
- **Spoken Audio:**
  > *"To achieve this completely free without expensive LiDAR, we defined a custom Standard Operating Procedure for smartphone capture. Using any ordinary smartphone with locked auto-exposure and an even walking gait, we capture a two-pass concentric loop—first the outer perimeter, then an inward sweep of interior landmarks with &ge; 75% overlap.*
  > 
  > *Our backend runs entirely on free Google Colab T4 GPUs. Nerfstudio's ns-process-data extracts keyframes and runs COLMAP Structure-from-Motion to estimate metric camera poses, and splatfacto trains millions of 3D Gaussians in just 14 minutes. After cropping floaters in the free SuperSplat web editor, our model is ready for real-time web walkthroughs."*

---

#### Segment 3: Virtual Desktop Walkthrough & Free-Roaming (1:30 – 2:30)
- **Visual:** Close the modal. Switch to **Walk Mode**. Click on the canvas to lock mouse pointer. Walk using W/A/S/D through the living room, kitchen, and hallway. Press Shift to sprint, and C to crouch. Point out the stable 60 FPS counter in the top right.
- **Spoken Audio:**
  > *"Now let's experience the zero-install virtual desktop walkthrough. With a single click, we enter First-Person Walk Mode with Pointer Lock mouse look.*
  > 
  > *Using standard WASD keys, we can freely roam through the space just like a video game. Notice the ultra-smooth 60 frames per second rendering powered by Three.js and GaussianSplats3D. Collision bounds prevent the camera from clipping outside the architectural perimeter, and eye-level height is clamped to 1.6 meters, with a 0.9-meter crouch when pressing 'C'. Even without active navigation running, roaming is completely fluid and responsive."*

---

#### Segment 4: POI Labeling & Room Zone Clicking (2:30 – 3:15)
- **Visual:** Click on the Living Room floor—watch the **Room Details Card** pop up showing "Living Room & Media Lounge, 280 sq. ft., Key Objects: 3-Seater Sofa, Coffee Table, TV Console". Then press `Ctrl+K` to open the POI Search. Type "3-Seater Sofa" or "Desk". Select it and watch the camera smoothly fly to the 3D glowing beacon.
- **Spoken Audio:**
  > *"Our engine provides comprehensive spatial labeling. In compliance with Round 1 criteria, clicking on any room or zone—such as the Living Room, Kitchen, Bedroom, or Study—instantly reveals its designated name, area, and key furniture.*
  > 
  > *Furthermore, specific Points of Interest are marked with 3D glowing beacons and pulsing ground radar waves. Pressing Ctrl+K opens our search palette with live metric distance calculations. Clicking the '3-Seater Sectional Sofa' smoothly flies our camera right to the beacon."*

---

#### Segment 5: Desktop Pathplanning & Physical Obstacle Avoidance (3:15 – 4:00)
- **Visual:** Click **Navigate to this Room** or **Navigate Here** on the POI card. Show the glowing 3D cyan ribbon appearing on the floor with animated flowing chevrons. Show how the path routes around the sofa, coffee table, and kitchen island rather than clipping through them. Point out the **Navigation HUD** at the top and the live **Minimap** in the bottom-right.
- **Spoken Audio:**
  > *"Now for the mandatory desktop navigation engine. When we select a destination, Raasta-3D calculates the optimal non-colliding walking path in under 2 milliseconds using an A* algorithm over our topological navmesh.*
  > 
  > *Notice that the path stays strictly on the floor and routes cleanly around real physical obstacles—guiding the visitor around the sofa, coffee table, and kitchen island. An animated 3D ribbon with flowing directional chevrons lights up the floor, while our top HUD provides turn-by-turn guidance cues and estimated walking time, perfectly synchronized with our 2D radar minimap."*

---

#### Segment 6: Mobile AR Navigation Bonus & Conclusion (4:00 – 4:30)
- **Visual:** Switch to **AR Mode**. Show the 360° horizontal compass tape, targeting reticle with live distance, and SLAM telemetry. Zoom out to Orbit Mode to show the full digital twin.
- **Spoken Audio:**
  > *"As an advanced bonus targeting full-time opportunities with Juspay, we implemented an Augmented Reality Navigation Mode. Emulating a smartphone view on-site, it features a 360° horizontal compass ribbon, targeting reticle, and live distance tracking.*
  > 
  > *For Juspay, this unlocks incredible potential: guiding customers directly to product aisles or self-checkout counters, and triggering proximity-based geofenced payments as users arrive at registered spatial beacons.*
  > 
  > *All code, Colab notebooks, and SOP documentation are fully available in our GitHub repository. Thank you Techfest, IIT Bombay and Juspay!"*

