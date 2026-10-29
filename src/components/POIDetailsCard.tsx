import type { POI } from '../types/spatial';
import { distance3D } from '../utils/navGraph';
import {
  Navigation,
  X,
  MapPin,
  Clock,
  Compass
} from 'lucide-react';

export interface POIDetailsCardProps {
  poi: POI | null;
  onClose: () => void;
  playerPosition: [number, number, number];
  onStartNavigation: (poi: POI) => void;
  isNavigatingToThis: boolean;
  onCancelNavigation: () => void;
}

export default function POIDetailsCard({
  poi,
  onClose,
  playerPosition,
  onStartNavigation,
  isNavigatingToThis,
  onCancelNavigation
}: POIDetailsCardProps) {
  if (!poi) return null;

  const distance = Math.round(distance3D(playerPosition, poi.position) * 10) / 10;
  const estimatedTimeSec = Math.max(2, Math.round(distance / 1.3));

  return (
    <div className="google-place-card">
      <div className="place-card-top">
        <div className="place-header-left">
          <span className="place-category-pill">
            {poi.category.toUpperCase()} • LEVEL {poi.floor}
          </span>
          <h2 className="place-title">{poi.name}</h2>
          {poi.roomNumber && <span className="place-room-code">Zone ID: {poi.roomNumber}</span>}
        </div>
        <button className="place-close-btn" onClick={onClose} title="Close card">
          <X size={18} />
        </button>
      </div>

      <p className="place-description">{poi.description}</p>

      {/* Meta Stats Row */}
      <div className="place-metrics-row">
        <div className="metric-item">
          <MapPin size={15} className="metric-icon-blue" />
          <span>{distance} m away</span>
        </div>
        <div className="metric-item">
          <Clock size={15} className="metric-icon-gray" />
          <span>~{estimatedTimeSec} sec walk</span>
        </div>
        <div className="metric-item">
          <Compass size={15} className="metric-icon-gray" />
          <span>Pos [{poi.position[0]}, {poi.position[2]}]</span>
        </div>
      </div>

      {/* Tags */}
      {poi.tags && poi.tags.length > 0 && (
        <div className="place-tags-row">
          {poi.tags.map((tag) => (
            <span key={tag} className="place-tag-chip">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="place-actions-row">
        {isNavigatingToThis ? (
          <button className="btn-directions-cancel" onClick={onCancelNavigation}>
            <X size={16} />
            <span>Cancel Directions</span>
          </button>
        ) : (
          <button className="btn-directions-primary" onClick={() => onStartNavigation(poi)}>
            <Navigation size={16} />
            <span>Directions</span>
          </button>
        )}
      </div>
    </div>
  );
}
