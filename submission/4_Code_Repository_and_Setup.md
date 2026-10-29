# Code Repository & Setup Instructions
## Project: Raasta-3D (Round 1 Submission)
**Competition:** Namma Space, Techfest IIT Bombay & Juspay  
**Repository URL:** https://github.com/Sarthakadhav/Raasta-3D  

---

### 1. Overview
This package contains the complete, production-ready codebase for **Raasta-3D**, including the 3D WebGL Gaussian Splatting viewer, the spatial POI engine, the non-colliding A* indoor pathplanning engine, the mobile AR navigation simulation, and the 100% free Google Colab training pipeline.

---

### 2. System Requirements
- **Web Browser:** Any modern WebGL-compatible browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari).
- **Node.js:** Version 18.0 or higher.
- **Package Manager:** npm (bundled with Node.js) or yarn / pnpm.
- **Hardware:** Standard laptop or desktop (integrated or dedicated GPU). The viewer runs at 60 FPS.

---

### 3. Step-by-Step Local Setup & Execution

#### Step 1: Clone the Repository
```bash
git clone https://github.com/Sarthakadhav/Raasta-3D.git
cd Raasta-3D
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

#### Step 4: Production Build & Local Preview
```bash
npm run build
npm run preview
```

---

### 4. Running the 100% Free Cloud Reconstruction Pipeline
To train a 3D Gaussian Splat from your own smartphone video:
1. Open [`pipeline/Namma_Space_Raasta3D_Pipeline.ipynb`](../pipeline/Namma_Space_Raasta3D_Pipeline.ipynb) in **Google Colab**.
2. Select **Runtime -> Change runtime type -> Hardware accelerator -> T4 GPU** (100% free).
3. Upload your indoor video (`indoor_capture.mp4`).
4. Run all cells sequentially:
   - Automated frame extraction & COLMAP camera pose estimation (`ns-process-data video`)
   - 3D Gaussian Splatting training (`ns-train splatfacto`)
   - Model export to `.ply` / `.splat` (`ns-export gaussian-splat`)
5. Download the exported file and drag it directly into the Raasta-3D Web Viewer via the **Load Splat** button.

---

### 5. Sample Data in `test/` Directory
The `test/` directory contains:
- `test/test_indoor_capture_metadata.json`: Full technical specifications and sensor parameters of the smartphone capture.
- `test/README.md`: Instructions for testing local reconstructions.

