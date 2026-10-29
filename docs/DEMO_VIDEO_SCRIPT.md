# 3-5 Minute Demo Video Script & Storyboard
## Raasta-3D: End-to-End Indoor Digital Twin & AR Engine
**Competition:** Namma Space, Techfest IIT Bombay & Juspay  
**Format:** Screen Recording + Voiceover (or Webcam Picture-in-Picture)  
**Total Target Duration:** 3:30 – 4:30 Minutes  

---

### Video Outline & Timeline
| Timestamp | Segment | Primary Visual on Screen |
| :--- | :--- | :--- |
| **0:00 – 0:40** | Introduction & Problem | Web Viewer opening, title badge, high-level mission. |
| **0:40 – 1:20** | Free Video-to-3D Pipeline & SOP | Quick shot of phone recording + Google Colab notebook & SuperSplat. |
| **1:20 – 2:15** | Free-Roaming Virtual Walkthrough | Walk mode (WASD + mouse look), collision bounds, crouching, 60 FPS counter. |
| **2:15 – 3:00** | Spatial POI Search & Discovery | Command palette (`Ctrl+K`), category filters, clicking POI for smooth fly-to. |
| **3:00 – 3:45** | Optimal Non-Colliding Pathplanning | Clicking "Navigate Here", animated glowing floor trail, turn HUD, Minimap radar. |
| **3:45 – 4:20** | AR Navigation Mode & Juspay Vision | AR Mode HUD, compass tape, target reticle, application to indoor commerce. |
| **4:20 – 4:30** | Conclusion & GitHub Repo Link | Closing remarks, repository link, Techfest IIT Bombay & Juspay thank you. |

---

### Second-by-Second Spoken Script & Actions

#### Section 1: Introduction (0:00 – 0:40)
- **Visual:** Open browser to the hosted Raasta-3D web app. Highlight the "Raasta-3D | Namma Space • IIT Bombay × Juspay" header.
- **Spoken Audio:**
  > *"Hello judges and team at Techfest, IIT Bombay and Juspay! Welcome to our demonstration of **Raasta-3D**—an end-to-end intelligent spatial engine built for the Namma Space competition.*
  > 
  > *Traditional indoor navigation and mapping rely on flat 2D blueprints or static photo spheres that lack true depth. Today, we are showcasing a complete, 100% free pipeline that transforms standard smartphone video into an interactive 3D digital twin with free-roaming walkthroughs, spatial Point of Interest search, and optimal non-colliding indoor pathplanning."*

---

#### Section 2: Smartphone Capture SOP & Free Cloud Pipeline (0:40 – 1:20)
- **Visual:** Click the **SOP & Abstract** button on the navbar. Briefly show the Capture SOP and Free Processing Pipeline tabs, then transition to the Google Colab notebook tab.
- **Spoken Audio:**
  > *"To ensure our solution is completely accessible and cost-free, we established a strict Standard Operating Procedure for smartphone capture. Using any standard smartphone with locked auto-exposure and 70% frame overlap, anyone can map an indoor space without LiDAR or paid equipment.*
  > 
  > *Our backend runs entirely on free Google Colab T4 GPUs: cutting keyframes with ffmpeg, running Structure-from-Motion with COLMAP, and optimizing 3D Gaussian Splats via Nerfstudio’s splatfacto algorithm in under 15 minutes. The resulting model is cleaned in SuperSplat and rendered natively in our web viewer."*

---

#### Section 3: Free-Roaming Walkthrough (1:20 – 2:15)
- **Visual:** Close docs modal. Switch to **Walk Mode**. Click on the canvas to lock mouse pointer. Walk using W/A/S/D through corridors, sprint with Shift, crouch with C. Point out the constant 60 FPS counter in the top right.
- **Spoken Audio:**
  > *"Let's dive into the core experience: the free-roaming virtual walkthrough. With a single click, we enter first-person Walk Mode with Pointer Lock mouse-look.*
  > 
  > *Using standard WASD controls, we can freely explore the space at a realistic human eye-level of 1.6 meters. Notice the buttery-smooth 60 frames per second rendering powered by Three.js and GaussianSplats3D. Collision bounds prevent the camera from clipping outside the architectural perimeter, and pressing 'C' smoothly lowers our perspective to a crouch, enabling realistic virtual inspection of equipment and clearances."*

---

#### Section 4: Spatial POI Search & Discovery (2:15 – 3:00)
- **Visual:** Press `Ctrl+K` or click **Search POI**. Type "Juspay" or "Server". Filter by category chips. Click on a POI card; watch the camera smoothly fly to the 3D beacon. Show the 3D floating pin with its pulsing radar ground ring.
- **Spoken Audio:**
  > *"Next is our Spatial Point of Interest system. Pressing Ctrl+K opens our instant command palette. We can search by name, room number, or category—such as Innovation Labs, Tech Hubs, Amenities, or Safety Exits.*
  > 
  > *Notice that every POI displays real-time calculated distance from our current position. When I click on the Juspay Spatial Innovation Lab, the camera smoothly transitions via a 3D spline flight right to the location. Each POI features an interactive floating beacon, billboard nameplate, and a pulsing radar wave on the ground."*

---

#### Section 5: Optimal Non-Colliding Indoor Pathplanning (3:00 – 3:45)
- **Visual:** On the POI Details card, click **Navigate Here (A* Path)**. Watch the animated glowing cyan ribbon and directional chevrons appear on the floor. Look at the top **Navigation HUD** showing turn directions ("In 4m, turn left"). Look at the **Minimap** in the bottom-right showing the live player cone and blue route line. Walk along the path.
- **Spoken Audio:**
  > *"Now for the pathplanning engine. When we click 'Navigate Here', Raasta-3D computes the optimal non-colliding indoor path in under 2 milliseconds using an A* algorithm over our indoor navmesh.*
  > 
  > *Look at the floor: an animated, illuminated ribbon appears with directional light chevrons guiding the visitor forward around walls and obstacles. Simultaneously, our Navigation HUD provides step-by-step turn instructions with remaining walking distance and estimated arrival time, while our 2D radar minimap tracks our real-time coordinates and heading angle."*

---

#### Section 6: AR Navigation Mode & Juspay Vision (3:45 – 4:20)
- **Visual:** Switch mode to **AR Mode**. Show the top 360° horizontal compass ribbon moving as the camera rotates, the central spatial reticle, and the telemetry status ("SLAM 6-DoF TRACKING ACTIVE", "JUSPAY SPATIAL ENGINE").
- **Spoken Audio:**
  > *"Finally, we present our Augmented Reality Navigation Mode. Designed to emulate a smartphone held in front of a visitor on-site, this mode features a dynamic horizontal compass tape, targeting reticle, and live distance readouts.*
  > 
  > *For Juspay, this unlocks incredible potential: guiding customers directly to specific product shelves, locating self-checkout kiosks, or triggering proximity-based frictionless payments as users arrive at registered spatial beacons."*

---

#### Section 7: Conclusion (4:20 – 4:30)
- **Visual:** Zoom out to Orbit Mode to show the entire digital twin facility. Display GitHub repo URL.
- **Spoken Audio:**
  > *"All code is fully open-source in our GitHub repository, complete with the Google Colab training notebook and documentation. Thank you Techfest, IIT Bombay and Juspay for this challenge!"*

---

### Tips for Recording
1. **Screen Resolution:** Record at 1080p (1920×1080) in full-screen browser (press `F11` to hide browser tabs if desired).
2. **Audio:** Use a clean USB microphone or headset; speak clearly at a natural, enthusiastic pace.
3. **Software:** Use OBS Studio (Free) or Loom.

