import { useState } from 'react';
import type { ViewMode, CustomRoomData } from '../types/spatial';
import {
  Download,
  Info,
  Footprints,
  Eye,
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
      {/* 1. First-Person Walk Helper Pill (Bottom-Center) */}
      {mode === 'walk' && (
        <div className="walk-helper-pill-clean">
          <div className="walk-helper-keys">
            <span className="key-tag">W</span>
            <span className="key-tag">A</span>
            <span className="key-tag">S</span>
            <span className="key-tag">D</span>
            <span className="walk-helper-text">to Walk • Drag to Look • <b>Shift</b> Sprint</span>
          </div>
          <button
            className="walk-exit-btn"
            onClick={() => onSetMode('orbit')}
            title="Exit first person and return to 3D Orbit view"
          >
            <Eye size={12} />
            <span>3D View (Esc)</span>
          </button>
        </div>
      )}

      {/* 2. Custom Video Twin File Badge (Discreet Bottom-Left / Center Pill) */}
      {customRoom && (
        <div className="video-twin-status-pill">
          <button
            className="video-twin-info-btn"
            onClick={() => setShowSpecsModal(true)}
            title="View room reconstruction metrics and detected zones"
          >
            <Info size={13} className="text-sky-400" />
            <span className="room-title-text font-semibold">{customRoom.name}</span>
            <span className="room-specs-badge">
              {customRoom.dimensions.width}m × {customRoom.dimensions.depth}m
            </span>
          </button>

          {customRoom.splatBlobUrl && (
            <button
              className="download-file-chip"
              onClick={handleDownloadSplat}
              title="Download 3D Gaussian Splat (.splat) file"
            >
              <Download size={12} />
              <span>.splat</span>
            </button>
          )}

          {customRoom.plyBlobUrl && (
            <button
              className="download-file-chip secondary"
              onClick={handleDownloadPly}
              title="Download 3D Point Cloud (.ply) file"
            >
              <Download size={12} />
              <span>.ply</span>
            </button>
          )}
        </div>
      )}

      {/* 3. Room Reconstruction Specs Modal */}
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

            {/* Recognized Multi-Room Zones */}
            {customRoom.zones && customRoom.zones.length > 0 && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Recognized Connected Rooms ({customRoom.zones.length}):
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {customRoom.zones.map((zone) => (
                    <div key={zone.id} className="p-2 bg-white rounded border border-slate-200 shadow-sm text-xs">
                      <span className="font-semibold text-slate-800 block truncate">📍 {zone.name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{zone.areaSqFt} sq.ft • Level {zone.floor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
