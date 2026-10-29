import type { POI, RoomZone, NavNode } from '../types/spatial';

/**
 * Smart Home Digital Twin - Round 1 Primary Dataset
 * Conforms to Round 1 Requirement: "Participants test and map their own home
 * (or a similarly accessible indoor space) based on their defined SOP."
 */

export const HOME_ROOM_ZONES: RoomZone[] = [
  {
    id: 'room-living',
    name: 'Living Room & Media Lounge',
    type: 'living',
    bounds: { minX: -7, maxX: 1, minZ: -1, maxZ: 7 },
    areaSqFt: 280,
    description: 'Central living area with a 3-seater plush sectional sofa, low coffee table, smart 4K display, and ambient floor lighting.',
    floor: 1,
    center: [-3, 0, 3],
    items: ['3-Seater Sofa', 'Coffee Table', 'TV Console', 'Floor Lamp', 'Smart Speaker']
  },
  {
    id: 'room-kitchen',
    name: 'Modular Kitchen & Breakfast Bar',
    type: 'kitchen',
    bounds: { minX: 1, maxX: 7, minZ: 0, maxZ: 7 },
    areaSqFt: 190,
    description: 'Open-concept kitchen with quartz breakfast island, induction range, smart refrigerator, and sink station.',
    floor: 1,
    center: [4, 0, 3.5],
    items: ['Quartz Island', 'Induction Cooktop', 'Refrigerator', 'Espresso Machine', 'Pantry Cabinet']
  },
  {
    id: 'room-master-bed',
    name: 'Master Bedroom Suite',
    type: 'bedroom',
    bounds: { minX: -7, maxX: -1, minZ: -7, maxZ: -1 },
    areaSqFt: 220,
    description: 'Quiet primary bedroom with queen bed, nightstands, wardrobe closet, and bedside reading sconces.',
    floor: 1,
    center: [-4, 0, -4],
    items: ['Queen Bed', 'Nightstands', 'Wardrobe', 'Air Purifier', 'Vanity Mirror']
  },
  {
    id: 'room-study',
    name: 'Home Study & Workstation',
    type: 'study',
    bounds: { minX: 1, maxX: 7, minZ: -7, maxZ: -2 },
    areaSqFt: 160,
    description: 'Dedicated workspace equipped with an ergonomic standing desk, dual 4K monitors, bookshelf, and high-speed Wi-Fi 6 mesh pod.',
    floor: 1,
    center: [4, 0, -4.5],
    items: ['Standing Desk', 'Dual Monitors', 'Ergonomic Chair', 'Bookshelf', 'Mesh Router']
  },
  {
    id: 'room-balcony',
    name: 'Garden Balcony & Patio',
    type: 'balcony',
    bounds: { minX: -7, maxX: 1, minZ: 7, maxZ: 9.5 },
    areaSqFt: 95,
    description: 'Outdoor fresh-air balcony featuring potted foliage, weather-resistant bistro seating, and panoramic outdoor view.',
    floor: 1,
    center: [-3, 0, 8.2],
    items: ['Bistro Chairs', 'Planter Boxes', 'Outdoor Decking']
  },
  {
    id: 'room-bathroom',
    name: 'Bathroom & Powder Suite',
    type: 'bathroom',
    bounds: { minX: -1, maxX: 2.5, minZ: -7, maxZ: -4 },
    areaSqFt: 65,
    description: 'Full bathroom with frameless glass shower cubicle, floating vanity, backlit mirror, and ventilation system.',
    floor: 1,
    center: [0.8, 0, -5.5],
    items: ['Glass Shower', 'Floating Vanity', 'Mirror Cabinet', 'Towel Rack']
  },
  {
    id: 'room-hallway',
    name: 'Main Foyer & Entry Corridor',
    type: 'hallway',
    bounds: { minX: -1, maxX: 2, minZ: -2, maxZ: 1 },
    areaSqFt: 85,
    description: 'Main entryway corridor connecting the living space to bedrooms, kitchen, and bathroom with shoe storage.',
    floor: 1,
    center: [0.5, 0, -0.5],
    items: ['Shoe Console', 'Key Rack', 'Security Intercom', 'Main Door']
  }
];

export const HOME_POIS: POI[] = [
  {
    id: 'poi-home-entrance',
    name: 'Main Entrance & Smart Lock',
    category: 'room',
    position: [0.5, 0.4, 0.5],
    description: 'Primary apartment threshold with smart digital deadbolt, intercom camera, and key drop console.',
    floor: 1,
    roomNumber: 'ENTRANCE',
    tags: ['entrance', 'door', 'hallway', 'security']
  },
  {
    id: 'poi-home-sofa',
    name: '3-Seater Sectional Sofa',
    category: 'amenity',
    position: [-3.5, 0.4, 2.5],
    description: 'Comfortable 3-seater fabric sectional sofa facing the entertainment center and coffee table.',
    floor: 1,
    roomNumber: 'LIVING-01',
    tags: ['sofa', '3-seater', 'couch', 'living room', 'seating']
  },
  {
    id: 'poi-home-tv',
    name: 'Smart 4K Entertainment Center',
    category: 'tech',
    position: [-3.5, 0.4, 6.2],
    description: 'Wall-mounted 65-inch OLED display, soundbar, and streaming console.',
    floor: 1,
    roomNumber: 'MEDIA-01',
    tags: ['tv', 'screen', 'display', 'entertainment']
  },
  {
    id: 'poi-home-kitchen-island',
    name: 'Breakfast Island & Bar Stools',
    category: 'amenity',
    position: [3.8, 0.4, 2.8],
    description: 'Center quartz kitchen island with counter seating, under-mount prep sink, and overhead pendant lights.',
    floor: 1,
    roomNumber: 'KITCHEN-01',
    tags: ['kitchen', 'island', 'food', 'dining', 'cooking']
  },
  {
    id: 'poi-home-refrigerator',
    name: 'Smart Refrigerator & Pantry',
    category: 'amenity',
    position: [6.0, 0.4, 6.0],
    description: 'Double-door refrigerator with filtered cold water dispenser and adjacent spice pantry.',
    floor: 1,
    roomNumber: 'KITCHEN-02',
    tags: ['fridge', 'refrigerator', 'pantry', 'water']
  },
  {
    id: 'poi-home-desk',
    name: 'Remote Workstation & PC Desk',
    category: 'tech',
    position: [4.0, 0.4, -5.2],
    description: 'Adjustable motorized standing desk with dual 4K monitors, mechanical keyboard, and USB-C dock.',
    floor: 1,
    roomNumber: 'STUDY-01',
    tags: ['desk', 'work', 'computer', 'monitors', 'coding']
  },
  {
    id: 'poi-home-bed',
    name: 'Queen Bed & Nightstands',
    category: 'room',
    position: [-4.2, 0.4, -4.5],
    description: 'Primary queen mattress bed with upholstered headboard, memory foam pillows, and dual bedside lamps.',
    floor: 1,
    roomNumber: 'BED-01',
    tags: ['bed', 'sleep', 'bedroom', 'rest']
  },
  {
    id: 'poi-home-balcony',
    name: 'Patio Lounger & Planters',
    category: 'amenity',
    position: [-3.0, 0.4, 8.3],
    description: 'Fresh-air balcony overlooking outdoor greenery with teakwood chairs and hanging potted ferns.',
    floor: 1,
    roomNumber: 'PATIO-01',
    tags: ['balcony', 'patio', 'plants', 'outdoor']
  },
  {
    id: 'poi-home-bath',
    name: 'Walk-In Shower & Vanity',
    category: 'amenity',
    position: [0.8, 0.4, -5.8],
    description: 'Modern bathroom with thermostatic rain shower, anti-fog backlit mirror, and ceramic basin.',
    floor: 1,
    roomNumber: 'BATH-01',
    tags: ['bathroom', 'shower', 'washroom', 'mirror']
  },
  {
    id: 'poi-home-fire-safety',
    name: 'Home Fire Extinguisher & First-Aid',
    category: 'safety',
    position: [1.2, 0.4, 0.2],
    description: 'Wall-mounted 2kg dry chemical fire extinguisher, smoke detector test button, and emergency medical kit.',
    floor: 1,
    roomNumber: 'SAFETY-01',
    tags: ['safety', 'fire', 'emergency', 'extinguisher', 'first-aid']
  }
];

/**
 * Navmesh graph for the Home dataset.
 * Specifically paths around the physical furniture obstacles (Sofa, Coffee Table, Kitchen Island, Bed, Desk)
 * ensuring non-colliding floor routing!
 */
export const HOME_NAV_GRAPH: Record<string, NavNode> = {
  // Foyer / Hallway central spine
  'home-foyer': {
    id: 'home-foyer',
    position: [0.5, 0, 0.5],
    neighbors: ['home-hallway-junction', 'home-living-entry', 'home-kitchen-entry'],
    name: 'Entry Foyer'
  },
  'home-hallway-junction': {
    id: 'home-hallway-junction',
    position: [0.5, 0, -2.5],
    neighbors: ['home-foyer', 'home-bed-door', 'home-study-door', 'home-bath-door'],
    name: 'Bedrooms Junction'
  },

  // Living Room navigation (Orthogonal Manhattan walkways)
  'home-living-entry': {
    id: 'home-living-entry',
    position: [-1.2, 0, 0.5],
    neighbors: ['home-foyer', 'home-living-walkway-north', 'home-living-walkway-south'],
    name: 'Living Room Threshold'
  },
  'home-living-walkway-north': {
    id: 'home-living-walkway-north',
    position: [-1.2, 0, 4.5],
    neighbors: ['home-living-entry', 'home-living-tv', 'home-balcony-door', 'home-sofa-spot'],
    name: 'Living Center Walkway'
  },
  'home-living-walkway-south': {
    id: 'home-living-walkway-south',
    position: [-5.5, 0, 0.5],
    neighbors: ['home-living-entry', 'home-sofa-spot'],
    name: 'Sofa Aisle'
  },
  'home-sofa-spot': {
    id: 'home-sofa-spot',
    position: [-3.5, 0, 2.5],
    neighbors: ['home-living-walkway-south', 'home-living-walkway-north'],
    name: '3-Seater Sofa Lounge'
  },
  'home-living-tv': {
    id: 'home-living-tv',
    position: [-3.5, 0, 5.5],
    neighbors: ['home-living-walkway-north', 'home-balcony-door'],
    name: 'Media Display Wall'
  },
  'home-balcony-door': {
    id: 'home-balcony-door',
    position: [-1.2, 0, 7.0],
    neighbors: ['home-living-walkway-north', 'home-living-tv', 'home-balcony-center'],
    name: 'Balcony Glass Door'
  },
  'home-balcony-center': {
    id: 'home-balcony-center',
    position: [-3.0, 0, 8.3],
    neighbors: ['home-balcony-door'],
    name: 'Balcony Patio'
  },

  // Kitchen navigation (Orthogonal aisles)
  'home-kitchen-entry': {
    id: 'home-kitchen-entry',
    position: [2.0, 0, 0.5],
    neighbors: ['home-foyer', 'home-kitchen-aisle-left', 'home-island-spot'],
    name: 'Kitchen Entrance'
  },
  'home-kitchen-aisle-left': {
    id: 'home-kitchen-aisle-left',
    position: [2.0, 0, 4.5],
    neighbors: ['home-kitchen-entry', 'home-island-spot', 'home-fridge-spot'],
    name: 'Island Left Aisle'
  },
  'home-island-spot': {
    id: 'home-island-spot',
    position: [3.8, 0, 2.8],
    neighbors: ['home-kitchen-entry', 'home-kitchen-aisle-left', 'home-kitchen-aisle-right'],
    name: 'Breakfast Island'
  },
  'home-kitchen-aisle-right': {
    id: 'home-kitchen-aisle-right',
    position: [5.5, 0, 3.5],
    neighbors: ['home-island-spot', 'home-fridge-spot'],
    name: 'Cooktop Prep Aisle'
  },
  'home-fridge-spot': {
    id: 'home-fridge-spot',
    position: [5.5, 0, 5.5],
    neighbors: ['home-kitchen-aisle-left', 'home-kitchen-aisle-right'],
    name: 'Refrigerator Pantry'
  },

  // Master Bedroom navigation (Orthogonal)
  'home-bed-door': {
    id: 'home-bed-door',
    position: [-1.5, 0, -2.5],
    neighbors: ['home-hallway-junction', 'home-bed-aisle-foot'],
    name: 'Bedroom Door'
  },
  'home-bed-aisle-foot': {
    id: 'home-bed-aisle-foot',
    position: [-4.0, 0, -2.5],
    neighbors: ['home-bed-door', 'home-bed-spot'],
    name: 'Bed Foot Aisle'
  },
  'home-bed-spot': {
    id: 'home-bed-spot',
    position: [-4.0, 0, -4.5],
    neighbors: ['home-bed-aisle-foot', 'home-bed-side-left'],
    name: 'Master Bed'
  },
  'home-bed-side-left': {
    id: 'home-bed-side-left',
    position: [-6.0, 0, -4.5],
    neighbors: ['home-bed-spot'],
    name: 'Bedside Nightstand'
  },

  // Study & Workstation navigation (Orthogonal)
  'home-study-door': {
    id: 'home-study-door',
    position: [2.0, 0, -2.5],
    neighbors: ['home-hallway-junction', 'home-desk-spot'],
    name: 'Study Door'
  },
  'home-desk-spot': {
    id: 'home-desk-spot',
    position: [4.0, 0, -2.5],
    neighbors: ['home-study-door', 'home-desk-chair'],
    name: 'Workstation Threshold'
  },
  'home-desk-chair': {
    id: 'home-desk-chair',
    position: [4.0, 0, -4.5],
    neighbors: ['home-desk-spot', 'home-study-bookshelf'],
    name: 'Workstation Standing Desk'
  },
  'home-study-bookshelf': {
    id: 'home-study-bookshelf',
    position: [5.8, 0, -3.0],
    neighbors: ['home-desk-chair'],
    name: 'Study Bookshelf'
  },

  // Bathroom navigation (Orthogonal)
  'home-bath-door': {
    id: 'home-bath-door',
    position: [0.8, 0, -2.5],
    neighbors: ['home-hallway-junction', 'home-bath-spot'],
    name: 'Bathroom Door'
  },
  'home-bath-spot': {
    id: 'home-bath-spot',
    position: [0.8, 0, -5.5],
    neighbors: ['home-bath-door'],
    name: 'Shower & Vanity'
  }
};

