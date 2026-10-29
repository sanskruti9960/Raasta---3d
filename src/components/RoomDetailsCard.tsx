import type { RoomZone } from '../types/spatial';
import { X, Navigation, Square } from 'lucide-react';

export interface RoomDetailsCardProps {
  zone: RoomZone | null;
  onClose: () => void;
  onNavigateToRoom: (zone: RoomZone) => void;
}

export default function RoomDetailsCard({
  zone,
  onClose,
  onNavigateToRoom
}: RoomDetailsCardProps) {
  if (!zone) return null;

  return (
    <div className="google-place-card">
      <div className="place-card-top">
        <div className="place-header-left">
          <span className="place-category-pill">
            ROOM ZONE • LEVEL {zone.floor}
          </span>
          <h2 className="place-title">{zone.name}</h2>
          <span className="place-room-code">{zone.areaSqFt} sq. ft. area</span>
        </div>
        <button className="place-close-btn" onClick={onClose} title="Close room info">
          <X size={18} />
        </button>
      </div>

      <p className="place-description">{zone.description}</p>

      {/* Key Items / Furniture in Room */}
      {zone.items && zone.items.length > 0 && (
        <div className="room-contents-box">
          <div className="contents-title">
            <Square size={13} className="text-gray" />
            <span>Furniture & Fixtures</span>
          </div>
          <div className="place-tags-row">
            {zone.items.map((item) => (
              <span key={item} className="place-tag-chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="place-actions-row">
        <button className="btn-directions-primary" onClick={() => onNavigateToRoom(zone)}>
          <Navigation size={16} />
          <span>Directions to Room</span>
        </button>
      </div>
    </div>
  );
}
