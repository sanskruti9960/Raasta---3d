import type { EnvironmentPreset, CustomRoomData } from '../types/spatial';
import { X, Compass, Ruler } from 'lucide-react';

interface FloorplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: EnvironmentPreset;
  customRoom?: CustomRoomData | null;
}

export default function FloorplanModal({
  isOpen,
  onClose,
  preset,
  customRoom
}: FloorplanModalProps) {
  if (!isOpen) return null;

  const isCustom = preset === 'custom_room' && customRoom;
  const title = isCustom ? customRoom.name : preset === 'home' ? 'Smart Home 2BHK Blueprint' : 'Innovation Hub Floorplan';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#121624] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0e121e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Compass size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {title}
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  CAD ARCHITECTURAL 2D
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isCustom
                  ? `Reconstructed from ${customRoom.videoFileName} • ${customRoom.dimensions.width}m × ${customRoom.dimensions.depth}m`
                  : preset === 'home'
                  ? 'Total Usable Area: 1,420 sq.ft • 2 Bed • 2 Bath • 1 Terrace'
                  : 'Total Usable Area: 4,800 sq.ft • East & West Wings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Blueprint SVG Canvas */}
        <div className="p-6 overflow-auto flex-1 flex flex-col items-center justify-center bg-[#090d16] relative">
          {/* Subtle blueprint grid background */}
          <div
            className="w-full h-full min-h-[480px] rounded-xl border border-sky-950/80 p-4 relative flex items-center justify-center bg-[#0d1220]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          >
            {/* SVG Blueprint */}
            <svg
              viewBox="0 0 800 600"
              className="w-full h-auto max-h-[500px] select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Boundary Dimensions */}
              <rect
                x="50"
                y="40"
                width="700"
                height="520"
                fill="none"
                stroke="rgba(56, 189, 248, 0.25)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />

              {/* Home Apartment Layout (Matching Reference Image) */}
              {!isCustom && preset === 'home' && (
                <g>
                  {/* Living Room Area */}
                  <rect x="80" y="240" width="340" height="280" fill="rgba(30, 41, 59, 0.4)" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="250" y="370" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="Inter, sans-serif">
                    LIVING ROOM
                  </text>
                  <text x="250" y="392" fill="#94a3b8" fontSize="12" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                    18' 6" × 14' 0" (37% Optimal)
                  </text>

                  {/* Terrace / Balcony */}
                  <rect x="80" y="470" width="340" height="50" fill="rgba(120, 113, 108, 0.2)" stroke="#78716c" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="250" y="500" fill="#cbd5e1" fontSize="12" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif">
                    TERRACE BALCONY • 29%
                  </text>

                  {/* Master Bedroom */}
                  <rect x="80" y="70" width="340" height="170" fill="rgba(30, 41, 59, 0.3)" stroke="#38bdf8" strokeWidth="2" />
                  <text x="250" y="150" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="Inter, sans-serif">
                    MASTER BEDROOM
                  </text>
                  <text x="250" y="172" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                    14' 0" × 12' 6" (37% Optimal)
                  </text>

                  {/* Kitchen Island & Pantry */}
                  <rect x="420" y="240" width="300" height="280" fill="rgba(15, 23, 42, 0.4)" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="570" y="370" fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle" fontFamily="Inter, sans-serif">
                    KITCHEN & DINING
                  </text>
                  <text x="570" y="392" fill="#94a3b8" fontSize="12" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                    16' 4" × 14' 0"
                  </text>

                  {/* Second Bedroom / Study */}
                  <rect x="420" y="70" width="300" height="170" fill="rgba(30, 41, 59, 0.3)" stroke="#38bdf8" strokeWidth="2" />
                  <text x="570" y="150" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="Inter, sans-serif">
                    BEDROOM 2 / STUDY
                  </text>
                  <text x="570" y="172" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                    13' 0" × 12' 6" (85% Optimal)
                  </text>

                  {/* Central Foyer */}
                  <circle cx="420" cy="240" r="16" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="420" y="244" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                    FOYER
                  </text>

                  {/* Sectional sofa schematic outline */}
                  <path d="M 120 320 L 120 440 L 260 440 L 260 410 L 150 410 L 150 320 Z" fill="#334155" fillOpacity="0.6" stroke="#64748b" strokeWidth="1" />
                  {/* Dining table outline */}
                  <rect x="460" y="280" width="100" height="60" rx="4" fill="#334155" fillOpacity="0.6" stroke="#64748b" strokeWidth="1" />
                  {/* Bed outline */}
                  <rect x="180" y="90" width="120" height="110" rx="3" fill="#334155" fillOpacity="0.6" stroke="#64748b" strokeWidth="1" />
                </g>
              )}

              {/* Custom Multi-Room Video Reconstructed Layout */}
              {isCustom && (
                <g>
                  {/* Outer CAD boundary */}
                  <rect
                    x="70"
                    y="50"
                    width="660"
                    height="500"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    rx="4"
                  />

                  {/* Header Title */}
                  <text x="400" y="35" fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle">
                    {customRoom.name.toUpperCase()} (MULTI-ROOM ARCHITECTURAL BLUEPRINT)
                  </text>

                  {/* All Detected Room Zones */}
                  {customRoom.zones.map((zone) => {
                    const halfW = customRoom.dimensions.width / 2;
                    const halfD = customRoom.dimensions.depth / 2;
                    const normMinX = (zone.bounds.minX + halfW) / (customRoom.dimensions.width || 1);
                    const normMaxX = (zone.bounds.maxX + halfW) / (customRoom.dimensions.width || 1);
                    const normMinZ = (zone.bounds.minZ + halfD) / (customRoom.dimensions.depth || 1);
                    const normMaxZ = (zone.bounds.maxZ + halfD) / (customRoom.dimensions.depth || 1);

                    const x = 70 + normMinX * 660;
                    const y = 50 + normMinZ * 500;
                    const w = Math.max(20, (normMaxX - normMinX) * 660);
                    const h = Math.max(20, (normMaxZ - normMinZ) * 500);
                    const cx = x + w / 2;
                    const cy = y + h / 2;

                    return (
                      <g key={zone.id}>
                        <rect
                          x={x}
                          y={y}
                          width={w}
                          height={h}
                          fill="rgba(30, 41, 59, 0.45)"
                          stroke="#38bdf8"
                          strokeWidth="1.8"
                          rx="3"
                        />
                        <text
                          x={cx}
                          y={cy - 6}
                          fill="#ffffff"
                          fontSize="13"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="Inter, sans-serif"
                        >
                          {zone.name.toUpperCase()}
                        </text>
                        <text
                          x={cx}
                          y={cy + 12}
                          fill="#38bdf8"
                          fontSize="11"
                          textAnchor="middle"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {zone.areaSqFt} sq.ft • Level {zone.floor}
                        </text>
                      </g>
                    );
                  })}

                  {/* Obstacles / Furniture detected */}
                  {customRoom.detectedObstacles.map((obs, idx) => {
                    const halfW = customRoom.dimensions.width / 2;
                    const halfD = customRoom.dimensions.depth / 2;
                    const normX = (obs.position[0] + halfW) / (customRoom.dimensions.width || 1);
                    const normZ = (obs.position[2] + halfD) / (customRoom.dimensions.depth || 1);
                    const ox = 70 + normX * 660;
                    const oz = 50 + normZ * 500;
                    const ow = Math.max(obs.size[0] * 24, 28);
                    const oh = Math.max(obs.size[2] * 24, 22);

                    return (
                      <g key={idx}>
                        <rect
                          x={ox - ow / 2}
                          y={oz - oh / 2}
                          width={ow}
                          height={oh}
                          rx="3"
                          fill="#334155"
                          fillOpacity="0.75"
                          stroke="#94a3b8"
                          strokeWidth="1"
                        />
                        <text
                          x={ox}
                          y={oz + 3}
                          fill="#f8fafc"
                          fontSize="9"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {obs.name.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* Blueprint Footer Specs */}
          <div className="w-full mt-4 flex items-center justify-between text-xs text-slate-400 px-2 font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Ruler size={13} className="text-sky-400" /> SCALE 1:50 ARCHITECTURAL
              </span>
              <span>•</span>
              <span>BEARING: NORTH 00° 00' 00" E</span>
            </div>
            <div>
              <span>RAASTA-3D CAD ENGINE v2.4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
