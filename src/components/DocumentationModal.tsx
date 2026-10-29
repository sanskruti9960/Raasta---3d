import { useState } from 'react';
import {
  FileText,
  X,
  Camera,
  Cpu,
  Layers,
  Award,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentationModal({ isOpen, onClose }: DocumentationModalProps) {
  const [activeTab, setActiveTab] = useState<'sop' | 'pipeline' | 'abstract' | 'techfest'>('sop');
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="google-docs-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="docs-modal-header">
          <div className="docs-title-block">
            <FileText className="text-blue" size={22} />
            <div>
              <h2 className="docs-title">Raasta-3D Technical Documentation & SOP</h2>
              <p className="docs-sub">Namma Space Competition • Techfest, IIT Bombay & Juspay</p>
            </div>
          </div>
          <button className="dialog-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="docs-tab-bar">
          <button
            className={`docs-tab ${activeTab === 'sop' ? 'active' : ''}`}
            onClick={() => setActiveTab('sop')}
          >
            <Camera size={16} />
            <span>Capture SOP (Smartphone)</span>
          </button>
          <button
            className={`docs-tab ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            <Cpu size={16} />
            <span>Free Processing Pipeline</span>
          </button>
          <button
            className={`docs-tab ${activeTab === 'abstract' ? 'active' : ''}`}
            onClick={() => setActiveTab('abstract')}
          >
            <Layers size={16} />
            <span>Technical Abstract</span>
          </button>
          <button
            className={`docs-tab ${activeTab === 'techfest' ? 'active' : ''}`}
            onClick={() => setActiveTab('techfest')}
          >
            <Award size={16} />
            <span>IIT Bombay & Juspay Criteria</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="docs-content-body">
          {activeTab === 'sop' && (
            <div className="sop-section">
              <h3 className="section-heading">Standard Operating Procedure (SOP) for Smartphone Indoor Capture</h3>
              <p className="section-desc">
                High-quality 3D Gaussian Splatting relies on dense visual parallax, minimal motion blur, and consistent illumination.
                Follow this SOP to capture any indoor facility with 100% free equipment.
              </p>

              <div className="sop-grid">
                <div className="sop-card">
                  <div className="sop-card-num">01</div>
                  <h4 className="sop-card-title">Camera Configuration</h4>
                  <ul className="sop-list">
                    <li><strong>Resolution:</strong> 4K UHD (or 1080p minimum) at 30fps or 60fps.</li>
                    <li><strong>Lock Auto-Exposure & Focus (AE/AF Lock):</strong> Tap and hold the screen to lock exposure to prevent sudden brightness jumps between hallway sections.</li>
                    <li><strong>Aspect Ratio:</strong> 16:9 standard video.</li>
                    <li><strong>Turn OFF HDR / Dynamic Filters:</strong> Standard color profile ensures photometric consistency for radiance fields.</li>
                  </ul>
                </div>

                <div className="sop-card">
                  <div className="sop-card-num">02</div>
                  <h4 className="sop-card-title">Physical Capture Trajectory</h4>
                  <ul className="sop-list">
                    <li><strong>Walking Speed:</strong> Slow, continuous heel-to-toe gait (approx. 0.5 meters/sec).</li>
                    <li><strong>Loop Closure:</strong> Always finish your capture loop at the exact position where you started to eliminate COLMAP drift.</li>
                    <li><strong>Two-Pass Capture:</strong>
                      <br />• Pass 1: Eye-level facing forward at 0° horizontal.
                      <br />• Pass 2: Facing 30° inward toward room corners & POIs.
                    </li>
                    <li><strong>Overlap:</strong> Maintain &ge; 70-80% visual overlap between sequential video frames.</li>
                  </ul>
                </div>

                <div className="sop-card">
                  <div className="sop-card-num">03</div>
                  <h4 className="sop-card-title">Lighting & Environment</h4>
                  <ul className="sop-list">
                    <li><strong>Even Diffuse Illumination:</strong> Turn on all room lights; close blinds if harsh direct sunlight creates moving glare.</li>
                    <li><strong>Clear Dynamic Objects:</strong> Ensure people, pets, or moving vehicles are not in the frame during capture.</li>
                    <li><strong>Glass & Mirrors:</strong> If large mirrors exist, tape small reference markers/post-its on corners to aid feature matching.</li>
                  </ul>
                </div>

                <div className="sop-card">
                  <div className="sop-card-num">04</div>
                  <h4 className="sop-card-title">Video Quality Verification</h4>
                  <ul className="sop-list">
                    <li>Scrub through your video on phone before leaving the space.</li>
                    <li>Verify no severe motion blur when panning around sharp corners.</li>
                    <li>Recommended video duration: 2 to 4 minutes per 500 sq ft room.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="pipeline-section">
              <h3 className="section-heading">100% Free Processing Pipeline (Google Colab / Kaggle)</h3>
              <p className="section-desc">
                Execute end-to-end 3D reconstruction in the cloud using free T4 GPUs. Nerfstudio's <code>ns-process-data</code> automatically executes COLMAP Structure-from-Motion.
              </p>

              <div className="pipeline-steps">
                {/* Step 1 */}
                <div className="pipeline-step-item">
                  <div className="step-badge">Step 1</div>
                  <div className="step-content">
                    <h4>Environment Setup & Nerfstudio Installation (Colab)</h4>
                    <p>Run inside a fresh Google Colab notebook with T4 GPU runtime enabled:</p>
                    <div className="code-block">
                      <pre>
{`!pip install --upgrade pip
!pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
!pip install ninja
!pip install nerfstudio`}
                      </pre>
                      <button
                        className="copy-btn"
                        onClick={() =>
                          copyCode(
                            '!pip install --upgrade pip\n!pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118\n!pip install ninja\n!pip install nerfstudio',
                            1
                          )
                        }
                      >
                        {copiedCodeIndex === 1 ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="pipeline-step-item">
                  <div className="step-badge">Step 2</div>
                  <div className="step-content">
                    <h4>Automated Frame Extraction & COLMAP Camera Pose Estimation</h4>
                    <p>
                      Nerfstudio cuts the video at optimal keyframe density and computes sparse camera poses via COLMAP:
                    </p>
                    <div className="code-block">
                      <pre>
{`!ns-process-data video \\
  --data /content/indoor_capture.mp4 \\
  --output-dir /content/processed_data \\
  --num-frames-target 300`}
                      </pre>
                      <button
                        className="copy-btn"
                        onClick={() =>
                          copyCode(
                            '!ns-process-data video --data /content/indoor_capture.mp4 --output-dir /content/processed_data --num-frames-target 300',
                            2
                          )
                        }
                      >
                        {copiedCodeIndex === 2 ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="pipeline-step-item">
                  <div className="step-badge">Step 3</div>
                  <div className="step-content">
                    <h4>Train 3D Gaussian Splatting Model (splatfacto)</h4>
                    <p>Fast training (~10-15 minutes on free Google Colab T4 GPU):</p>
                    <div className="code-block">
                      <pre>
{`!ns-train splatfacto \\
  --data /content/processed_data \\
  --max-num-iterations 15000 \\
  --output-dir /content/outputs`}
                      </pre>
                      <button
                        className="copy-btn"
                        onClick={() =>
                          copyCode(
                            '!ns-train splatfacto --data /content/processed_data --max-num-iterations 15000 --output-dir /content/outputs',
                            3
                          )
                        }
                      >
                        {copiedCodeIndex === 3 ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="pipeline-step-item">
                  <div className="step-badge">Step 4</div>
                  <div className="step-content">
                    <h4>Export to 3D Gaussian Splat (.ply / .splat)</h4>
                    <div className="code-block">
                      <pre>
{`!ns-export gaussian-splat \\
  --load-config /content/outputs/processed_data/splatfacto/.../config.yml \\
  --output-dir /content/exported_splat`}
                      </pre>
                      <button
                        className="copy-btn"
                        onClick={() =>
                          copyCode(
                            '!ns-export gaussian-splat --load-config /content/outputs/processed_data/splatfacto/.../config.yml --output-dir /content/exported_splat',
                            4
                          )
                        }
                      >
                        {copiedCodeIndex === 4 ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="pipeline-step-item">
                  <div className="step-badge">Step 5</div>
                  <div className="step-content">
                    <h4>Clean Floating Junk in SuperSplat & Drop into Raasta-3D</h4>
                    <p>
                      Open the free web editor <a href="https://playcanvas.com/supersplat/editor" target="_blank" rel="noreferrer" className="text-blue underline">SuperSplat</a>, crop background floaters, export as <code>.splat</code> or <code>.ksplat</code>, and drag-and-drop straight into Raasta-3D!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'abstract' && (
            <div className="abstract-section">
              <h3 className="section-heading">Technical Abstract: Raasta-3D Spatial Engine</h3>
              <div className="abstract-card">
                <p>
                  <strong>Abstract:</strong> Traditional indoor spatial management relies on static 2D blueprints or low-density panoramic photo bubbles that lack continuous parallax and spatial depth. <em>Raasta-3D</em> introduces an end-to-end intelligent spatial computing platform designed for the Namma Space competition (Techfest, IIT Bombay & Juspay).
                </p>
                <p>
                  Our system ingests casual smartphone monocular video, applies Structure-from-Motion (COLMAP) to reconstruct metric camera trajectories, and optimizes 3D Gaussian Splatting (3DGS) representations capable of rendering photorealistic novel views at 60+ FPS in standard web browsers.
                </p>
                <p>
                  On top of the neural radiance field, we introduce a semantic spatial indexing layer enabling instant Point-of-Interest (POI) discovery, topological indoor navmesh generation, and optimal non-colliding A* indoor pathplanning. A real-time augmented reality (AR) walkthrough simulator provides turn-by-turn visual path guidance, bridging the gap between digital twin roaming and mobile indoor navigation.
                </p>

                <h4 className="mt-4 mb-2 text-blue font-bold">Key Architectural Innovations:</h4>
                <ul className="sop-list">
                  <li><strong>Zero-Cost Photogrammetry:</strong> 100% free pipeline utilizing open-source Nerfstudio, Google Colab GPU, and SuperSplat pruning.</li>
                  <li><strong>Heterogeneous 3D Rendering:</strong> Unified WebGL pipeline rendering 3D Gaussian Splats with depth-tested Three.js semantic geometry (interactive glowing beacons, animated navigation ribbons).</li>
                  <li><strong>Topological Indoor Navmesh & A* Engine:</strong> Generates non-colliding corridors with heuristic turn extraction and walking-time estimations.</li>
                  <li><strong>Multi-Modal Exploration:</strong> Free-roam first-person walking with eye-level clamping, macro orbit dollhouse inspection, and 6-DOF AR navigation HUD.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'techfest' && (
            <div className="techfest-section">
              <h3 className="section-heading">Round 1 Evaluation & Submission Checklist</h3>
              <p className="section-desc">
                Everything required by Techfest, IIT Bombay & Juspay for Round 1 qualification:
              </p>

              <div className="checklist-card">
                <div className="check-item done">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <div>
                    <strong>Proof of Concept Web Viewer Link:</strong>
                    <p>Hosted on Vercel / Netlify with live free-roaming, POI search, and 3D pathplanning.</p>
                  </div>
                </div>

                <div className="check-item done">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <div>
                    <strong>Code Repository:</strong>
                    <p>Clean, modular Vite + React + Three.js + GaussianSplats3D codebase with full TypeScript types.</p>
                  </div>
                </div>

                <div className="check-item done">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <div>
                    <strong>Custom Standard Operating Procedure (SOP):</strong>
                    <p>Comprehensive smartphone capture guidelines embedded in the app and docs folder.</p>
                  </div>
                </div>

                <div className="check-item done">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <div>
                    <strong>Technical Abstract:</strong>
                    <p>Complete formal technical abstract document ready for PDF/portal submission.</p>
                  </div>
                </div>

                <div className="check-item done">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <div>
                    <strong>3-5 Minute Demo Video Script:</strong>
                    <p>Step-by-step recording guide and spoken narration covering free-roam, search, and AR navigation.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

