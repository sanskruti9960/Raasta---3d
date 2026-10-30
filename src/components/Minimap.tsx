import { useState } from 'react';
import type { POI, NavPathResult, EnvironmentPreset, RoomZone, CustomRoomData } from '../types/spatial';
import { Maximize2, Minimize2, Navigation } from 'lucide-react';
import { HOME_ROOM_ZONES } from '../data/homeDataset';
import { OFFICE_ROOM_ZONES } from '../data/officeDataset';

export interface MinimapProps {
  preset: EnvironmentPreset;
  customRoom?: CustomRoomData | null;
  playerPosition: [number, number, number];
  headingDegrees: number;
  pois: POI[];
  selectedPOI: POI | null;
  onSelectPOI: (poi: POI) => void;
  onSelectZone?: (zone: RoomZone) => void;
  activePath: NavPathResult | null;
}

export default function Minimap({
  preset = 'home',
  customRoom,
  playerPosition,
  headingDegrees,
  pois,
  selectedPOI,
  onSelectPOI,
  onSelectZone,
  activePath
}: MinimapProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Coordinate transforms
  const toSvgX = (x: number) => {
    if (preset === 'custom_room' && customRoom) {
      const halfW = customRoom.dimensions.width / 2;
      return Math.max(10, Math.min(290, ((x + halfW) / (customRoom.dimensions.width || 1)) * 300));
    }
    if (preset === 'home') {
      return ((x + 8) / 16) * 300;
    }
    return ((x + 16) / 32) * 300;
  };

  const toSvgY = (z: number) => {
    if (preset === 'custom_room' && customRoom) {
      const halfD = customRoom.dimensions.depth / 2;
      return Math.max(10, Math.min(190, ((z + halfD) / (customRoom.dimensions.depth || 1)) * 200));
    }
    if (preset === 'home') {
      return ((z + 8) / 18) * 200;
    }
    return ((z + 11) / 22) * 200;
  };

  const playerSvgX = toSvgX(playerPosition[0]);
  const playerSvgY = toSvgY(playerPosition[2]);

  let pathD = '';
  if (activePath && activePath.coordinates.length > 1) {
    pathD = activePath.coordinates
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(c[0])} ${toSvgY(c[2])}`)
      .join(' ');
  }

  const activeZones = preset === 'custom_room'
    ? (customRoom?.zones || [])
    : preset === 'home'
      ? HOME_ROOM_ZONES
      : OFFICE_ROOM_ZONES;

  return (
    <div className={`google-minimap-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="minimap-title-bar">
        <div className="title-left">
          <Navigation size={13} className="text-blue" />
          <span className="minimap-heading">Floor Overview</span>
        </div>
        <button
          className="minimap-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse floorplan' : 'Expand floorplan'}
        >
          {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
      </div>

      <div className="minimap-viewport">
        <svg viewBox="0 0 300 200" className="minimap-svg-canvas">
          {/* Base Floor Outline */}
          <rect x="4" y="4" width="292" height="192" rx="6" className="floor-base-rect" />

          {/* Rooms / Zones */}
          {activeZones.map((zone) => {
            const zx = toSvgX(zone.bounds.minX);
            const zy = toSvgY(zone.bounds.minZ);
            const zw = toSvgX(zone.bounds.maxX) - zx;
            const zh = toSvgY(zone.bounds.maxZ) - zy;
            const cx = zx + zw / 2;
            const cy = zy + zh / 2;

            return (
              <g
                key={zone.id}
                className="zone-group"
                onClick={() => onSelectZone?.(zone)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={zx}
                  y={zy}
                  width={Math.max(8, zw)}
                  height={Math.max(8, zh)}
                  rx="3"
                  className="zone-rect"
                />
                <text x={cx} y={cy} className="zone-text-label">
                  {zone.type.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Active Navigation Route (Straight Google Blue walking path) */}
          {pathD && (
            <path d={pathD} className="google-route-stroke" />
          )}

          {/* POI Markers */}
          {pois.map((poi) => {
            const px = toSvgX(poi.position[0]);
            const py = toSvgY(poi.position[2]);
            const isSelected = selectedPOI?.id === poi.id;

            return (
              <g
                key={poi.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPOI(poi);
                }}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={px} cy={py} r={isSelected ? '5.5' : '3.5'} className="map-poi-circle" />
              </g>
            );
          })}

          {/* Player Location Pin & Direction Cone */}
          <g transform={`translate(${playerSvgX}, ${playerSvgY})`}>
            <path
              d="M 0 0 L -14 -24 L 14 -24 Z"
              transform={`rotate(${headingDegrees})`}
              className="player-heading-beam"
            />
            <circle cx="0" cy="0" r="4.5" className="player-center-pin" />
            <circle cx="0" cy="0" r="7" className="player-halo-ring" />
          </g>
        </svg>
      </div>

      <div className="minimap-meta-bar">
        <span>X: {playerPosition[0]}m • Z: {playerPosition[2]}m</span>
        <span>{headingDegrees}°</span>
      </div>
    </div>
  );
}
