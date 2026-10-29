# Test Directory: Sample Indoor Capture Data
**Project:** Raasta-3D  
**Competition:** Namma Space, Techfest IIT Bombay & Juspay (Round 1)

This directory contains test data and sample specifications for the smartphone indoor capture pipeline.

### Files:
- `test_indoor_capture_metadata.json`: Camera intrinsics, capture duration, and trajectory parameters for the Round 1 dataset.
- `camera_trajectory_sample.json`: Sparse 6-DoF camera poses computed via COLMAP for testing local reconstruction.

### Running Reconstruction on Test Data:
To test reconstruction on your own capture:
1. Record a 2-4 minute video of your home/space following `docs/CAPTURE_SOP.md`.
2. Place your video here as `test/indoor_capture.mp4`.
3. Open `pipeline/Namma_Space_Raasta3D_Pipeline.ipynb` in Google Colab (free GPU).
4. Run the notebook to produce the `.ply` or `.splat` model.
5. Drag and drop the model into the Raasta-3D web viewer!

