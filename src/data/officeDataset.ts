import type { POI, RoomZone } from '../types/spatial';
import { INDOOR_NAV_GRAPH } from '../utils/navGraph';

export const OFFICE_ROOM_ZONES: RoomZone[] = [
  {
    id: 'zone-reception',
    name: 'Main Welcome & Reception Foyer',
    type: 'office',
    bounds: { minX: -6, maxX: 6, minZ: 5, maxZ: 10 },
    areaSqFt: 450,
    description: 'Primary visitor check-in, guest badges, and indoor digital twin orientation station.',
    floor: 1,
    center: [0, 0, 7],
    items: ['Reception Desk', 'Visitor Terminal', 'Check-In Kiosk', 'Display Wall']
  },
  {
    id: 'zone-juspay-lab',
    name: 'Juspay Spatial Innovation Lab',
    type: 'lab',
    bounds: { minX: -15, maxX: -4, minZ: 0, maxZ: 6 },
    areaSqFt: 620,
    description: 'High-performance engineering center focused on AR indoor navigation, spatial computing, and next-gen payment flows.',
    floor: 1,
    center: [-8, 0, 3],
    items: ['AR Test Benches', 'LiDAR Sensor Rig', 'Compute Pods', 'HoloLens Dock']
  },
  {
    id: 'zone-techfest-arena',
    name: 'Techfest IIT Bombay Exhibition Hall',
    type: 'office',
    bounds: { minX: 4, maxX: 15, minZ: 0, maxZ: 6 },
    areaSqFt: 650,
    description: 'Grand showcase arena for robotics, autonomous spatial intelligence, and student innovations.',
    floor: 1,
    center: [8, 0, 3],
    items: ['Exhibition Booths', 'Robotics Arena', 'Keynote Projection Screen']
  },
  {
    id: 'zone-server-hub',
    name: 'Neural Cloud Server Hub',
    type: 'office',
    bounds: { minX: -15, maxX: -4, minZ: -10, maxZ: -2 },
    areaSqFt: 520,
    description: 'Edge GPU clusters running real-time 3D Gaussian Splatting synthesis and neural radiance field caching.',
    floor: 1,
    center: [-8, 0, -6],
    items: ['NVIDIA Server Racks', 'Fiber Switch Bay', 'UPS Power Vault']
  },
  {
    id: 'zone-boardroom',
    name: 'Turing Executive Boardroom',
    type: 'office',
    bounds: { minX: 4, maxX: 15, minZ: -10, maxZ: -2 },
    areaSqFt: 540,
    description: 'Hybrid meeting facility equipped with 4K spatial telepresence and wireless collaboration screens.',
    floor: 1,
    center: [8, 0, -6],
    items: ['Conference Table', 'Telepresence Rig', 'Whiteboard', '16-Seat Chairs']
  },
  {
    id: 'zone-pantry',
    name: 'Silicon Pantry & Lounge',
    type: 'office',
    bounds: { minX: -4, maxX: 4, minZ: -6, maxZ: 1 },
    areaSqFt: 380,
    description: 'Espresso bar, refreshments, comfortable breakout pods, and open collaborative lounge.',
    floor: 1,
    center: [0, 0, -3],
    items: ['Espresso Bar', 'Breakout Pods', 'Snack Counter', 'Water Station']
  }
];

export const OFFICE_POIS: POI[] = [
  {
    id: 'poi-reception',
    name: 'Main Welcome & Reception',
    category: 'room',
    position: [0, 0.4, 7],
    description: 'Primary visitor check-in, guest badges, and indoor digital twin orientation station.',
    floor: 1,
    roomNumber: 'HUB-101',
    tags: ['entrance', 'registration', 'lobby', 'check-in']
  },
  {
    id: 'poi-juspay-lab',
    name: 'Juspay Spatial Innovation Lab',
    category: 'lab',
    position: [-8, 0.4, 3],
    description: 'High-performance engineering center focused on AR indoor navigation, spatial computing, and next-gen payment flows.',
    floor: 1,
    roomNumber: 'LAB-204',
    tags: ['juspay', 'tech', 'ai', 'spatial', 'robotics']
  },
  {
    id: 'poi-techfest-arena',
    name: 'Techfest IIT Bombay Exhibition Hall',
    category: 'room',
    position: [8, 0.4, 3],
    description: 'Grand showcase arena for robotics, autonomous spatial intelligence, and student innovations.',
    floor: 1,
    roomNumber: 'HALL-A',
    tags: ['techfest', 'iit bombay', 'exhibition', 'demos']
  },
  {
    id: 'poi-server-hub',
    name: 'Neural Cloud Server Hub',
    category: 'tech',
    position: [-8, 0.4, -6],
    description: 'Edge GPU clusters running real-time 3D Gaussian Splatting synthesis and neural radiance field caching.',
    floor: 1,
    roomNumber: 'SRV-01',
    tags: ['servers', 'gpu', 'datacenter', 'infrastructure']
  },
  {
    id: 'poi-conference-room',
    name: 'Turing Executive Boardroom',
    category: 'room',
    position: [8, 0.4, -6],
    description: 'Hybrid meeting facility equipped with 4K spatial telepresence and wireless collaboration screens.',
    floor: 1,
    roomNumber: 'CONF-301',
    tags: ['meeting', 'conference', 'presentation']
  },
  {
    id: 'poi-cafeteria',
    name: 'Silicon Pantry & Lounge',
    category: 'amenity',
    position: [0, 0.4, -4],
    description: 'Espresso bar, refreshments, comfortable breakout pods, and open collaborative lounge.',
    floor: 1,
    roomNumber: 'CAFE-01',
    tags: ['coffee', 'food', 'relax', 'pantry', 'water']
  },
  {
    id: 'poi-fire-exit-west',
    name: 'Emergency Exit (West Wing)',
    category: 'safety',
    position: [-13, 0.4, 0],
    description: 'Direct illuminated emergency egress corridor, first-aid kit, and class-ABC fire extinguisher.',
    floor: 1,
    roomNumber: 'EXIT-W',
    tags: ['safety', 'fire', 'emergency', 'stairs']
  },
  {
    id: 'poi-fire-exit-east',
    name: 'Emergency Exit (East Wing)',
    category: 'safety',
    position: [13, 0.4, 0],
    description: 'Secondary emergency exit route with automated pressurized fire doors.',
    floor: 1,
    roomNumber: 'EXIT-E',
    tags: ['safety', 'fire', 'emergency']
  },
  {
    id: 'poi-restrooms',
    name: 'Restrooms & Washroom Suite',
    category: 'amenity',
    position: [4, 0.4, -8],
    description: 'Accessible restrooms with contact-free amenities and sanitation dispensers.',
    floor: 1,
    roomNumber: 'WASH-1',
    tags: ['restroom', 'washroom', 'toilet', 'amenity']
  }
];

export { INDOOR_NAV_GRAPH as OFFICE_NAV_GRAPH };

