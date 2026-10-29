import type { POI } from '../types/spatial';
import { distance3D } from '../utils/navGraph';
import { Navigation, Compass } from 'lucide-react';

export interface AROverlayProps {
  headingDegrees: number;
  playerPosition: [number, number, number];
  targetPOI: POI | null;
  nearestPOI: POI | null;
}

export default function AROverlay({
  headingDegrees,
  playerPosition,
  targetPOI,
  nearestPOI
}: AROverlayProps) {
  const activePoint = targetPOI || nearestPOI;
  const distance = activePoint
    ? Math.round(distance3D(playerPosition, activePoint.position) * 10) / 10
    : 0;

  return (
    <div className="google-ar-overlay">
      {/* 1. Top Clean Google Maps Heading Compass Ribbon */}
      <div className="ar-compass-container">
        <div className="ar-compass-viewport">
          <div
            className="ar-compass-marks"
            style={{ transform: `translateX(-${(headingDegrees / 360) * 800}px)` }}
          >
            {['N', '15', '30', 'NE', '60', '75', 'E', '105', '120', 'SE', '150', '165', 'S', '195', '210', 'SW', '240', '255', 'W', '285', '300', 'NW', '330', '345',
              'N', '15', '30', 'NE', '60', '75', 'E', '105', '120', 'SE', '150', '165', 'S', '195', '210', 'SW', '240', '255', 'W', '285', '300', 'NW', '330', '345', 'N'].map((mark, idx) => (
              <span
                key={idx}
                className={`compass-mark ${['N', 'E', 'S', 'W'].includes(mark) ? 'cardinal' : ''}`}
              >
                {mark}
              </span>
            ))}
          </div>
        </div>
        <div className="compass-center-indicator" />
        <div className="compass-degree-label">{headingDegrees}°</div>
      </div>

      {/* 2. Google Maps Live View Center Target */}
      <div className="ar-center-target">
        <div className="target-ring" />
        <div className="target-point" />

        {activePoint && (
          <div className="ar-target-bubble">
            <Navigation size={13} className="text-blue" />
            <span className="target-name">{activePoint.name}</span>
            <span className="target-distance">{distance} m</span>
          </div>
        )}
      </div>

      {/* 3. Bottom-Left Live View Status Pill */}
      <div className="ar-live-status-pill">
        <Compass size={14} className="text-blue" />
        <span>Live View Navigation • On-Device Tracking</span>
      </div>
    </div>
  );
}
