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
import { HOME_POIS, HOME_NAV_GRAPH } from './data/homeDataset';
import { OFFICE_POIS, OFFICE_NAV_GRAPH } from './data/officeDataset';
import { findShortestPath, distance3D } from './utils/navGraph';
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

  // 3. Navigation State
  const [activePath, setActivePath] = useState<NavPathResult | null>(null);
  const [targetNavPOI, setTargetNavPOI] = useState<POI | null>(null);
  const [currentNavStep, setCurrentNavStep] = useState<number>(0);

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

  // 5. Lighting & Utilities State (Fuselab Reference Image)
  const [lightingTime, setLightingTime] = useState<LightingTime>('afternoon');
  const [utilityLayer, setUtilityLayer] = useState<UtilityLayer>('none');

  // 6. Modals State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isFloorplanOpen, setIsFloorplanOpen] = useState(false);
  const [isAddingPOI, setIsAddingPOI] = useState(false);
  const [newPOICoords, setNewPOICoords] = useState<[number, number, number] | null>(null);

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

  // Navigation handlers
  const handleStartNavigation = useCallback(
    (poi: POI) => {
      const pathResult = findShortestPath(telemetry.position, poi.position, activeNavGraph);
      if (pathResult) {
        setActivePath(pathResult);
        setTargetNavPOI(poi);
        setCurrentNavStep(0);
      }
    },
    [telemetry.position, activeNavGraph]
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

      const pathResult = findShortestPath(telemetry.position, zone.center, activeNavGraph);
      if (pathResult) {
        setActivePath(pathResult);
        setTargetNavPOI(roomTargetPOI);
        setCurrentNavStep(0);
      }
    },
    [telemetry.position, activeNavGraph]
  );

  const handleCancelNavigation = useCallback(() => {
    setActivePath(null);
    setTargetNavPOI(null);
    setCurrentNavStep(0);
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
    },
    [preset]
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
    <div className="raasta-app-container">
      {/* 1. Top Architectural Control Bar (fuselab creative styling) */}
      <TopNavbar
        mode={mode}
        onSetMode={setMode}
        preset={preset}
        onSetPreset={handleSetPreset}
        hasCustomRoom={Boolean(customRoom)}
        lightingTime={lightingTime}
        onSetLightingTime={setLightingTime}
        utilityLayer={utilityLayer}
        onSetUtilityLayer={setUtilityLayer}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onToggleFloorplan={() => setIsFloorplanOpen(true)}
        isAddingPOI={isAddingPOI}
        onToggleAddPOI={() => setIsAddingPOI(!isAddingPOI)}
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
      />

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
        />
      )}

      {/* 5. Reference Image: Bottom-Left Unit Specs Stack (🛏️ 2, 🛁 2, 🌿 1) */}
      <div className="fuselab-unit-specs-stack">
        <div className="spec-badge-item" title="Bedrooms">
          <span className="spec-icon">🛏️</span>
          <span className="spec-count">{preset === 'home' ? '2' : customRoom ? '1' : '4'}</span>
        </div>
        <div className="spec-badge-item" title="Bathrooms">
          <span className="spec-icon">🛁</span>
          <span className="spec-count">{preset === 'home' ? '2' : '1'}</span>
        </div>
        <div className="spec-badge-item" title="Terraces">
          <span className="spec-icon">🌿</span>
          <span className="spec-count">1</span>
        </div>
      </div>

      {/* 6. Reference Image: Bottom-Right View Controls (Gallery 10, Room view, Map) */}
      <div className="fuselab-bottom-right-cluster">
        <button
          className="fuselab-quick-view-btn"
          onClick={() => setIsUploadOpen(true)}
          title="View Reconstructed Video Keyframes"
        >
          <span>🖼️ Gallery {customRoom ? customRoom.keyframes.length : '10'}</span>
        </button>
        <button
          className={`fuselab-quick-view-btn ${mode === 'walk' ? 'active' : ''}`}
          onClick={() => setMode('walk')}
          title="Walk Inside Room (First-Person)"
        >
          <span>🚶 Room view</span>
        </button>
        <button
          className={`fuselab-quick-view-btn ${mode === 'orbit' ? 'active' : ''}`}
          onClick={() => setMode('orbit')}
          title="3D Architectural Overview Map"
        >
          <span>🗺️ Map</span>
        </button>
      </div>

      {/* 7. 2D Interactive Radar Minimap */}
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
        onClose={() => setIsUploadOpen(false)}
        onLoadModel={handleLoadModel}
        currentModelName={modelName}
        onCustomRoomLoaded={handleCustomRoomLoaded}
      />

      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      <AddPOIDialog
        isOpen={Boolean(newPOICoords)}
        onClose={() => setNewPOICoords(null)}
        coordinates={newPOICoords}
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
