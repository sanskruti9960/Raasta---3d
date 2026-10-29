import { useState } from 'react';
import type { ViewMode, CustomRoomData } from '../types/spatial';
import {
  Download,
  Info,
  Footprints,
  Eye,
  User,
  Smartphone,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  X
} from 'lucide-react';

export interface RoamControlsOverlayProps {
  mode: ViewMode;
  onSetMode: (mode: ViewMode) => void;
  customRoom: CustomRoomData | null;
  onOpenUpload: () => void;
}

export default function RoamControlsOverlay({
  mode,
  onSetMode,
  customRoom,
  onOpenUpload
}: RoamControlsOverlayProps) {
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [showControlsHint, setShowControlsHint] = useState(true);

  // Dispatch synthetic keyboard events for virtual d-pad controls
  const handleVirtualKey = (code: string, key: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code, key }));
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code, key }));
    }, 180);
  };

  const handleDownloadSplat = () => {
    if (!customRoom?.splatBlobUrl) return;
    const a = document.createElement('a');
    a.href = customRoom.splatBlobUrl;
    a.download = `${customRoom.name.toLowerCase().replace(/\s+/g, '_')}_digital_twin.splat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPly = () => {
    if (!customRoom?.plyBlobUrl) return;
    const a = document.createElement('a');
    a.href = customRoom.plyBlobUrl;
    a.download = `${customRoom.name.toLowerCase().replace(/\s+/g, '_')}_pointcloud.ply`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      {/* 1. Bottom-Left Floating Virtual Roam Pad & Guide */}
      <div className="roam-controls-container">
        {/* Roam Mode Toggle & Status */}
        <div className="roam-mode-bar">
          <button
            className={`roam-mode-chip ${mode === 'walk' ? 'active' : ''}`}
            onClick={() => onSetMode('walk')}
            title="1st-Person Walkthrough (WASD + Mouse Look)"
          >
            <Footprints size={14} />
            <span>Walk 1st Person</span>
          </button>
          <button
            className={`roam-mode-chip ${mode === 'third' ? 'active' : ''}`}
            onClick={() => onSetMode('third')}
            title="3rd-Person Follow Camera"
          >
            <User size={14} />
            <span>3rd Person</span>
          </button>
          <button
            className={`roam-mode-chip ${mode === 'orbit' ? 'active' : ''}`}
            onClick={() => onSetMode('orbit')}
            title="3D Free Orbit Overview"
          >
            <Eye size={14} />
            <span>3D Orbit</span>
          </button>
          <button
            className={`roam-mode-chip ${mode === 'ar' ? 'active' : ''}`}
            onClick={() => onSetMode('ar')}
            title="AR Spatial Compass"
          >
            <Smartphone size={14} />
            <span>AR</span>
          </button>
        </div>

        {/* Roaming Quick D-Pad for easy virtual walking on any device */}
        {(mode === 'walk' || mode === 'third') && (
          <div className="virtual-dpad-card">
            <div className="dpad-header">
              <span className="dpad-title">Virtual Roam Pad</span>
              <span className="dpad-sub">or use WASD keys</span>
            </div>
            <div className="dpad-grid">
              <div />
              <button
                className="dpad-btn"
                onPointerDown={() => handleVirtualKey('KeyW', 'w')}
                title="Walk Forward (W)"
              >
                <ArrowUp size={16} />
              </button>
              <div />
              <button
                className="dpad-btn"
                onPointerDown={() => handleVirtualKey('KeyA', 'a')}
                title="Strafe Left (A)"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                className="dpad-btn center-dot"
                onPointerDown={() => handleVirtualKey('KeyS', 's')}
                title="Walk Backward (S)"
              >
                <ArrowDown size={16} />
              </button>
              <button
                className="dpad-btn"
                onPointerDown={() => handleVirtualKey('KeyD', 'd')}
                title="Strafe Right (D)"
              >
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="dpad-actions-row">
              <button
                className="dpad-action-chip"
                onPointerDown={() => handleVirtualKey('ArrowLeft', 'ArrowLeft')}
                title="Turn Left"
              >
                <RotateCcw size={12} />
                <span>Turn L</span>
              </button>
              <button
                className="dpad-action-chip"
                onPointerDown={() => handleVirtualKey('ShiftLeft', 'Shift')}
                title="Sprint Boost"
              >
                <Compass size={12} />
                <span>Sprint</span>
              </button>
              <button
                className="dpad-action-chip"
                onPointerDown={() => handleVirtualKey('ArrowRight', 'ArrowRight')}
                title="Turn Right"
              >
                <RotateCw size={12} />
                <span>Turn R</span>
              </button>
            </div>
          </div>
        )}

        {/* Room Twin File Export & Info Bar (Visible when custom room is loaded) */}
        {customRoom && (
          <div className="custom-room-file-bar">
            <div className="file-bar-left" onClick={() => setShowSpecsModal(true)}>
              <Info size={14} className="text-blue" />
              <span className="room-title-text">{customRoom.name}</span>
              <span className="room-specs-badge">
                {customRoom.dimensions.width}m × {customRoom.dimensions.depth}m
              </span>
            </div>

            <div className="file-bar-actions">
              {customRoom.splatBlobUrl && (
                <button
                  className="download-file-btn"
                  onClick={handleDownloadSplat}
                  title="Download converted 3D Gaussian Splat (.splat) file"
                >
                  <Download size={13} />
                  <span>.splat ({customRoom.splatFileSizeKb || '~640'} KB)</span>
                </button>
              )}
              {customRoom.plyBlobUrl && (
                <button
                  className="download-file-btn secondary"
                  onClick={handleDownloadPly}
                  title="Download converted 3D Point Cloud (.ply) file"
                >
                  <Download size={13} />
                  <span>.ply</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Keyboard instructions toast */}
        {showControlsHint && (mode === 'walk' || mode === 'third') && (
          <div className="roam-hint-pill">
            <span>Click canvas to look around • <b>W A S D</b> to walk • <b>Shift</b> sprint • <b>C</b> crouch</span>
            <button className="hint-close-btn" onClick={() => setShowControlsHint(false)}>
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* 2. Room Reconstruction Specs Modal */}
      {showSpecsModal && customRoom && (
        <div className="google-modal-backdrop" onClick={() => setShowSpecsModal(false)}>
          <div className="google-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="google-dialog-header">
              <div className="flex items-center gap-2">
                <Footprints className="text-blue" size={20} />
                <h2 className="dialog-title">{customRoom.name} — Spatial Twin Specs</h2>
              </div>
              <button className="dialog-close-btn" onClick={() => setShowSpecsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p className="dialog-subtitle">
              Generated from video file:{' '}
              <span className="font-semibold text-gray-800">{customRoom.videoFileName}</span>
            </p>

            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Conversion Time</span>
                <span className="spec-value text-green-600 font-bold">
                  {customRoom.reconstructionTimeSec}s (Instant)
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Room Dimensions</span>
                <span className="spec-value">
                  {customRoom.dimensions.width}m × {customRoom.dimensions.depth}m (Height {customRoom.dimensions.height}m)
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">3D Splat Points</span>
                <span className="spec-value">{customRoom.pointCount.toLocaleString()} splats</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Keyframes Extracted</span>
                <span className="spec-value">{customRoom.extractedKeyframesCount} frames</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Floor Area</span>
                <span className="spec-value">
                  {Math.round(customRoom.dimensions.width * customRoom.dimensions.depth * 10.764)} sq ft
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Registered POIs</span>
                <span className="spec-value">{customRoom.pois.length} waypoints</span>
              </div>
            </div>

            {/* Extracted Keyframe Strip */}
            {customRoom.keyframes && customRoom.keyframes.length > 0 && (
              <div className="keyframes-section">
                <h3 className="section-title">Video Scan Keyframes ({customRoom.keyframes.length})</h3>
                <div className="keyframes-strip">
                  {customRoom.keyframes.map((src, i) => (
                    <img key={i} src={src} alt={`Keyframe ${i + 1}`} className="keyframe-thumb" />
                  ))}
                </div>
              </div>
            )}

            {/* Download Files */}
            <div className="dialog-footer-actions">
              {customRoom.splatBlobUrl && (
                <button className="google-btn-primary full-width" onClick={handleDownloadSplat}>
                  <Download size={15} />
                  <span>Download .splat Gaussian Splat File</span>
                </button>
              )}
              {customRoom.plyBlobUrl && (
                <button className="google-btn-secondary full-width" onClick={handleDownloadPly}>
                  <Download size={15} />
                  <span>Download .ply Point Cloud File</span>
                </button>
              )}
              <button className="google-btn-secondary full-width" onClick={onOpenUpload}>
                <span>Scan Another Room Video</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
