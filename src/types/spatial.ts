export type POICategory = 'room' | 'lab' | 'amenity' | 'safety' | 'tech';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  position: [number, number, number]; // [x, y, z] in Three.js coordinates
  description: string;
  floor: number;
  roomNumber?: string;
  iconName?: string;
  tags: string[];
}

export interface RoomZone {
  id: string;
  name: string;
  type: 'living' | 'kitchen' | 'bedroom' | 'study' | 'bathroom' | 'balcony' | 'hallway' | 'lab' | 'office';
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  areaSqFt: number;
  description: string;
  floor: number;
  center: [number, number, number];
  items?: string[];
}

export type ViewMode = 'orbit' | 'third' | 'walk' | 'ar';
export type EnvironmentPreset = 'home' | 'office' | 'custom_room';
export type LightingTime = 'daylight' | 'night' | 'morning' | 'afternoon' | 'dusk';
export type UtilityLayer = 'none' | 'daylight' | 'electricity' | 'water' | 'gas' | 'ac';

export interface CustomRoomObstacle {
  name: string;
  type: 'bed' | 'desk' | 'sofa' | 'wardrobe' | 'table' | 'tv_unit' | 'chair' | 'cabinet' | 'door' | 'window' | 'cabin' | 'workstation_row' | 'laptop';
  position: [number, number, number];
  size: [number, number, number]; // [width, height, depth]
  colorHex: number;
}

export interface CustomRoomData {
  id: string;
  name: string;
  videoFileName: string;
  videoDurationSec: number;
  extractedKeyframesCount: number;
  pointCount: number;
  reconstructionTimeSec: number;
  roomType: 'bedroom' | 'living' | 'study' | 'studio' | 'office' | 'general';
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  palette: {
    wallColor: number;
    floorColor: number;
    trimColor: number;
    furnitureUpholstery?: number;
    woodTone?: number;
    accentColor?: number;
    techColor?: number;
    floorRoughness: number;
  };
  detectedObstacles: CustomRoomObstacle[];
  splatBlobUrl?: string;
  plyBlobUrl?: string;
  splatFileSizeKb?: number;
  plyFileSizeKb?: number;
  keyframes: string[];
  pois: POI[];
  zones: RoomZone[];
  navGraph: Record<string, NavNode>;
  pointCloudData?: Float32Array; // [x, y, z, r, g, b, ...]
}

export interface NavNode {
  id: string;
  position: [number, number, number];
  neighbors: string[];
  name?: string;
}

export interface NavPathResult {
  nodes: NavNode[];
  coordinates: [number, number, number][];
  totalDistanceMeters: number;
  estimatedWalkingSeconds: number;
  turnInstructions: TurnInstruction[];
}

export interface TurnInstruction {
  text: string;
  type: 'straight' | 'left' | 'right' | 'arrive';
  distanceMeters: number;
  position: [number, number, number];
}

export interface NavigationState {
  isNavigating: boolean;
  startNodeId: string | null;
  targetPOI: POI | null;
  path: NavPathResult | null;
  currentStepIndex: number;
  distanceRemainingMeters: number;
}
