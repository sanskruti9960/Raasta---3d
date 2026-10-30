import { useState, useCallback, useMemo } from 'react';
import type {
  POI,
  RoomZone,
  ViewMode,
  NavPathResult,
  EnvironmentPreset,
  CustomRoomData,
  NavNode,
  LightingTime,
  UtilityLayer
} from './types/spatial';
import { HOME_POIS, HOME_NAV_GRAPH, HOME_ROOM_ZONES } from './data/homeDataset';
import { OFFICE_POIS, OFFICE_NAV_GRAPH, OFFICE_ROOM_ZONES } from './data/officeDataset';
import {
  findShortestPath,
  distance3D,
  HOME_DEFAULT_OBSTACLES,
  OFFICE_DEFAULT_OBSTACLES,
  type ObstacleAABB
} from './utils/navGraph';
import SplatViewer from './components/SplatViewer';
import TopNavbar from './components/TopNavbar';
import Minimap from './components/Minimap';
import POISearchModal from './components/POISearchModal';
import POIDetailsCard from './components/POIDetailsCard';
import RoomDetailsCard from './components/RoomDetailsCard';
import NavigationHUD from './components/NavigationHUD';
import AROverlay from './components/AROverlay';
import UploadModal from './components/UploadModal';
import DocumentationModal from './components/DocumentationModal';
import AddPOIDialog from './components/AddPOIDialog';
import RoamControlsOverlay from './components/RoamControlsOverlay';
import FloorplanModal from './components/FloorplanModal';
import { Video } from 'lucide-react';
import './App.css';

export default function App() {
  // 1. Environment & Mode State (Defaults to Google 3D Maps Overview)
  const [preset, setPreset] = useState<EnvironmentPreset>('home');
  const [mode, setMode] = useState<ViewMode>('orbit');
  const [modelUrl, setModelUrl] = useState<string>('');
  const [modelName, setModelName] = useState<string>('Smart Home Digital Twin (Round 1 Dataset)');

  // Custom Video-Reconstructed Room State
  const [customRoom, setCustomRoom] = useState<CustomRoomData | null>(null);
  const [customPoisList, setCustomPoisList] = useState<POI[]>([]);
  const [currentRoomZone, setCurrentRoomZone] = useState<RoomZone | null>(null);

  // 2. POIs & Room State (switches between Home, Office and Custom Video Room)
  const [homePoisList, setHomePoisList] = useState<POI[]>(HOME_POIS);
  const [officePoisList, setOfficePoisList] = useState<POI[]>(OFFICE_POIS);
  const pois = preset === 'custom_room'
    ? customPoisList
    : preset === 'home'
      ? homePoisList
      : officePoisList;

  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [selectedZone, setSelectedZone] = useState<RoomZone | null>(null);

  // Active Nav Graph
  const activeNavGraph = useMemo<Record<string, NavNode>>(() => {
    return preset === 'custom_room'
      ? (customRoom?.navGraph || {})
      : preset === 'home'
        ? HOME_NAV_GRAPH
        : OFFICE_NAV_GRAPH;
  }, [preset, customRoom]);

  // Active Obstacle Bounding Boxes for Line-of-Sight Shortcut & Anti-Zigzag Routing
  const activeObstacles = useMemo<ObstacleAABB[]>(() => {
    if (preset === 'custom_room' && customRoom) {
      const list: ObstacleAABB[] = [];
      const halfW = customRoom.dimensions.width / 2;
      const halfD = customRoom.dimensions.depth / 2;
      // Perimeter bounds
      list.push({ minX: -halfW, maxX: halfW, minZ: -halfD - 0.2, maxZ: -halfD + 0.2 });
      list.push({ minX: -halfW - 0.2, maxX: -halfW + 0.2, minZ: -halfD, maxZ: halfD });
      list.push({ minX: halfW - 0.2, maxX: halfW + 0.2, minZ: -halfD, maxZ: halfD });
      // Partition walls
      if (customRoom.zones && customRoom.zones.length > 1) {
        list.push({ minX: 0.3, maxX: 0.7, minZ: -4.0, maxZ: 1.5 });
        list.push({ minX: -4.5, maxX: -1.0, minZ: -0.6, maxZ: -0.4 });
        list.push({ minX: 1.0, maxX: 4.5, minZ: 0.4, maxZ: 0.6 });
      }
      return list;
    }
    return preset === 'home' ? HOME_DEFAULT_OBSTACLES : OFFICE_DEFAULT_OBSTACLES;
  }, [preset, customRoom]);

  // Active Room Zones for current dataset or reconstructed video space
  const activeZones = useMemo<RoomZone[]>(() => {
    return preset === 'custom_room'
      ? (customRoom?.zones || [])
      : preset === 'home'
        ? HOME_ROOM_ZONES
        : OFFICE_ROOM_ZONES;
  }, [preset, customRoom]);

  // Dynamic Room Counts (Bedrooms, Bathrooms, Terraces, Workspaces, Total)
  const specsCounts = useMemo(() => {
    const bedrooms = activeZones.filter((z) => z.type === 'bedroom').length;
    const bathrooms = activeZones.filter((z) => z.type === 'bathroom').length;
    const terraces = activeZones.filter((z) => z.type === 'balcony').length;
    const study = activeZones.filter((z) => z.type === 'study' || z.type === 'office').length;
    const living = activeZones.filter((z) => z.type === 'living').length;
    const kitchens = activeZones.filter((z) => z.type === 'kitchen').length;
    const total = activeZones.length;
    return {
      bedrooms: bedrooms || (preset === 'home' ? 2 : 1),
      bathrooms: bathrooms || (preset === 'home' ? 2 : 1),
      terraces: terraces || 1,
      study: study || 1,
      living: living || 1,
      kitchens: kitchens || 1,
      total
    };
  }, [activeZones, preset]);

  // 3. Navigation State
  const [activePath, setActivePath] = useState<NavPathResult | null>(null);
  const [targetNavPOI, setTargetNavPOI] = useState<POI | null>(null);
  const [currentNavStep, setCurrentNavStep] = useState<number>(0);
  const [isAutoRoaming, setIsAutoRoaming] = useState<boolean>(false);
  const [tappedObjectInfo, setTappedObjectInfo] = useState<{
    name: string;
    position: [number, number, number];
    zoneName?: string;
  } | null>(null);

  // 4. Telemetry State
  const [telemetry, setTelemetry] = useState<{
    position: [number, number, number];
    headingDegrees: number;
    fps: number;
  }>({
    position: preset === 'home' ? [0.5, 1.6, 0.5] : [0, 1.6, 7],
    headingDegrees: 0,
    fps: 60
  });

  // 5. Default Lighting & Utilities Configuration
  const lightingTime: LightingTime = 'afternoon';
  const utilityLayer: UtilityLayer = 'none';

  // 6. Modals & Drag-and-Drop State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isFloorplanOpen, setIsFloorplanOpen] = useState(false);
  const [isAddingPOI, setIsAddingPOI] = useState(false);
  const [newPOICoords, setNewPOICoords] = useState<[number, number, number] | null>(null);
  const [initialDroppedVideo, setInitialDroppedVideo] = useState<File | null>(null);
  const [isWindowDragging, setIsWindowDragging] = useState(false);

  // Handle Preset Change
  const handleSetPreset = useCallback((newPreset: EnvironmentPreset) => {
    setPreset(newPreset);
    setActivePath(null);
    setTargetNavPOI(null);
    setSelectedPOI(null);
    setSelectedZone(null);
    setModelUrl('');
    if (newPreset === 'custom_room' && customRoom) {
      setModelName(customRoom.name);
      setTelemetry((prev) => ({ ...prev, position: [0, 1.6, customRoom.dimensions.depth / 2 - 0.8] }));
    } else if (newPreset === 'home') {
      setModelName('Smart Home Digital Twin (Round 1 Dataset)');
      setTelemetry((prev) => ({ ...prev, position: [0.5, 1.6, 0.5] }));
    } else {
      setModelName('Corporate Innovation Hub (IITB × Juspay)');
      setTelemetry((prev) => ({ ...prev, position: [0, 1.6, 7] }));
    }
  }, [customRoom]);

  // Handle custom room loaded from video reconstruction
  const handleCustomRoomLoaded = useCallback((room: CustomRoomData) => {
    setCustomRoom(room);
    setCustomPoisList(room.pois);
    setPreset('custom_room');
    setModelName(room.name);
    setModelUrl('');
    setMode('walk'); // Drop user into walk mode to roam virtually!
    setTelemetry((prev) => ({ ...prev, position: [0, 1.6, room.dimensions.depth / 2 - 0.8] }));
    setActivePath(null);
    setTargetNavPOI(null);
    setSelectedPOI(null);
    setSelectedZone(null);
  }, []);

  // Telemetry callback
  const handleTelemetryUpdate = useCallback(
    (newTel: { position: [number, number, number]; headingDegrees: number; fps: number }) => {
      setTelemetry(newTel);

      // Check if user is navigating and reached next turn waypoint
      if (activePath && activePath.coordinates.length > 0) {
        const nextCoord = activePath.coordinates[currentNavStep + 1];
        if (nextCoord) {
          const dist = distance3D(newTel.position, nextCoord);
          if (dist < 1.4 && currentNavStep < activePath.turnInstructions.length - 1) {
            setCurrentNavStep((prev) => prev + 1);
          }
        }
      }
    },
    [activePath, currentNavStep]
  );

  // Navigation handlers (Obstacle-aware line-of-sight shortcutting without zigzags)
  const handleStartNavigation = useCallback(
    (poi: POI) => {
      const pathResult = findShortestPath(telemetry.position, poi.position, activeNavGraph, activeObstacles);
      if (pathResult) {
        setActivePath(pathResult);
        setTargetNavPOI(poi);
        setCurrentNavStep(0);
        setIsAutoRoaming(false);
      }
    },
    [telemetry.position, activeNavGraph, activeObstacles]
  );

  const handleNavigateToRoom = useCallback(
    (zone: RoomZone) => {
      const roomTargetPOI: POI = {
        id: `poi-zone-${zone.id}`,
        name: zone.name,
        category: 'room',
        position: zone.center,
        description: zone.description,
        floor: zone.floor,
        roomNumber: zone.type.toUpperCase(),
        tags: [zone.type, 'room', 'destination']
      };

      const pathResult = findShortestPath(telemetry.position, zone.center, activeNavGraph, activeObstacles);
      if (pathResult) {
        setActivePath(pathResult);
        setTargetNavPOI(roomTargetPOI);
        setCurrentNavStep(0);
        setIsAutoRoaming(false);
      }
    },
    [telemetry.position, activeNavGraph, activeObstacles]
  );

  const handleCancelNavigation = useCallback(() => {
    setActivePath(null);
    setTargetNavPOI(null);
    setCurrentNavStep(0);
    setIsAutoRoaming(false);
  }, []);

  // POI selection
  const handleSelectPOI = useCallback((poi: POI | null) => {
    setSelectedPOI(poi);
    setSelectedZone(null);
  }, []);

  // Room zone selection
  const handleSelectZone = useCallback((zone: RoomZone | null) => {
    setSelectedZone(zone);
    setSelectedPOI(null);
  }, []);

  // Load custom model
  const handleLoadModel = useCallback((url: string, name: string) => {
    setModelUrl(url);
    setModelName(name);
  }, []);

  // Floor click to add custom POI
  const handleFloorClick = useCallback(
    (point: [number, number, number]) => {
      if (isAddingPOI) {
        setNewPOICoords(point);
        setIsAddingPOI(false);
      }
    },
    [isAddingPOI]
  );

  // Object tap to name SOP or route
  const handleTapObject = useCallback(
    (obj: { name: string; position: [number, number, number]; zoneName?: string }) => {
      setTappedObjectInfo(obj);
    },
    []
  );

  const handleSaveCustomPOI = useCallback(
    (newPoi: POI) => {
      if (preset === 'custom_room') {
        setCustomPoisList((prev) => [...prev, newPoi]);
      } else if (preset === 'home') {
        setHomePoisList((prev) => [...prev, newPoi]);
      } else {
        setOfficePoisList((prev) => [...prev, newPoi]);
      }
      setSelectedPOI(newPoi);
      setTappedObjectInfo(null);
      // Automatically show the accurate route straight to the new SOP!
      handleStartNavigation(newPoi);
    },
    [preset, handleStartNavigation]
  );

  // Nearest POI for AR telemetry
  const nearestPOI = useMemo(() => {
    if (pois.length === 0) return null;
    let closest = pois[0];
    let minDist = Infinity;
    pois.forEach((p) => {
      const d = distance3D(telemetry.position, p.position);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    });
    return closest;
  }, [pois, telemetry.position]);

  return (
    <div
      className={`raasta-app-container ${isWindowDragging ? 'window-drag-active' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isWindowDragging) setIsWindowDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget === e.target) setIsWindowDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWindowDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv)$/i.test(file.name))) {
          setInitialDroppedVideo(file);
          setIsUploadOpen(true);
        }
      }}
    >
      {/* Fullscreen Video Drag Overlay */}
      {isWindowDragging && (
        <div className="window-drop-overlay">
          <div className="window-drop-card">
            <Video size={44} className="text-sky-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white">Drop Room Video to Reconstruct 3D Digital Twin</h3>
            <p className="text-xs text-slate-300 mt-1">Automatic temporal extraction, multi-room boundary recognition, and 3D Gaussian Splats synthesis.</p>
          </div>
        </div>
      )}
      {/* 1. Minimal Top Navigation Bar */}
      <TopNavbar
        mode={mode}
        onSetMode={setMode}
        preset={preset}
        onSetPreset={handleSetPreset}
        hasCustomRoom={Boolean(customRoom)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onToggleFloorplan={() => setIsFloorplanOpen(true)}
        fps={telemetry.fps}
      />

      {/* 2. Primary 3D Spatial Canvas */}
      <SplatViewer
        modelUrl={modelUrl}
        preset={preset}
        customRoom={customRoom}
        pois={pois}
        selectedPOI={selectedPOI}
        onSelectPOI={handleSelectPOI}
        selectedZone={selectedZone}
        onSelectZone={handleSelectZone}
        activePath={activePath}
        mode={mode}
        lightingTime={lightingTime}
        utilityLayer={utilityLayer}
        onTelemetryUpdate={handleTelemetryUpdate}
        isAddingPOI={isAddingPOI}
        onFloorClick={handleFloorClick}
        onRoomChange={setCurrentRoomZone}
        onTapObject={handleTapObject}
        isAutoRoaming={isAutoRoaming}
        onAutoRoamComplete={() => setIsAutoRoaming(false)}
        onStepChange={(stepIdx) => setCurrentNavStep(stepIdx)}
      />

      {/* Tapped Object Quick Action Card (SOP Naming & Accurate Route) */}
      {tappedObjectInfo && !newPOICoords && (
        <div className="tapped-object-quick-pill">
          <div className="tapped-object-col">
            <span className="tapped-tag">Tapped Room Object</span>
            <span className="tapped-name">📍 {tappedObjectInfo.name}</span>
          </div>
          <div className="tapped-actions">
            <button
              className="tapped-btn sop-btn"
              onClick={() => setNewPOICoords(tappedObjectInfo.position)}
              title="Name this object and create an SOP waypoint"
            >
              📋 Name SOP
            </button>
            <button
              className="tapped-btn route-btn"
              onClick={() => {
                const tempSopPOI: POI = {
                  id: `poi-sop-${Date.now()}`,
                  name: `${tappedObjectInfo.name} SOP`,
                  category: 'sop',
                  position: tappedObjectInfo.position,
                  description: `SOP Landmark for ${tappedObjectInfo.name}`,
                  floor: 1,
                  tags: ['sop', 'destination']
                };
                handleStartNavigation(tempSopPOI);
                setTappedObjectInfo(null);
              }}
              title="Show direct, accurate route to this object"
            >
              🧭 Route Here
            </button>
            <button
              className="tapped-close-btn"
              onClick={() => setTappedObjectInfo(null)}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Real-Time Live Room Recognition Location HUD */}
      {currentRoomZone && (
        <div className="live-room-recognition-hud">
          <div className="room-indicator-left">
            <span className="room-indicator-pulse" />
            <div className="room-text-col">
              <span className="room-loc-sub">CURRENT LOCATION</span>
              <span className="room-loc-name">{currentRoomZone.name}</span>
            </div>
          </div>
          <div className="room-indicator-right">
            <span className="room-area-tag">{currentRoomZone.areaSqFt} sq.ft</span>
            <button
              className="room-quick-inspect-btn"
              onClick={() => setSelectedZone(currentRoomZone)}
              title="Inspect room details and furniture"
            >
              Inspect Room
            </button>
          </div>
        </div>
      )}

      {/* 3. AR Overlay Mode */}
      {mode === 'ar' && (
        <AROverlay
          headingDegrees={telemetry.headingDegrees}
          playerPosition={telemetry.position}
          targetPOI={targetNavPOI}
          nearestPOI={nearestPOI}
        />
      )}

      {/* 4. Active Navigation Turn-by-Turn HUD */}
      {activePath && targetNavPOI && (
        <NavigationHUD
          path={activePath}
          targetPOI={targetNavPOI}
          onCancel={handleCancelNavigation}
          currentStepIndex={currentNavStep}
          isAutoRoaming={isAutoRoaming}
          onToggleAutoRoam={() => setIsAutoRoaming((prev) => !prev)}
        />
      )}

      {/* 5. Dynamic Recognized Unit Specs Stack (Bedrooms, Bathrooms, Terraces, Total) */}
      <div className="fuselab-unit-specs-stack">
        <div className="spec-badge-item" title="Bedrooms">
          <span className="spec-icon">🛏️</span>
          <span className="spec-count">{specsCounts.bedrooms}</span>
        </div>
        <div className="spec-badge-item" title="Bathrooms">
          <span className="spec-icon">🛁</span>
          <span className="spec-count">{specsCounts.bathrooms}</span>
        </div>
        <div className="spec-badge-item" title="Terraces & Balconies">
          <span className="spec-icon">🌿</span>
          <span className="spec-count">{specsCounts.terraces}</span>
        </div>
        <div className="spec-badge-item" title="Total Recognized Rooms">
          <span className="spec-icon">🏛️</span>
          <span className="spec-count">{specsCounts.total}</span>
        </div>
      </div>

      {/* 6. 2D Interactive Radar Minimap */}
      <Minimap
        preset={preset}
        customRoom={customRoom}
        playerPosition={telemetry.position}
        headingDegrees={telemetry.headingDegrees}
        pois={pois}
        selectedPOI={selectedPOI}
        onSelectPOI={handleSelectPOI}
        onSelectZone={handleSelectZone}
        activePath={activePath}
      />

      {/* 8. On-Screen Virtual Roam Pad & File Download Actions */}
      <RoamControlsOverlay
        mode={mode}
        onSetMode={setMode}
        customRoom={customRoom}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* 9. Selected Room Zone Card */}
      {selectedZone && (
        <RoomDetailsCard
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
          onNavigateToRoom={handleNavigateToRoom}
        />
      )}

      {/* 10. Selected POI Details Card */}
      {selectedPOI && (
        <POIDetailsCard
          poi={selectedPOI}
          onClose={() => setSelectedPOI(null)}
          playerPosition={telemetry.position}
          onStartNavigation={handleStartNavigation}
          isNavigatingToThis={targetNavPOI?.id === selectedPOI.id}
          onCancelNavigation={handleCancelNavigation}
        />
      )}

      {/* 11. Modals */}
      <POISearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        pois={pois}
        playerPosition={telemetry.position}
        onSelectPOI={handleSelectPOI}
        onNavigateToPOI={handleStartNavigation}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setInitialDroppedVideo(null);
        }}
        onLoadModel={handleLoadModel}
        currentModelName={modelName}
        onCustomRoomLoaded={handleCustomRoomLoaded}
        initialVideoFile={initialDroppedVideo}
      />

      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      <AddPOIDialog
        isOpen={Boolean(newPOICoords)}
        onClose={() => {
          setNewPOICoords(null);
          setTappedObjectInfo(null);
        }}
        coordinates={newPOICoords}
        initialName={tappedObjectInfo ? `${tappedObjectInfo.name} SOP` : ''}
        initialCategory="sop"
        onSavePOI={handleSaveCustomPOI}
      />

      <FloorplanModal
        isOpen={isFloorplanOpen}
        onClose={() => setIsFloorplanOpen(false)}
        preset={preset}
        customRoom={customRoom}
      />
    </div>
  );
}
