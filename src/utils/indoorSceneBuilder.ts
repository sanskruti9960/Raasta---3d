import * as THREE from 'three';
import type { POI, RoomZone, EnvironmentPreset, CustomRoomData, LightingTime, UtilityLayer } from '../types/spatial';
import { HOME_ROOM_ZONES } from '../data/homeDataset';
import { OFFICE_ROOM_ZONES } from '../data/officeDataset';
import {
  buildComputerWorkstation,
  buildSmartTVMediaUnit,
  buildLivingRoomSuite,
  buildMasterBedSuite,
  buildKitchenSuite,
  buildTerraceBalconySuite,
  buildPottedPlant,
  buildWhiteboardStand,
  buildWorkstationBenchCluster,
  buildReceptionDeskSuite,
  buildOfficeLoungeBreakout,
  buildConferenceCabin
} from './furnitureAssetBuilder';

export interface DigitalTwinBuildResult {
  architectureGroup: THREE.Group;
  poiGroup: THREE.Group;
  pathGroup: THREE.Group;
  zoneGroup: THREE.Group;
  animatedElements: Array<{ update: (delta: number, elapsed: number) => void }>;
  wallBoxes: THREE.Box3[];
  obstacleBoxes: THREE.Box3[];
  obstacleMeshes: THREE.Mesh[];
  wallMeshes: THREE.Mesh[];
  sunLight?: THREE.DirectionalLight;
  ambientLight?: THREE.AmbientLight;
}

export interface BuildOptions {
  lightingTime?: LightingTime;
  utilityLayer?: UtilityLayer;
}

/**
 * Creates realistic architectural digital twin elements
 * modeled after high-end architectural real estate visualizations (fuselab creative style).
 * 100% Solid & Opaque. No transparent glowing AI materials.
 * Walls have realistic architectural cutaway height (1.35m) so all
 * interior rooms and obstacles are clearly visible and traceable.
 */
export function buildIndoorDigitalTwin(
  scene: THREE.Scene,
  preset: EnvironmentPreset = 'home',
  onSelectZone?: (zone: RoomZone) => void,
  customRoom?: CustomRoomData | null,
  options: BuildOptions = {}
): DigitalTwinBuildResult {
  const { lightingTime = 'afternoon', utilityLayer = 'none' } = options;
  const animatedElements: Array<{ update: (delta: number, elapsed: number) => void }> = [];
  const wallBoxes: THREE.Box3[] = [];
  const obstacleBoxes: THREE.Box3[] = [];
  const obstacleMeshes: THREE.Mesh[] = [];
  const wallMeshes: THREE.Mesh[] = [];

  // Group containers
  const architectureGroup = new THREE.Group();
  architectureGroup.name = 'digital-twin-architecture';
  scene.add(architectureGroup);

  const zoneGroup = new THREE.Group();
  zoneGroup.name = 'room-zones-group';
  scene.add(zoneGroup);

  const poiGroup = new THREE.Group();
  const pathGroup = new THREE.Group();

  // 1. Natural Architectural Lighting
  // Morning: warm golden sun angle. Afternoon: bright crisp architectural daylight.
  let sunColor = 0xfff6ea;
  let sunIntensity = 1.7;
  let sunPosX = 14;
  let sunPosY = 22;
  let sunPosZ = 16;
  let ambientIntensity = 1.1;

  if (lightingTime === 'morning') {
    sunColor = 0xffeed5;
    sunIntensity = 1.85;
    sunPosX = -18;
    sunPosY = 18;
    sunPosZ = 14;
    ambientIntensity = 1.0;
  } else if (lightingTime === 'dusk') {
    sunColor = 0xfdba74;
    sunIntensity = 1.3;
    sunPosX = 20;
    sunPosY = 12;
    sunPosZ = 18;
    ambientIntensity = 0.85;
  } else if (lightingTime === 'night') {
    sunColor = 0x93c5fd;
    sunIntensity = 0.5;
    sunPosX = 10;
    sunPosY = 20;
    sunPosZ = 10;
    ambientIntensity = 0.45;
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
  architectureGroup.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(sunColor, sunIntensity);
  sunLight.position.set(sunPosX, sunPosY, sunPosZ);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 80;
  const d = 25;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0001;
  architectureGroup.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.6);
  fillLight.position.set(-sunPosX, 16, -sunPosZ);
  architectureGroup.add(fillLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.65);
  architectureGroup.add(hemiLight);

  // Warm interior recessed spotlights to mimic architectural downlights in the reference image
  function addDownlight(x: number, y: number, z: number, color = 0xffedd5, intensity = 1.8, distance = 7.5) {
    const light = new THREE.PointLight(color, intensity, distance, 1.2);
    light.position.set(x, y, z);
    light.castShadow = false; // keep frame rate rock solid at 60 FPS
    architectureGroup.add(light);

    // Subtle ceiling glowing fixture ring
    const fixtureGeo = new THREE.RingGeometry(0.04, 0.08, 16);
    const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xffedd5, side: THREE.DoubleSide });
    const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
    fixture.rotation.x = Math.PI / 2;
    fixture.position.set(x, y + 0.01, z);
    architectureGroup.add(fixture);
    return light;
  }

  // Add interior downlights matching reference image layout
  addDownlight(-3.5, 2.2, 3.5, 0xfff1e0, 2.2); // Living room
  addDownlight(-4.2, 2.2, -4.5, 0xffe6c7, 1.9); // Bedroom
  addDownlight(4.5, 2.2, 3.5, 0xffffff, 2.0); // Kitchen
  addDownlight(0, 2.2, 0.5, 0xfff7ed, 1.8); // Foyer / Dining

  // 2. Solid Architectural Wall Materials
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Crisp off-white architectural plaster
    roughness: 0.9,
    metalness: 0.02
  });

  const wallCapMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // Smooth top cap
    roughness: 0.6,
    metalness: 0.05
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Dark architectural skirting base
    roughness: 0.5,
    metalness: 0.1
  });

  const defaultWallHeight = 1.4;

  function addWall(
    x: number,
    z: number,
    width: number,
    depth: number,
    height = defaultWallHeight,
    customMat?: THREE.Material
  ) {
    // Main wall body
    const geo = new THREE.BoxGeometry(width, height, depth);
    const wall = new THREE.Mesh(geo, customMat || wallMat);
    wall.position.set(x, height / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData = { isWall: true };
    architectureGroup.add(wall);
    wallMeshes.push(wall);

    // Wall Top Cap (Gives crisp architectural bevel outline as seen in 3D plans)
    const capGeo = new THREE.BoxGeometry(width + 0.02, 0.04, depth + 0.02);
    const cap = new THREE.Mesh(capGeo, wallCapMat);
    cap.position.set(x, height + 0.02, z);
    cap.receiveShadow = true;
    architectureGroup.add(cap);

    // Baseboard trim at bottom
    const trimHeight = 0.08;
    const trimGeo = new THREE.BoxGeometry(width + 0.02, trimHeight, depth + 0.02);
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(x, trimHeight / 2, z);
    architectureGroup.add(trim);

    // Physical collision box (blocks player traversal up to 2.4m)
    const box = new THREE.Box3(
      new THREE.Vector3(x - width / 2 - 0.05, 0, z - depth / 2 - 0.05),
      new THREE.Vector3(x + width / 2 + 0.05, 2.5, z + depth / 2 + 0.05)
    );
    wallBoxes.push(box);
    return wall;
  }

  // Modern Architectural Glass Window Wall (with black aluminum mullions)
  const windowGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    transmission: 0.75
  });
  const windowFrameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.7
  });

  function addArchitecturalWindow(
    x: number,
    z: number,
    length: number,
    isHorizontal = true,
    height = 1.4
  ) {
    const paneDepth = isHorizontal ? 0.06 : length;
    const paneWidth = isHorizontal ? length : 0.06;
    const glass = new THREE.Mesh(new THREE.BoxGeometry(paneWidth, height, paneDepth), windowGlassMat);
    glass.position.set(x, height / 2, z);
    architectureGroup.add(glass);

    // Frame top and bottom
    const bottomFrame = new THREE.Mesh(
      new THREE.BoxGeometry(isHorizontal ? length : 0.1, 0.06, isHorizontal ? 0.1 : length),
      windowFrameMat
    );
    bottomFrame.position.set(x, 0.03, z);
    architectureGroup.add(bottomFrame);

    const topFrame = new THREE.Mesh(
      new THREE.BoxGeometry(isHorizontal ? length : 0.1, 0.06, isHorizontal ? 0.1 : length),
      windowFrameMat
    );
    topFrame.position.set(x, height, z);
    architectureGroup.add(topFrame);

    // Vertical mullions every ~1.2m
    const mullionCount = Math.max(2, Math.floor(length / 1.2));
    for (let i = 0; i <= mullionCount; i++) {
      const offset = -length / 2 + (i / mullionCount) * length;
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, height, 0.08), windowFrameMat);
      if (isHorizontal) {
        mullion.position.set(x + offset, height / 2, z);
      } else {
        mullion.position.set(x, height / 2, z + offset);
        mullion.rotation.y = Math.PI / 2;
      }
      architectureGroup.add(mullion);
    }
  }

  function addSolidObstacle(
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    colorHex: number,
    roughness = 0.6,
    metalness = 0.1
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness,
      metalness
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { name, isObstacle: true };
    architectureGroup.add(mesh);
    obstacleMeshes.push(mesh);

    const box = new THREE.Box3(
      new THREE.Vector3(x - w / 2 - 0.05, 0, z - d / 2 - 0.05),
      new THREE.Vector3(x + w / 2 + 0.05, Math.max(h + 0.1, 1.8), z + d / 2 + 0.05)
    );
    obstacleBoxes.push(box);
    return mesh;
  }

  // 3. Realistic Floor Finishes for Room Zones
  const zonesToBuild = preset === 'custom_room'
    ? (customRoom?.zones || [])
    : preset === 'home'
      ? HOME_ROOM_ZONES
      : OFFICE_ROOM_ZONES;

  zonesToBuild.forEach((zone) => {
    const w = zone.bounds.maxX - zone.bounds.minX;
    const d = zone.bounds.maxZ - zone.bounds.minZ;
    const cx = (zone.bounds.minX + zone.bounds.maxX) / 2;
    const cz = (zone.bounds.minZ + zone.bounds.maxZ) / 2;

    let floorColor = 0xe2e8f0;
    let roughness = 0.5;

    if (zone.type === 'living') {
      floorColor = (preset === 'custom_room' && customRoom?.palette?.floorColor) ? customRoom.palette.floorColor : 0xd7ccc8; // Warm oak hardwood (matching reference image)
      roughness = 0.38;
    } else if (zone.type === 'bedroom') {
      floorColor = 0xc4b5a5; // Warm bedroom parquet
      roughness = 0.42;
    } else if (zone.type === 'kitchen') {
      floorColor = 0xeeeff2; // Polished porcelain floor
      roughness = 0.22;
    } else if (zone.type === 'study') {
      floorColor = 0xd1c7bd; // Natural Scandinavian oak
      roughness = 0.4;
    } else if (zone.type === 'bathroom') {
      floorColor = 0xe2e8f0; // Porcelain bathroom tile
      roughness = 0.2;
    } else if (zone.type === 'balcony') {
      floorColor = 0x78716c; // Outdoor slate terrace pavers (matching reference)
      roughness = 0.88;
    } else if (zone.type === 'hallway') {
      floorColor = 0xe7e5e4; // Corridor stone
      roughness = 0.35;
    } else if (zone.type === 'lab') {
      floorColor = 0xd7c4b0; // Warm oak lab finish matching render
      roughness = 0.35;
    } else if (zone.type === 'office') {
      floorColor = 0xddcbb6; // Warm minimalist oak wood floor matching render
      roughness = 0.38;
    }

    const floorGeo = new THREE.PlaneGeometry(w - 0.08, d - 0.08);
    const floorMat = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness,
      metalness: 0.04,
      side: THREE.DoubleSide
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(cx, 0.005, cz);
    floorMesh.receiveShadow = true;
    floorMesh.userData = { zone, isZone: true, onClick: () => onSelectZone?.(zone) };
    zoneGroup.add(floorMesh);

    // Subtle edge expansion joint
    const borderEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w - 0.08, 0.01, d - 0.08));
    const borderLine = new THREE.LineSegments(
      borderEdges,
      new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.35 })
    );
    borderLine.position.set(cx, 0.008, cz);
    zoneGroup.add(borderLine);
  });

  // Base Studio Floor (Deep dark midnight slate '#161a29' matching reference image)
  const baseSize = preset === 'custom_room'
    ? Math.max(customRoom?.dimensions.width || 12, customRoom?.dimensions.depth || 12) + 12
    : preset === 'home'
      ? 28
      : 40;
  const globalFloorGeo = new THREE.PlaneGeometry(baseSize + 10, baseSize + 10);
  const globalFloorMat = new THREE.MeshStandardMaterial({
    color: 0x161a29, // EXACT background slate from reference image
    roughness: 0.95,
    metalness: 0.05
  });
  const globalFloor = new THREE.Mesh(globalFloorGeo, globalFloorMat);
  globalFloor.rotation.x = -Math.PI / 2;
  globalFloor.position.y = -0.01;
  globalFloor.receiveShadow = true;
  architectureGroup.add(globalFloor);

  // Subtle architectural foundation slab below the house
  const slabWidth = preset === 'home' ? 16.5 : baseSize - 2;
  const slabDepth = preset === 'home' ? 18.5 : baseSize - 2;
  const slabGeo = new THREE.BoxGeometry(slabWidth, 0.15, slabDepth);
  const slabMat = new THREE.MeshStandardMaterial({
    color: 0x1e2438,
    roughness: 0.8
  });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.set(0, -0.08, preset === 'home' ? 1.2 : 0);
  slab.receiveShadow = true;
  architectureGroup.add(slab);

  if (preset === 'home') {
    // =========================================================================
    // HOME DATASET - Matching Reference Image (fuselab creative) Architecture
    // Real furniture suites, sectional sofa, smart TV, dining suite, beds, kitchen
    // =========================================================================

    // Perimeter Outer Walls (1.4m cutaway height, solid opaque drywall)
    addWall(0, 9.8, 15.6, 0.32);     // South outer (Balcony end)
    addWall(0, -7.3, 15.6, 0.32);    // North outer
    addWall(-7.4, 1.25, 0.32, 17.2); // West outer
    addWall(7.4, 1.25, 0.32, 17.2);  // East outer

    // Interior Partition Walls with clear, open doorways matching nav graph
    // Living / Bedroom divider (leaves open doorway into central foyer)
    addWall(-4.9, -1.0, 5.0, 0.22);

    // Kitchen / Study divider (leaves open doorway into central foyer)
    addWall(5.4, -1.0, 4.0, 0.22);

    // Bedroom / Bath divider wall with doorway opening at z = -2.5
    addWall(-1.0, -5.6, 0.22, 3.4);

    // Bath / Study divider wall with doorway opening at z = -2.5
    addWall(2.5, -5.6, 0.22, 3.4);

    // Balcony railing parapet (with open sliding door access)
    addWall(-5.0, 7.0, 4.8, 0.2, 1.05);

    // =========================================================================
    // REALISTIC 3D FURNITURE SUITES (Matching Reference Image)
    // =========================================================================

    // 1. Living Room Suite: L-shaped sectional sofa in cream upholstery + Walnut coffee table + Charcoal rug
    const livingSuite = buildLivingRoomSuite(-3.6, 0, 3.2, 0, {
      upholstery: 0xf1f5f9, // Off-white cream sectional as shown in image
      woodTone: 0x3e2723,
      accent: 0xd97706
    });
    architectureGroup.add(livingSuite.group);
    obstacleBoxes.push(livingSuite.collisionBox);
    obstacleMeshes.push(...livingSuite.meshes);

    // 2. 75" Smart OLED TV & Sleek Media Unit
    const tvUnit = buildSmartTVMediaUnit(-3.5, 0, 6.4, 0, {
      woodTone: 0x1e293b,
      metal: 0x0f172a
    });
    architectureGroup.add(tvUnit.group);
    obstacleBoxes.push(tvUnit.collisionBox);
    obstacleMeshes.push(...tvUnit.meshes);

    // 3. Central Dining Suite (Table + 4 Chairs matching reference image center)
    const diningTableGeo = new THREE.BoxGeometry(1.6, 0.05, 1.0);
    const diningTableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
    const diningTable = new THREE.Mesh(diningTableGeo, diningTableMat);
    diningTable.position.set(1.5, 0.74, 0.5);
    diningTable.castShadow = true;
    architectureGroup.add(diningTable);

    const diningLegGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.72, 12);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 }); // Brass legs
    [
      [-0.7, -0.4],
      [0.7, -0.4],
      [-0.7, 0.4],
      [0.7, 0.4]
    ].forEach(([dx, dz]) => {
      const leg = new THREE.Mesh(diningLegGeo, legMat);
      leg.position.set(1.5 + dx, 0.36, 0.5 + dz);
      leg.castShadow = true;
      architectureGroup.add(leg);
    });

    // 4 Modern Dining Chairs around table
    const chairSeatGeo = new THREE.BoxGeometry(0.42, 0.05, 0.42);
    const chairBackGeo = new THREE.BoxGeometry(0.42, 0.42, 0.04);
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    [
      [1.5, 1.2, 0],
      [1.5, -0.2, Math.PI],
      [0.8, 0.5, Math.PI / 2],
      [2.2, 0.5, -Math.PI / 2]
    ].forEach(([cx, cz, rot]) => {
      const chair = new THREE.Group();
      chair.position.set(cx, 0, cz);
      chair.rotation.y = rot;
      const seat = new THREE.Mesh(chairSeatGeo, chairMat);
      seat.position.y = 0.46;
      chair.add(seat);
      const back = new THREE.Mesh(chairBackGeo, chairMat);
      back.position.set(0, 0.68, 0.19);
      chair.add(back);
      const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.44, 8);
      const cl1 = new THREE.Mesh(legGeo, legMat);
      cl1.position.set(-0.16, 0.22, -0.16);
      const cl2 = new THREE.Mesh(legGeo, legMat);
      cl2.position.set(0.16, 0.22, -0.16);
      const cl3 = new THREE.Mesh(legGeo, legMat);
      cl3.position.set(-0.16, 0.22, 0.16);
      const cl4 = new THREE.Mesh(legGeo, legMat);
      cl4.position.set(0.16, 0.22, 0.16);
      chair.add(cl1, cl2, cl3, cl4);
      architectureGroup.add(chair);
    });

    // 4. Kitchen Island, Induction Cooktop, Sink, and French Door Fridge
    const kitchenSuite = buildKitchenSuite(5.0, 0, 3.2, 0, {
      woodTone: 0x334155
    });
    architectureGroup.add(kitchenSuite.group);
    obstacleBoxes.push(kitchenSuite.collisionBox);
    obstacleMeshes.push(...kitchenSuite.meshes);

    // 5. Master Bed Suite in Bedroom (recessed platform, mattress, duvet, pillows, nightstands, lamps)
    const masterBed = buildMasterBedSuite(-4.2, 0, -4.6, 0, {
      upholstery: 0x475569, // Charcoal duvet matching reference
      woodTone: 0x1e293b,
      accent: 0xd97706
    });
    architectureGroup.add(masterBed.group);
    obstacleBoxes.push(masterBed.collisionBox);
    obstacleMeshes.push(...masterBed.meshes);

    // 6. Computer Workstation & Ergonomic Chair in Study Room
    const workstation = buildComputerWorkstation(4.2, 0, -5.6, 0, {
      woodTone: 0x423122,
      upholstery: 0x1e293b,
      metal: 0x334155
    });
    architectureGroup.add(workstation.group);
    obstacleBoxes.push(workstation.collisionBox);
    obstacleMeshes.push(...workstation.meshes);

    // 7. Terrace / Balcony Outdoor Lounge Suite & Planters
    const terrace = buildTerraceBalconySuite(-5.0, 0, 8.4, 0);
    architectureGroup.add(terrace.group);
    obstacleBoxes.push(terrace.collisionBox);
    obstacleMeshes.push(...terrace.meshes);

    // 8. Bathroom Shower Enclosure (Frosted Acrylic & Chrome)
    addSolidObstacle('Shower Glass Wall', 0.8, 0, -6.0, 1.4, 1.35, 1.3, 0x93c5fd, 0.3, 0.2);

    // 9. Windows, Doors & Flower Pots (Matching uploaded render)
    addArchitecturalWindow(7.4, 4.0, 4.4, false); // East wall kitchen window
    addArchitecturalWindow(7.4, -4.0, 3.8, false); // East wall study window
    addArchitecturalWindow(-2.2, 7.0, 2.4, true);  // Living room sliding glass terrace door

    // Ceramic Potted Plants / Flower Pots
    architectureGroup.add(buildPottedPlant(-1.8, 0, 4.8, 1.05)); // Next to sofa
    architectureGroup.add(buildPottedPlant(-5.6, 0, 1.2, 0.95)); // Living room corner
    architectureGroup.add(buildPottedPlant(2.8, 0, -0.6, 0.85)); // Dining nook
    architectureGroup.add(buildPottedPlant(6.4, 0, 5.2, 0.90)); // Kitchen counter plant

    // Oak Dining Credenza / Sideboard along living/dining partition
    addSolidObstacle('Oak Dining Sideboard', 2.8, 0, 1.8, 0.45, 0.85, 1.8, 0x4a3728);

  } else if (preset === 'office') {
    // =========================================================================
    // CORPORATE OFFICE DIGITAL TWIN (Matching High-End Architectural Render)
    // Desks with laptops and ergonomic chairs, reception suite, breakout lounge,
    // conference boardroom, whiteboards, partition screens, windows & flower pots
    // =========================================================================

    // Perimeter Cutaway Walls with Architectural Glass Window Walls
    addWall(0, -11, 32.4, 0.35); // North outer wall
    addWall(-16.2, 0, 0.35, 22.4); // West outer wall

    // South wall with center glass window array
    addWall(-10.5, 11, 11.4, 0.35);
    addArchitecturalWindow(0, 11, 9.6, true);
    addWall(10.5, 11, 11.4, 0.35);

    // East wall with full-length architectural window wall
    addWall(16.2, -7.5, 0.35, 7.0);
    addArchitecturalWindow(16.2, 1.0, 10.0, false);
    addWall(16.2, 9.5, 0.35, 3.0);

    // Wing partitions with open circulation doorways
    addWall(-4, 5.2, 0.25, 2.6);
    addWall(-4, -5.0, 0.25, 2.8);
    addWall(-4, -9.2, 0.25, 3.2);

    addWall(4, 5.2, 0.25, 2.6);
    addWall(4, -5.0, 0.25, 2.8);
    addWall(4, -9.2, 0.25, 3.2);

    // Lateral room dividers
    addWall(-10, 0, 12, 0.25);
    addWall(10, 0, 12, 0.25);

    // 1. Reception & Welcome Foyer
    const reception = buildReceptionDeskSuite(0, 0, 7.8, 0, { woodTone: 0xd4a373 });
    architectureGroup.add(reception.group);
    obstacleBoxes.push(reception.collisionBox);
    obstacleMeshes.push(...reception.meshes);

    // Flanking ceramic potted ficus plants at reception entrance
    architectureGroup.add(buildPottedPlant(-2.4, 0, 8.0, 1.15));
    architectureGroup.add(buildPottedPlant(2.4, 0, 8.0, 1.15));

    // 2. Breakout Waiting Lounge Suite
    const lounge = buildOfficeLoungeBreakout(0, 0, 3.0, 0, { woodTone: 0xd4a373 });
    architectureGroup.add(lounge.group);
    obstacleBoxes.push(lounge.collisionBox);
    obstacleMeshes.push(...lounge.meshes);

    architectureGroup.add(buildPottedPlant(-2.2, 0, 1.6, 0.9));
    architectureGroup.add(buildPottedPlant(2.2, 0, 1.6, 0.9));

    // 3. West Wing: Collaborative Workstation Bench Clusters (Total 8 Desks + Laptops + Chairs)
    const cluster1 = buildWorkstationBenchCluster(-9, 0, 3.2, 0, { woodTone: 0xd4a373 });
    architectureGroup.add(cluster1.group);
    obstacleBoxes.push(cluster1.collisionBox);
    obstacleMeshes.push(...cluster1.meshes);

    const cluster2 = buildWorkstationBenchCluster(-9, 0, -2.5, 0, { woodTone: 0xd4a373 });
    architectureGroup.add(cluster2.group);
    obstacleBoxes.push(cluster2.collisionBox);
    obstacleMeshes.push(...cluster2.meshes);

    // Mobile whiteboard on wheels in West Wing
    architectureGroup.add(buildWhiteboardStand(-5.2, 0, 0.5, Math.PI / 2));

    // Server Cluster Rack Bay & Technical storage
    addSolidObstacle('Server Cluster Rack Bay', -11, 0, -7.5, 4.2, 1.35, 1.8, 0x1e293b, 0.4, 0.6);
    addSolidObstacle('Office Storage Cabinet Bay', -14.8, 0, 0, 0.6, 1.3, 4.0, 0xd4a373);

    // Corner foliage
    architectureGroup.add(buildPottedPlant(-14.5, 0, 9.2, 1.1));
    architectureGroup.add(buildPottedPlant(-14.5, 0, -9.2, 1.1));

    // 4. East Wing: Turing Executive Boardroom Conference Cabin
    const conf = buildConferenceCabin(9, 0, -5.2, 6.4, 5.2, 0, { woodTone: 0xd4a373 });
    architectureGroup.add(conf.group);
    obstacleBoxes.push(conf.collisionBox);
    obstacleMeshes.push(...conf.meshes);

    // Mobile whiteboard in East Wing
    architectureGroup.add(buildWhiteboardStand(5.5, 0, -3.2, 0));

    // East Wing Collaborative Workstation Bench Cluster (4 Desks + Laptops + Chairs)
    const cluster3 = buildWorkstationBenchCluster(9, 0, 3.2, 0, { woodTone: 0xd4a373 });
    architectureGroup.add(cluster3.group);
    obstacleBoxes.push(cluster3.collisionBox);
    obstacleMeshes.push(...cluster3.meshes);

    // Corner foliage
    architectureGroup.add(buildPottedPlant(14.5, 0, 9.2, 1.1));
    architectureGroup.add(buildPottedPlant(14.5, 0, -9.2, 1.1));

    // 5. Silicon Refreshment Pantry & Espresso Bar
    addSolidObstacle('Silicon Espresso Bar & Pantry', 0, 0, -4.5, 3.8, 0.95, 1.1, 0x4a3728, 0.4, 0.1);
    architectureGroup.add(buildPottedPlant(2.4, 0, -4.5, 0.95));
    architectureGroup.add(buildPottedPlant(-2.4, 0, -4.5, 0.95));

  } else if (preset === 'custom_room' && customRoom) {
    // =========================================================================
    // CUSTOM ROOM TWIN - Reconstructed directly from user smartphone video
    // Wall color, floor finishes, obstacles & furniture suites derived from video
    // =========================================================================
    const W = customRoom.dimensions.width;
    const D = customRoom.dimensions.depth;
    const halfW = W / 2;
    const halfD = D / 2;

    const customWallMat = new THREE.MeshStandardMaterial({
      color: customRoom.palette.wallColor || 0xf8fafc,
      roughness: 0.88,
      metalness: 0.04
    });

    // 1. Exterior Perimeter Walls with 1.35m cutaway height
    addWall(0, -halfD, W, 0.28, defaultWallHeight, customWallMat); // North perimeter
    addWall(-halfW, 0, 0.28, D, defaultWallHeight, customWallMat); // West perimeter
    addWall(halfW, 0, 0.28, D, defaultWallHeight, customWallMat);  // East perimeter

    // South perimeter wall with main entrance doorway opening
    const doorOpening = 1.4;
    const sideWallLen = (W - doorOpening) / 2;
    addWall(-halfW + sideWallLen / 2, halfD, sideWallLen, 0.28, defaultWallHeight, customWallMat);
    addWall(halfW - sideWallLen / 2, halfD, sideWallLen, 0.28, defaultWallHeight, customWallMat);

    // 2. Interior Partition Walls & Doorways for Multi-Room Segmentation
    if (customRoom.zones && customRoom.zones.length > 1) {
      if (customRoom.roomType === 'office') {
        // Office layout partition walls
        // West spine wall with doorways into Reception & Workstations
        addWall(-0.6, -4.5, 0.2, 4.0, defaultWallHeight, customWallMat);
        addWall(-0.6, 4.5, 0.2, 4.0, defaultWallHeight, customWallMat);
        // East spine wall with doorways into Boardroom & Breakout
        addWall(0.6, -4.5, 0.2, 4.0, defaultWallHeight, customWallMat);
        addWall(0.6, 4.5, 0.2, 4.0, defaultWallHeight, customWallMat);
      } else {
        // Apartment / Multi-Room partition walls
        // Central North-South partition wall (x = 0.5) separating West from East wings
        addWall(0.5, -4.0, 0.22, 5.5, defaultWallHeight, customWallMat); // North segment (Bed/Study divider)
        addWall(0.5, 4.2, 0.22, 5.2, defaultWallHeight, customWallMat);  // South segment (Living/Kitchen divider)
        // Doorway at center x=0.5, z=[-0.8, 1.2] is left clear for transit!

        // West wing East-West partition wall (z = -0.5) separating Master Bed from Living Room
        // Leave 1.3m doorway open near corridor (x = -1.2)
        addWall(-4.2, -0.5, 5.0, 0.22, defaultWallHeight, customWallMat);

        // East wing East-West partition wall (z = 0.5) separating Study from Kitchen
        // Leave 1.3m doorway open near corridor (x = 1.2)
        addWall(4.2, 0.5, 5.0, 0.22, defaultWallHeight, customWallMat);

        // Terrace divider wall with doorway opening
        addWall(-5.0, 7.0, 3.5, 0.2, defaultWallHeight, customWallMat);
        addWall(-0.5, 7.0, 1.8, 0.2, defaultWallHeight, customWallMat);
      }
    }

    // Palette extracted from video
    const videoPalette = {
      woodTone: customRoom.palette.woodTone || 0x423122,
      upholstery: customRoom.palette.furnitureUpholstery || 0x334155,
      accent: customRoom.palette.accentColor || 0xd97706,
      screenGlow: customRoom.palette.techColor || 0x38bdf8
    };

    // 3. Synthesize Authentic Furniture Suites in EACH Recognized Room Zone
    if (customRoom.zones && customRoom.zones.length > 0) {
      customRoom.zones.forEach((zone) => {
        // Add realistic downlight in the center of each recognized room
        addDownlight(zone.center[0], 2.2, zone.center[2], 0xffedd5, 1.85, 7.0);

        if (zone.type === 'living') {
          const living = buildLivingRoomSuite(zone.center[0] - 0.4, 0, zone.center[2] - 0.4, 0, videoPalette);
          architectureGroup.add(living.group);
          obstacleBoxes.push(living.collisionBox);
          obstacleMeshes.push(...living.meshes);

          const tv = buildSmartTVMediaUnit(zone.center[0], 0, zone.bounds.maxZ - 0.5, Math.PI, videoPalette);
          architectureGroup.add(tv.group);
          obstacleBoxes.push(tv.collisionBox);
          obstacleMeshes.push(...tv.meshes);

          architectureGroup.add(buildPottedPlant(zone.bounds.minX + 0.6, 0, zone.bounds.maxZ - 0.6, 1.05));
        } else if (zone.type === 'kitchen') {
          const kitchen = buildKitchenSuite(zone.center[0], 0, zone.center[2], 0, videoPalette);
          architectureGroup.add(kitchen.group);
          obstacleBoxes.push(kitchen.collisionBox);
          obstacleMeshes.push(...kitchen.meshes);
        } else if (zone.type === 'bedroom') {
          const bed = buildMasterBedSuite(zone.center[0], 0, zone.center[2] - 0.6, 0, videoPalette);
          architectureGroup.add(bed.group);
          obstacleBoxes.push(bed.collisionBox);
          obstacleMeshes.push(...bed.meshes);

          addSolidObstacle('Wardrobe Storage', zone.bounds.minX + 0.6, 0, zone.center[2], 0.9, 2.1, 2.2, videoPalette.woodTone);
        } else if (zone.type === 'study') {
          const ws = buildComputerWorkstation(zone.center[0], 0, zone.center[2] - 0.6, 0, videoPalette);
          architectureGroup.add(ws.group);
          obstacleBoxes.push(ws.collisionBox);
          obstacleMeshes.push(...ws.meshes);

          architectureGroup.add(buildWhiteboardStand(zone.bounds.maxX - 0.8, 0, zone.bounds.minZ + 1.2, -Math.PI / 2));
          addSolidObstacle('Reference Bookshelf', zone.bounds.maxX - 0.5, 0, zone.center[2], 0.6, 1.8, 1.8, videoPalette.woodTone);
        } else if (zone.type === 'balcony') {
          const balcony = buildTerraceBalconySuite(zone.center[0], 0, zone.center[2], 0);
          architectureGroup.add(balcony.group);
          obstacleBoxes.push(balcony.collisionBox);
          obstacleMeshes.push(...balcony.meshes);
        } else if (zone.type === 'hallway') {
          // Entryway console & threshold
          addSolidObstacle('Entry Key Console', zone.bounds.maxX - 0.35, 0, zone.center[2], 0.45, 0.85, 0.95, videoPalette.woodTone);
        } else if (zone.type === 'office') {
          if (zone.id.includes('conference')) {
            const conf = buildConferenceCabin(zone.center[0], 0, zone.center[2], 6.0, 5.0, 0, videoPalette);
            architectureGroup.add(conf.group);
            obstacleBoxes.push(conf.collisionBox);
            obstacleMeshes.push(...conf.meshes);
          } else if (zone.id.includes('workstation')) {
            const wsBench = buildWorkstationBenchCluster(zone.center[0], 0, zone.center[2], 0, videoPalette);
            architectureGroup.add(wsBench.group);
            obstacleBoxes.push(wsBench.collisionBox);
            obstacleMeshes.push(...wsBench.meshes);
          } else if (zone.id.includes('reception')) {
            const rec = buildReceptionDeskSuite(zone.center[0], 0, zone.center[2], 0, videoPalette);
            architectureGroup.add(rec.group);
            obstacleBoxes.push(rec.collisionBox);
            obstacleMeshes.push(...rec.meshes);
          } else {
            const lounge = buildOfficeLoungeBreakout(zone.center[0], 0, zone.center[2], 0, videoPalette);
            architectureGroup.add(lounge.group);
            obstacleBoxes.push(lounge.collisionBox);
            obstacleMeshes.push(...lounge.meshes);
          }
        }
      });
    } else {
      // Fallback single room suite
      const bed = buildMasterBedSuite(0, 0, -halfD + 1.8, 0, videoPalette);
      architectureGroup.add(bed.group);
      obstacleBoxes.push(bed.collisionBox);
      obstacleMeshes.push(...bed.meshes);

      const ws = buildComputerWorkstation(halfW - 1.2, 0, 0, -Math.PI / 2, videoPalette);
      architectureGroup.add(ws.group);
      obstacleBoxes.push(ws.collisionBox);
      obstacleMeshes.push(...ws.meshes);
    }
    // Clean solid architectural mesh generation (floating point cloud noise eliminated)
  }

  // =========================================================================
  // UTILITY LAYER VISUALIZATION (Water, Electricity, Gas, AC, Daylight)
  // Matches the reference image's top-left Utilities switcher
  // =========================================================================
  if (utilityLayer !== 'none') {
    const utilityGroup = new THREE.Group();
    utilityGroup.name = 'active-utility-layer';

    if (utilityLayer === 'water') {
      // Blue plumbing line runs to bathroom and kitchen
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2 });
      const pipeGeo1 = new THREE.CylinderGeometry(0.04, 0.04, 8.5, 12);
      const pipe1 = new THREE.Mesh(pipeGeo1, pipeMat);
      pipe1.rotation.x = Math.PI / 2;
      pipe1.position.set(0.8, 0.08, -1.5);
      utilityGroup.add(pipe1);

      const pipeGeo2 = new THREE.CylinderGeometry(0.04, 0.04, 6.0, 12);
      const pipe2 = new THREE.Mesh(pipeGeo2, pipeMat);
      pipe2.rotation.z = Math.PI / 2;
      pipe2.position.set(3.5, 0.08, 3.2);
      utilityGroup.add(pipe2);
    } else if (utilityLayer === 'electricity') {
      // Amber electrical conduits & power outlets
      const conduitMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.6 });
      const conduitGeo = new THREE.CylinderGeometry(0.03, 0.03, 14.0, 8);
      const conduit = new THREE.Mesh(conduitGeo, conduitMat);
      conduit.rotation.z = Math.PI / 2;
      conduit.position.set(0, 0.12, 0);
      utilityGroup.add(conduit);
    } else if (utilityLayer === 'gas') {
      // Bright yellow/orange gas pipeline to kitchen
      const gasMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
      const gasGeo = new THREE.CylinderGeometry(0.04, 0.04, 5.0, 12);
      const gasPipe = new THREE.Mesh(gasGeo, gasMat);
      gasPipe.rotation.x = Math.PI / 2;
      gasPipe.position.set(5.5, 0.08, 1.0);
      utilityGroup.add(gasPipe);
    } else if (utilityLayer === 'ac') {
      // Cyan ventilation / HVAC ducts
      const ductMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.8 });
      const ductGeo = new THREE.BoxGeometry(0.3, 0.18, 10.0);
      const duct = new THREE.Mesh(ductGeo, ductMat);
      duct.position.set(-1.0, 1.32, 1.0);
      utilityGroup.add(duct);
    } else if (utilityLayer === 'daylight') {
      // Warm translucent daylight footprint through windows & balcony
      const sunFootprintMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
      });
      const sunFootprintGeo = new THREE.PlaneGeometry(6.0, 4.0);
      const sunFootprint = new THREE.Mesh(sunFootprintGeo, sunFootprintMat);
      sunFootprint.rotation.x = -Math.PI / 2;
      sunFootprint.position.set(-4.0, 0.012, 4.5);
      utilityGroup.add(sunFootprint);
    }

    architectureGroup.add(utilityGroup);
  }

  return {
    architectureGroup,
    poiGroup,
    pathGroup,
    zoneGroup,
    animatedElements,
    wallBoxes,
    obstacleBoxes,
    obstacleMeshes,
    wallMeshes,
    sunLight,
    ambientLight
  };
}

/**
 * Creates clean, architectural room callout badges directly matching the reference image:
 * E.g., `LIVING ROOM • 37%`, `BEDROOM • 37%`, `TERRACE • 29%`
 * Dark frosted glass pill label, thin leader line, illuminated target point on floor.
 */
export function createPOIMarkerMesh(
  poi: POI,
  onSelect?: (poi: POI) => void
): {
  mesh: THREE.Group;
  update: (delta: number, elapsed: number) => void;
} {
  const group = new THREE.Group();
  group.position.set(poi.position[0], 0.05, poi.position[2]);
  group.userData = { poi, isPOI: true, onClick: onSelect };

  // Determine badge color
  let badgeColor = 0x38bdf8; // Sky blue
  if (poi.category === 'safety') badgeColor = 0xf43f5e;
  if (poi.category === 'amenity') badgeColor = 0x34d399;
  if (poi.category === 'tech') badgeColor = 0xa855f7;
  if (poi.category === 'sop') badgeColor = 0xf59e0b; // Amber gold for SOP points

  // 1. Illuminated Ground Target Dot
  const targetDotGeo = new THREE.CircleGeometry(0.08, 24);
  const targetDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const targetDot = new THREE.Mesh(targetDotGeo, targetDotMat);
  targetDot.rotation.x = -Math.PI / 2;
  targetDot.position.y = 0.015;
  group.add(targetDot);

  // Outer subtle ring
  const ringGeo = new THREE.RingGeometry(0.12, 0.18, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: badgeColor, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.016;
  group.add(ring);

  // 2. Dotted / Thin Vertical Leader Stem (matching the reference image callout lines)
  const stemHeight = 1.1;
  const stemGeo = new THREE.CylinderGeometry(0.008, 0.008, stemHeight, 8);
  const stemMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.65
  });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = stemHeight / 2;
  group.add(stem);

  // 3. Pin Anchor Sphere
  const headGeo = new THREE.SphereGeometry(0.04, 16, 16);
  const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = stemHeight;
  group.add(head);

  // 4. Clean Architectural Frosted Badge (e.g., "LIVING ROOM • 37%")
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 130;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Dark frosted translucent background pill matching the image
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = 'rgba(22, 26, 41, 0.88)'; // Dark slate match
    ctx.roundRect(14, 14, 484, 102, 18);
    ctx.fill();

    // Subtle crisp border outline
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.stroke();

    // Weather / status icon (snowflake / sun / SOP icon)
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px Inter, sans-serif';
    const statusIcon = poi.category === 'sop' ? '📋' : poi.category === 'safety' ? '🧯' : poi.category === 'tech' ? '💻' : '❄️';
    ctx.fillText(statusIcon, 36, 72);

    // Title text: uppercase clean modern sans-serif
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const displayName = poi.name.toUpperCase();
    ctx.fillText(displayName, 76, 52, 280);

    // Sub-text: Percentage or room type badge (e.g. "SOP • CHECKPOINT" or "37% OPTIMAL")
    ctx.fillStyle = poi.category === 'sop' ? '#fbbf24' : 'rgba(255, 255, 255, 0.7)';
    ctx.font = '500 22px "JetBrains Mono", monospace';
    const subLabel = poi.category === 'sop' ? 'SOP • CHECKPOINT' : poi.category === 'room' ? '37% OPTIMAL' : `${poi.category.toUpperCase()}`;
    ctx.fillText(subLabel, 76, 88, 380);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.6, 0.42, 1);
  sprite.position.y = stemHeight + 0.28;
  sprite.userData = { poi, isPOI: true };
  group.add(sprite);

  const update = (_delta: number, elapsed: number) => {
    // Gentle breathing
    const bob = Math.sin(elapsed * 1.8 + poi.position[0]) * 0.03;
    sprite.position.y = stemHeight + 0.28 + bob;
    head.position.y = stemHeight + bob;
  };

  return { mesh: group, update };
}

/**
 * Creates straight, clean Google Maps-style Walking Route on the floor.
 */
export function createNavigationPathMesh(coordinates: [number, number, number][]): {
  group: THREE.Group;
  update: (delta: number, elapsed: number) => void;
} {
  const group = new THREE.Group();
  if (coordinates.length < 2) return { group, update: () => {} };

  const pathPoints = coordinates.map((c) => new THREE.Vector3(c[0], 0.02, c[2]));

  // Build continuous clean flat ribbon along waypoints
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];
    const segDir = new THREE.Vector3().subVectors(p2, p1);
    const segLength = segDir.length();

    if (segLength < 0.05) continue;

    const ribbonWidth = 0.22;
    const ribbonGeo = new THREE.PlaneGeometry(ribbonWidth, segLength);
    const ribbonMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Sky blue illuminated path
      side: THREE.DoubleSide
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);

    const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    ribbonMesh.position.set(midPoint.x, 0.02, midPoint.z);

    ribbonMesh.rotation.x = -Math.PI / 2;
    const angle = Math.atan2(segDir.x, segDir.z);
    ribbonMesh.rotation.z = -angle;

    group.add(ribbonMesh);

    const jointGeo = new THREE.CircleGeometry(ribbonWidth / 2, 24);
    const jointMesh = new THREE.Mesh(jointGeo, ribbonMat);
    jointMesh.rotation.x = -Math.PI / 2;
    jointMesh.position.set(p1.x, 0.021, p1.z);
    group.add(jointMesh);
  }

  const endP = pathPoints[pathPoints.length - 1];
  const endJointGeo = new THREE.CircleGeometry(0.11, 24);
  const endJointMesh = new THREE.Mesh(
    endJointGeo,
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  endJointMesh.rotation.x = -Math.PI / 2;
  endJointMesh.position.set(endP.x, 0.021, endP.z);
  group.add(endJointMesh);

  // Walking Dots
  const dotCount = Math.max(6, Math.floor(coordinates.length * 5));
  const dotGeo = new THREE.CircleGeometry(0.045, 16);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const dots: THREE.Mesh[] = [];

  let totalLen = 0;
  const segLengths: number[] = [];
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const l = pathPoints[i].distanceTo(pathPoints[i + 1]);
    segLengths.push(l);
    totalLen += l;
  }

  for (let i = 0; i < dotCount; i++) {
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.rotation.x = -Math.PI / 2;
    dot.position.y = 0.025;
    group.add(dot);
    dots.push(dot);
  }

  function getPointAlongPath(progress: number): THREE.Vector3 {
    let targetDist = progress * totalLen;
    for (let i = 0; i < segLengths.length; i++) {
      if (targetDist <= segLengths[i]) {
        const ratio = targetDist / (segLengths[i] || 1);
        return new THREE.Vector3().lerpVectors(pathPoints[i], pathPoints[i + 1], ratio);
      }
      targetDist -= segLengths[i];
    }
    return pathPoints[pathPoints.length - 1].clone();
  }

  // Destination Ring
  const destRingGeo = new THREE.RingGeometry(0.2, 0.45, 32);
  const destRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide
  });
  const destRing = new THREE.Mesh(destRingGeo, destRingMat);
  destRing.rotation.x = -Math.PI / 2;
  destRing.position.set(endP.x, 0.026, endP.z);
  group.add(destRing);

  const update = (_delta: number, elapsed: number) => {
    dots.forEach((dot, index) => {
      const offset = (elapsed * 0.12 + index / dotCount) % 1;
      const pt = getPointAlongPath(offset);
      dot.position.set(pt.x, 0.025, pt.z);
    });
  };

  return { group, update };
}
