import type { NavPathResult, POI } from '../types/spatial';
import {
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  MapPin,
  Play,
  Pause,
  X
} from 'lucide-react';

export interface NavigationHUDProps {
  path: NavPathResult;
  targetPOI: POI;
  onCancel: () => void;
  currentStepIndex: number;
  isAutoRoaming?: boolean;
  onToggleAutoRoam?: () => void;
}

export default function NavigationHUD({
  path,
  targetPOI,
  onCancel,
  currentStepIndex = 0,
  isAutoRoaming = false,
  onToggleAutoRoam
}: NavigationHUDProps) {
  const currentInstruction = path.turnInstructions[currentStepIndex] || path.turnInstructions[0];

  const getTurnIcon = (type: string) => {
    switch (type) {
      case 'left':
        return <CornerUpLeft size={24} className="nav-turn-icon" />;
      case 'right':
        return <CornerUpRight size={24} className="nav-turn-icon" />;
      case 'arrive':
        return <MapPin size={24} className="nav-turn-icon text-amber-400" />;
      case 'straight':
      default:
        return <ArrowUp size={24} className="nav-turn-icon" />;
    }
  };

  return (
    <div className="google-nav-card">
      <div className="nav-turn-circle">
        {getTurnIcon(currentInstruction.type)}
      </div>

      <div className="nav-info-block">
        <div className="nav-distance-text">
          {currentInstruction.distanceMeters > 0
            ? `${currentInstruction.distanceMeters} m`
            : 'Arriving at Destination'}
        </div>
        <div className="nav-instruction-title">
          {currentInstruction.text}
        </div>
        <div className="nav-sub-meta">
          <span>Target: {targetPOI.name}</span>
          <span className="dot-sep">•</span>
          <span>{path.totalDistanceMeters}m route ({path.estimatedWalkingSeconds}s)</span>
        </div>
      </div>

      {onToggleAutoRoam && (
        <button
          className={`nav-roam-action-btn ${isAutoRoaming ? 'active' : ''}`}
          onClick={onToggleAutoRoam}
          title={isAutoRoaming ? 'Pause auto-walk' : 'Auto roam along this accurate route'}
        >
          {isAutoRoaming ? (
            <>
              <Pause size={14} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>Roam to Target</span>
            </>
          )}
        </button>
      )}

      <button className="nav-exit-btn" onClick={onCancel} title="Exit navigation">
        <X size={18} />
      </button>
    </div>
  );
}
