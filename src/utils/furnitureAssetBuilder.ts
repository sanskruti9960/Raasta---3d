import * as THREE from 'three';

export interface FurniturePalette {
  wallColor?: number;
  floorColor?: number;
  woodTone?: number;
  upholstery?: number;
  accent?: number;
  metal?: number;
  screenGlow?: number;
}

/**
 * Creates canvas texture for realistic illuminated computer or TV screens
 */
function createScreenTexture(type: 'code' | 'tv' | 'dashboard'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (type === 'code') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 288);
      // Code lines
      const colors = ['#38bdf8', '#a855f7', '#4ade80', '#fbbf24', '#f43f5e', '#94a3b8'];
      for (let y = 24; y < 270; y += 14) {
        let x = 24;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        const indent = (Math.floor(y / 40) % 3) * 24;
        x += indent;
        const lineLen = 60 + Math.random() * 260;
        ctx.fillRect(x, y, lineLen, 8);
      }
    } else if (type === 'tv') {
      // Cinematic warm architectural artwork display
      const grad = ctx.createLinearGradient(0, 0, 512, 288);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.5, '#475569');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 288);

      // Warm sunset glow in center
      const sunGrad = ctx.createRadialGradient(256, 160, 20, 256, 160, 180);
      sunGrad.addColorStop(0, 'rgba(251, 146, 60, 0.7)');
      sunGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.3)');
      sunGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, 512, 288);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 20px Inter, sans-serif';
      ctx.fillText('4K ULTRA HD • RAASTA-3D', 30, 42);
    } else {
      // Modern smart home / facility dashboard
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 512, 288);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 20, 220, 110);
      ctx.fillRect(260, 20, 230, 110);
      ctx.fillRect(20, 150, 470, 115);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText('24.5°C • 48% RH', 40, 75);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

/**
 * 1. Computer & Workstation:
 * Modern desk, dual/ultrawide monitor with glowing screen, keyboard, mouse, CPU tower,
 * and ergonomic 5-star swivel mesh chair.
 */
export function buildComputerWorkstation(
  x: number,
  y: number,
  z: number,
  rotationY = 0,
  palette: FurniturePalette = {}
): { group: THREE.Group; collisionBox: THREE.Box3; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  const meshes: THREE.Mesh[] = [];

  const woodColor = palette.woodTone || 0x423122; // Walnut / Oak
  const metalColor = palette.metal || 0x1e293b;

  const deskTopMat = new THREE.MeshStandardMaterial({
    color: woodColor,
    roughness: 0.35,
    metalness: 0.05
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: metalColor,
    roughness: 0.4,
    metalness: 0.8
  });

  // Desk top (1.7m wide, 0.8m deep, 0.05m thick, 0.74m high)
  const topGeo = new THREE.BoxGeometry(1.7, 0.05, 0.8);
  const deskTop = new THREE.Mesh(topGeo, deskTopMat);
  deskTop.position.set(0, 0.73, 0);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  deskTop.userData = { name: 'Workstation Desk', isObstacle: true };
  group.add(deskTop);
  meshes.push(deskTop);

  // Sturdy steel legs frame
  const legGeo = new THREE.BoxGeometry(0.06, 0.72, 0.72);
  const legL = new THREE.Mesh(legGeo, metalMat);
  legL.position.set(-0.76, 0.36, 0);
  legL.castShadow = true;
  group.add(legL);

  const legR = new THREE.Mesh(legGeo, metalMat);
  legR.position.set(0.76, 0.36, 0);
  legR.castShadow = true;
  group.add(legR);

  // Monitor Stand
  const standBaseGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 24);
  const standBase = new THREE.Mesh(standBaseGeo, metalMat);
  standBase.position.set(0, 0.76, -0.18);
  group.add(standBase);

  const standArmGeo = new THREE.BoxGeometry(0.04, 0.32, 0.04);
  const standArm = new THREE.Mesh(standArmGeo, metalMat);
  standArm.position.set(0, 0.92, -0.2);
  group.add(standArm);

  // 34" Curved Ultrawide Display with Glowing Screen
  const screenMat = new THREE.MeshBasicMaterial({ map: createScreenTexture('code') });
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });

  const bezelGeo = new THREE.BoxGeometry(1.1, 0.45, 0.04);
  const bezel = new THREE.Mesh(bezelGeo, bezelMat);
  bezel.position.set(0, 1.05, -0.18);
  bezel.castShadow = true;
  group.add(bezel);

  const displayGeo = new THREE.PlaneGeometry(1.04, 0.41);
  const display = new THREE.Mesh(displayGeo, screenMat);
  display.position.set(0, 1.05, -0.158);
  group.add(display);

  // Keyboard & Mouse
  const kbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const kbGeo = new THREE.BoxGeometry(0.44, 0.015, 0.14);
  const kb = new THREE.Mesh(kbGeo, kbMat);
  kb.position.set(-0.06, 0.76, 0.14);
  group.add(kb);

  const mouseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
  const mouseGeo = new THREE.BoxGeometry(0.07, 0.02, 0.11);
  const mouse = new THREE.Mesh(mouseGeo, mouseMat);
  mouse.position.set(0.28, 0.76, 0.14);
  group.add(mouse);

  // Ergonomic Mesh Swivel Chair
  const chairGroup = new THREE.Group();
  chairGroup.position.set(0, 0, 0.58);

  const chairMeshMat = new THREE.MeshStandardMaterial({
    color: palette.upholstery || 0x1e293b,
    roughness: 0.75
  });

  // Seat cushion
  const seatGeo = new THREE.BoxGeometry(0.52, 0.08, 0.48);
  const seat = new THREE.Mesh(seatGeo, chairMeshMat);
  seat.position.set(0, 0.46, 0);
  seat.castShadow = true;
  chairGroup.add(seat);

  // Contoured backrest
  const backGeo = new THREE.BoxGeometry(0.48, 0.54, 0.05);
  const back = new THREE.Mesh(backGeo, chairMeshMat);
  back.position.set(0, 0.75, 0.22);
  back.rotation.x = -0.08;
  back.castShadow = true;
  chairGroup.add(back);

  // Center cylinder column & base
  const colGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.38, 16);
  const col = new THREE.Mesh(colGeo, metalMat);
  col.position.set(0, 0.22, 0);
  chairGroup.add(col);

  // 5-star spider base
  const spiderGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.04, 5);
  const spider = new THREE.Mesh(spiderGeo, metalMat);
  spider.position.set(0, 0.04, 0);
  chairGroup.add(spider);

  group.add(chairGroup);

  // Accurate Box3 for collision
  const collisionBox = new THREE.Box3(
    new THREE.Vector3(x - 0.95, y, z - 0.55),
    new THREE.Vector3(x + 0.95, y + 1.8, z + 0.95)
  );

  return { group, collisionBox, meshes };
}

/**
 * 2. 75-Inch Smart TV & Sleek Floating Media Unit
 */
export function buildSmartTVMediaUnit(
  x: number,
  y: number,
  z: number,
  rotationY = 0,
  palette: FurniturePalette = {}
): { group: THREE.Group; collisionBox: THREE.Box3; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  const meshes: THREE.Mesh[] = [];

  const consoleColor = palette.woodTone || 0x1e293b;
  const consoleMat = new THREE.MeshStandardMaterial({
    color: consoleColor,
    roughness: 0.4,
    metalness: 0.1
  });

  // Low media console cabinet (2.4m wide, 0.45m deep, 0.48m high)
  const cabGeo = new THREE.BoxGeometry(2.4, 0.46, 0.45);
  const consoleMesh = new THREE.Mesh(cabGeo, consoleMat);
  consoleMesh.position.set(0, 0.24, 0);
  consoleMesh.castShadow = true;
  consoleMesh.receiveShadow = true;
  consoleMesh.userData = { name: 'OLED TV Media Console', isObstacle: true };
  group.add(consoleMesh);
  meshes.push(consoleMesh);

  // Soundbar
  const soundbarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const soundbarGeo = new THREE.BoxGeometry(1.2, 0.06, 0.09);
  const soundbar = new THREE.Mesh(soundbarGeo, soundbarMat);
  soundbar.position.set(0, 0.5, 0.08);
  group.add(soundbar);

  // 75-Inch OLED Smart TV with Illuminated Screen
  const tvFrameGeo = new THREE.BoxGeometry(2.0, 1.15, 0.05);
  const tvFrameMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2, metalness: 0.8 });
  const tvFrame = new THREE.Mesh(tvFrameGeo, tvFrameMat);
  tvFrame.position.set(0, 1.25, -0.02);
  tvFrame.castShadow = true;
  group.add(tvFrame);

  const tvScreenGeo = new THREE.PlaneGeometry(1.94, 1.09);
  const tvScreenMat = new THREE.MeshBasicMaterial({ map: createScreenTexture('tv') });
  const tvScreen = new THREE.Mesh(tvScreenGeo, tvScreenMat);
  tvScreen.position.set(0, 1.25, 0.008);
  group.add(tvScreen);

  // Decorative modern vase
  const vaseGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.28, 16);
  const vaseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15 });
  const vase = new THREE.Mesh(vaseGeo, vaseMat);
  vase.position.set(0.95, 0.61, 0);
  group.add(vase);

  const collisionBox = new THREE.Box3(
    new THREE.Vector3(x - 1.25, y, z - 0.3),
    new THREE.Vector3(x + 1.25, y + 2.0, z + 0.35)
  );

  return { group, collisionBox, meshes };
}

/**
 * 3. Plush Sectional Sofa & Walnut Coffee Table & Rug
 * Exactly styled after the cream/slate L-shaped sofa in the reference image.
 */
export function buildLivingRoomSuite(
  x: number,
  y: number,
  z: number,
  rotationY = 0,
  palette: FurniturePalette = {}
): { group: THREE.Group; collisionBox: THREE.Box3; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  const meshes: THREE.Mesh[] = [];

  const fabricColor = palette.upholstery || 0xf1f5f9; // Warm off-white/cream
  const darkRugColor = 0x1e2230; // Deep charcoal area rug matching image
  const coffeeTableWood = palette.woodTone || 0x3d2b1f;

  const fabricMat = new THREE.MeshStandardMaterial({
    color: fabricColor,
    roughness: 0.85,
    metalness: 0.02
  });
  const accentPillowMat = new THREE.MeshStandardMaterial({
    color: palette.accent || 0xd97706, // Warm terracotta / ochre
    roughness: 0.8
  });

  // Designer Area Rug
  const rugGeo = new THREE.PlaneGeometry(3.6, 3.2);
  const rugMat = new THREE.MeshStandardMaterial({ color: darkRugColor, roughness: 0.95 });
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0.4, 0.006, 0.3);
  rug.receiveShadow = true;
  group.add(rug);

  // Main Sectional Sofa Base
  const mainSeatGeo = new THREE.BoxGeometry(2.6, 0.42, 1.0);
  const mainSeat = new THREE.Mesh(mainSeatGeo, fabricMat);
  mainSeat.position.set(0, 0.21, 0);
  mainSeat.castShadow = true;
  mainSeat.receiveShadow = true;
  mainSeat.userData = { name: 'Plush Sectional Sofa', isObstacle: true };
  group.add(mainSeat);
  meshes.push(mainSeat);

  // Backrest
  const backGeo = new THREE.BoxGeometry(2.6, 0.44, 0.26);
  const back = new THREE.Mesh(backGeo, fabricMat);
  back.position.set(0, 0.54, -0.37);
  back.castShadow = true;
  group.add(back);

  // L-Extension (Chaise Lounge on left)
  const chaiseGeo = new THREE.BoxGeometry(1.0, 0.42, 1.6);
  const chaise = new THREE.Mesh(chaiseGeo, fabricMat);
  chaise.position.set(-0.8, 0.21, 1.1);
  chaise.castShadow = true;
  chaise.receiveShadow = true;
  group.add(chaise);

  // Throw pillows
  const pillowGeo = new THREE.BoxGeometry(0.38, 0.36, 0.16);
  const p1 = new THREE.Mesh(pillowGeo, accentPillowMat);
  p1.position.set(-0.7, 0.46, -0.2);
  p1.rotation.y = 0.2;
  group.add(p1);

  const p2 = new THREE.Mesh(pillowGeo, fabricMat);
  p2.position.set(0.8, 0.46, -0.2);
  p2.rotation.y = -0.15;
  group.add(p2);

  // Low Modern Walnut Coffee Table
  const tableMat = new THREE.MeshStandardMaterial({ color: coffeeTableWood, roughness: 0.4, metalness: 0.1 });
  const tableTopGeo = new THREE.BoxGeometry(1.2, 0.06, 0.7);
  const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
  tableTop.position.set(0.35, 0.34, 0.7);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  tableTop.userData = { name: 'Coffee Table', isObstacle: true };
  group.add(tableTop);
  meshes.push(tableTop);

  // Thin metal table legs
  const tLegGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.31, 12);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.7 });
  const legPositions = [
    [0.35 - 0.5, 0.16, 0.7 - 0.28],
    [0.35 + 0.5, 0.16, 0.7 - 0.28],
    [0.35 - 0.5, 0.16, 0.7 + 0.28],
    [0.35 + 0.5, 0.16, 0.7 + 0.28]
  ];
  legPositions.forEach(([lx, ly, lz]) => {
    const tl = new THREE.Mesh(tLegGeo, legMat);
    tl.position.set(lx, ly, lz);
    group.add(tl);
  });

  const collisionBox = new THREE.Box3(
    new THREE.Vector3(x - 1.4, y, z - 0.6),
    new THREE.Vector3(x + 1.4, y + 1.6, z + 2.0)
  );

  return { group, collisionBox, meshes };
}

/**
 * 4. Master Bedroom Suite:
 * King/Queen platform bed, mattress, thick folded duvet blanket, dual pillows,
 * upholstered headboard, and dual nightstands with warm glowing sphere lamps.
 */
export function buildMasterBedSuite(
  x: number,
  y: number,
  z: number,
  rotationY = 0,
  palette: FurniturePalette = {}
): { group: THREE.Group; collisionBox: THREE.Box3; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  const meshes: THREE.Mesh[] = [];

  const woodColor = palette.woodTone || 0x2e1f14;
  const duvetColor = palette.upholstery || 0xf8fafc; // crisp white/linen duvet
  const headboardColor = palette.accent || 0x334155; // elegant slate

  const frameMat = new THREE.MeshStandardMaterial({ color: woodColor, roughness: 0.6 });
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
  const duvetMat = new THREE.MeshStandardMaterial({ color: duvetColor, roughness: 0.9 });
  const headboardMat = new THREE.MeshStandardMaterial({ color: headboardColor, roughness: 0.85 });

  // 1. Bed Frame Plinth (2.2m wide, 2.3m long, 0.28m high)
  const frameGeo = new THREE.BoxGeometry(2.1, 0.28, 2.3);
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 0.14, 0);
  frame.castShadow = true;
  frame.userData = { name: 'Master Bed Platform', isObstacle: true };
  group.add(frame);
  meshes.push(frame);

  // 2. Thick Mattress
  const mattressGeo = new THREE.BoxGeometry(1.95, 0.3, 2.15);
  const mattress = new THREE.Mesh(mattressGeo, mattressMat);
  mattress.position.set(0, 0.38, 0.05);
  mattress.castShadow = true;
  group.add(mattress);

  // 3. Folded Quilt / Duvet Blanket
  const duvetGeo = new THREE.BoxGeometry(1.98, 0.12, 1.45);
  const duvet = new THREE.Mesh(duvetGeo, duvetMat);
  duvet.position.set(0, 0.48, 0.4);
  duvet.castShadow = true;
  group.add(duvet);

  // 4. Headboard
  const headboardGeo = new THREE.BoxGeometry(2.2, 1.25, 0.16);
  const headboard = new THREE.Mesh(headboardGeo, headboardMat);
  headboard.position.set(0, 0.68, -1.1);
  headboard.castShadow = true;
  group.add(headboard);

  // 5. Dual Sleeping Pillows
  const pillowGeo = new THREE.BoxGeometry(0.75, 0.14, 0.44);
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
  const pilL = new THREE.Mesh(pillowGeo, pillowMat);
  pilL.position.set(-0.52, 0.52, -0.68);
  pilL.rotation.x = 0.15;
  group.add(pilL);

  const pilR = new THREE.Mesh(pillowGeo, pillowMat);
  pilR.position.set(0.52, 0.52, -0.68);
  pilR.rotation.x = 0.15;
  group.add(pilR);

  // 6. Dual Nightstands with Warm Table Lamps
  const nightstandGeo = new THREE.BoxGeometry(0.52, 0.48, 0.48);
  const lampBaseGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.22, 16);
  const lampShadeGeo = new THREE.ConeGeometry(0.14, 0.2, 16);
  const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });

  [-1.4, 1.4].forEach((sideX) => {
    const ns = new THREE.Mesh(nightstandGeo, frameMat);
    ns.position.set(sideX, 0.24, -1.0);
    ns.castShadow = true;
    group.add(ns);

    const base = new THREE.Mesh(lampBaseGeo, frameMat);
    base.position.set(sideX, 0.58, -1.0);
    group.add(base);

    const shade = new THREE.Mesh(lampShadeGeo, lampGlowMat);
    shade.position.set(sideX, 0.74, -1.0);
    group.add(shade);

    // Warm ambient point light from lamp
    const lampLight = new THREE.PointLight(0xffb066, 0.8, 4.0);
    lampLight.position.set(sideX, 0.8, -1.0);
    group.add(lampLight);
  });

  const collisionBox = new THREE.Box3(
    new THREE.Vector3(x - 1.7, y, z - 1.3),
    new THREE.Vector3(x + 1.7, y + 1.8, z + 1.3)
  );

  return { group, collisionBox, meshes };
}

/**
 * 5. Modern Kitchen Suite:
 * White/wood cabinetry, quartz island, induction range, smart refrigerator, sink & faucet.
 */
export function buildKitchenSuite(
  x: number,
  y: number,
  z: number,
  rotationY = 0,
  palette: FurniturePalette = {}
): { group: THREE.Group; collisionBox: THREE.Box3; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  const meshes: THREE.Mesh[] = [];

  const lowerCabColor = palette.woodTone || 0x334155; // Modern graphite / wood
  const quartzColor = 0xf8fafc;
  const upperCabColor = 0xffffff;

  const lowerMat = new THREE.MeshStandardMaterial({ color: lowerCabColor, roughness: 0.45 });
  const quartzMat = new THREE.MeshStandardMaterial({ color: quartzColor, roughness: 0.2, metalness: 0.05 });
  const upperMat = new THREE.MeshStandardMaterial({ color: upperCabColor, roughness: 0.3 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.8 });

  // Wall Counter Base (3.2m long, 0.75m deep, 0.88m high)
  const counterBaseGeo = new THREE.BoxGeometry(3.2, 0.88, 0.75);
  const counterBase = new THREE.Mesh(counterBaseGeo, lowerMat);
  counterBase.position.set(0, 0.44, 0);
  counterBase.castShadow = true;
  counterBase.userData = { name: 'Kitchen Counter', isObstacle: true };
  group.add(counterBase);
  meshes.push(counterBase);

  // Upper Wall Cabinets (matching reference image crisp white upper units)
  const upperCabGeo = new THREE.BoxGeometry(2.3, 0.38, 0.36);
  const upperCab = new THREE.Mesh(upperCabGeo, upperMat);
  upperCab.position.set(-0.4, 1.28, -0.18);
  upperCab.castShadow = true;
  group.add(upperCab);

  // Quartz Countertop
  const topGeo = new THREE.BoxGeometry(3.24, 0.06, 0.78);
  const top = new THREE.Mesh(topGeo, quartzMat);
  top.position.set(0, 0.91, 0);
  top.castShadow = true;
  group.add(top);

  // Black Glass Induction Cooktop
  const cooktopGeo = new THREE.BoxGeometry(0.8, 0.01, 0.52);
  const cooktopMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 });
  const cooktop = new THREE.Mesh(cooktopGeo, cooktopMat);
  cooktop.position.set(-0.6, 0.945, 0);
  group.add(cooktop);

  // Stainless Undermount Sink & Faucet
  const sinkGeo = new THREE.BoxGeometry(0.65, 0.015, 0.45);
  const sink = new THREE.Mesh(sinkGeo, steelMat);
  sink.position.set(0.6, 0.945, 0);
  group.add(sink);

  // French-Door Refrigerator
  const fridgeGeo = new THREE.BoxGeometry(0.92, 1.95, 0.82);
  const fridge = new THREE.Mesh(fridgeGeo, steelMat);
  fridge.position.set(1.9, 0.98, 0);
  fridge.castShadow = true;
  fridge.userData = { name: 'French Door Refrigerator', isObstacle: true };
  group.add(fridge);
  meshes.push(fridge);

  // Kitchen Island Breakfast Bar
  const islandBaseGeo = new THREE.BoxGeometry(1.9, 0.9, 1.1);
  const island = new THREE.Mesh(islandBaseGeo, lowerMat);
  island.position.set(0, 0.45, 1.8);
  island.castShadow = true;
  island.userData = { name: 'Breakfast Island Bar', isObstacle: true };
  group.add(island);
  meshes.push(island);

  const islandTopGeo = new THREE.BoxGeometry(2.0, 0.06, 1.25);
  const islandTop = new THREE.Mesh(islandTopGeo, quartzMat);
  islandTop.position.set(0, 0.93, 1.8);
  islandTop.castShadow = true;
  group.add(islandTop);

  const collisionBox = new THREE.Box3(
    new THREE.Vector3(x - 1.8, y, z - 0.5),
    new THREE.Vector3(x + 2.5, y + 2.0, z + 2.5)
  );

  return { group, collisionBox, meshes };
}

/**
 * 6. Terrace & Garden Balcony:
 * Modern lounge deck chairs with white cushions, circular drinks table, and planter foliage.
 */
export function buildTerraceBalconySuite(
  x: number,
  y: number,
  z: number,
  rotationY = 0
): { group: THREE.Group; collisionBox: THREE.Box3; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  const meshes: THREE.Mesh[] = [];

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x524032, roughness: 0.7 });
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
  const greenPlantMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85 });

  // Pair of Outdoor Lounge Chairs
  [-0.9, 0.9].forEach((cx) => {
    const frameGeo = new THREE.BoxGeometry(0.7, 0.28, 1.5);
    const frame = new THREE.Mesh(frameGeo, woodMat);
    frame.position.set(cx, 0.14, 0);
    frame.castShadow = true;
    group.add(frame);
    meshes.push(frame);

    const cushionGeo = new THREE.BoxGeometry(0.64, 0.12, 1.44);
    const cushion = new THREE.Mesh(cushionGeo, cushionMat);
    cushion.position.set(cx, 0.32, 0);
    cushion.castShadow = true;
    group.add(cushion);
  });

  // Circular Drinks Table
  const tableTopGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.04, 24);
  const table = new THREE.Mesh(tableTopGeo, cushionMat);
  table.position.set(0, 0.42, 0);
  table.castShadow = true;
  group.add(table);

  const tableStemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 16);
  const stem = new THREE.Mesh(tableStemGeo, woodMat);
  stem.position.set(0, 0.2, 0);
  group.add(stem);

  // Planter Box with Lush Foliage
  const planterGeo = new THREE.BoxGeometry(1.6, 0.35, 0.35);
  const planter = new THREE.Mesh(planterGeo, woodMat);
  planter.position.set(0, 0.18, 1.1);
  group.add(planter);

  const plantGeo = new THREE.BoxGeometry(1.5, 0.35, 0.28);
  const plant = new THREE.Mesh(plantGeo, greenPlantMat);
  plant.position.set(0, 0.45, 1.1);
  group.add(plant);

  const collisionBox = new THREE.Box3(
    new THREE.Vector3(x - 1.4, y, z - 0.8),
    new THREE.Vector3(x + 1.4, y + 1.2, z + 1.4)
  );

  return { group, collisionBox, meshes };
}

/**
 * 7. Ultra-Slim Laptop:
 * High-detail aluminum unibody laptop with open display, illuminated keyboard, and trackpad.
 */
export function buildUltraSlimLaptop(
  x: number,
  y: number,
  z: number,
  rotationY = 0,
  palette: FurniturePalette = {}
): THREE.Group {
  const laptop = new THREE.Group();
  laptop.position.set(x, y, z);
  laptop.rotation.y = rotationY;

  const casingMat = new THREE.MeshStandardMaterial({
    color: palette.metal || 0xcbd5e1, // Silver anodized aluminum
    roughness: 0.3,
    metalness: 0.8
  });
  const screenMat = new THREE.MeshBasicMaterial({
    map: createScreenTexture('code')
  });
  const keyboardMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.6
  });

  // Base chassis
  const baseGeo = new THREE.BoxGeometry(0.36, 0.012, 0.24);
  const base = new THREE.Mesh(baseGeo, casingMat);
  base.position.y = 0.006;
  base.castShadow = true;
  laptop.add(base);

  // Keyboard recess & keys
  const kbGeo = new THREE.BoxGeometry(0.30, 0.003, 0.12);
  const kb = new THREE.Mesh(kbGeo, keyboardMat);
  kb.position.set(0, 0.013, -0.02);
  laptop.add(kb);

  // Trackpad
  const tpGeo = new THREE.BoxGeometry(0.12, 0.002, 0.07);
  const tpMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.6 });
  const tp = new THREE.Mesh(tpGeo, tpMat);
  tp.position.set(0, 0.013, 0.075);
  laptop.add(tp);

  // Screen Lid (Angled back at 115 degrees)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.012, -0.12);
  lidGroup.rotation.x = -0.45; // ~115 degrees open

  const lidGeo = new THREE.BoxGeometry(0.36, 0.23, 0.008);
  const lid = new THREE.Mesh(lidGeo, casingMat);
  lid.position.set(0, 0.115, 0);
  lid.castShadow = true;
  lidGroup.add(lid);

  // Display Panel
  const displayGeo = new THREE.PlaneGeometry(0.34, 0.21);
  const display = new THREE.Mesh(displayGeo, screenMat);
  display.position.set(0, 0.115, 0.005);
  lidGroup.add(display);

  laptop.add(lidGroup);
  return laptop;
}

/**
 * 8. Ergonomic Office Task Chair:
 * Mesh contoured backrest, padded seat cushion, dual armrests, gas cylinder, 5-star spider base.
 */
export function buildErgonomicTaskChair(
  x: number,
  y: number,
  z: number,
  rotationY = 0,
  palette: FurniturePalette = {}
): THREE.Group {
  const chair = new THREE.Group();
  chair.position.set(x, y, z);
  chair.rotation.y = rotationY;

  const upholsteryColor = palette.upholstery || 0x1e293b;
  const seatMat = new THREE.MeshStandardMaterial({
    color: upholsteryColor,
    roughness: 0.75
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.35,
    metalness: 0.7
  });

  // Seat cushion
  const seatGeo = new THREE.BoxGeometry(0.48, 0.07, 0.46);
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(0, 0.46, 0);
  seat.castShadow = true;
  chair.add(seat);

  // Contoured Mesh Backrest
  const backGeo = new THREE.BoxGeometry(0.44, 0.52, 0.04);
  const back = new THREE.Mesh(backGeo, seatMat);
  back.position.set(0, 0.74, 0.22);
  back.rotation.x = -0.06;
  back.castShadow = true;
  chair.add(back);

  // Headrest
  const headrestGeo = new THREE.BoxGeometry(0.24, 0.12, 0.04);
  const headrest = new THREE.Mesh(headrestGeo, seatMat);
  headrest.position.set(0, 1.05, 0.25);
  chair.add(headrest);

  // Dual Armrests
  [-0.26, 0.26].forEach((sideX) => {
    const postGeo = new THREE.BoxGeometry(0.03, 0.24, 0.04);
    const post = new THREE.Mesh(postGeo, metalMat);
    post.position.set(sideX, 0.54, 0.02);
    chair.add(post);

    const padGeo = new THREE.BoxGeometry(0.07, 0.025, 0.24);
    const pad = new THREE.Mesh(padGeo, seatMat);
    pad.position.set(sideX, 0.67, 0.02);
    chair.add(pad);
  });

  // Center column
  const colGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.38, 16);
  const col = new THREE.Mesh(colGeo, metalMat);
  col.position.set(0, 0.22, 0);
  chair.add(col);

  // 5-star spider base
  const spiderGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.035, 5);
  const spider = new THREE.Mesh(spiderGeo, metalMat);
  spider.position.set(0, 0.04, 0);
  chair.add(spider);

  return chair;
}

/**
 * 9. Workstation Row System:
 * Neat modern corporate desk benching rows with acoustic privacy dividers,
 * open laptops with glowing screens, ultrawide monitors, and ergonomic task chairs
 * organized in precise neat rows as requested.
 */
export function buildWorkstationRowSystem(
  x: number,
  y: number,
  z: number,
  desksPerRow = 3,
  rotationY = 0,
  palette: FurniturePalette = {}
): { group: THREE.Group; collisionBox: THREE.Box3; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  const meshes: THREE.Mesh[] = [];

  const deskWidth = 1.45; // Width of each workstation
  const deskDepth = 0.75;
  const rowSpacing = 0.06; // Divider thickness
  const totalRowWidth = desksPerRow * deskWidth;

  const woodColor = palette.woodTone || 0x334155;
  const metalColor = palette.metal || 0x1e293b;
  const dividerColor = palette.accent || 0x2563eb; // Blue or corporate acoustic felt

  const deskTopMat = new THREE.MeshStandardMaterial({
    color: woodColor,
    roughness: 0.35,
    metalness: 0.05
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: metalColor,
    roughness: 0.4,
    metalness: 0.8
  });
  const dividerMat = new THREE.MeshStandardMaterial({
    color: dividerColor,
    roughness: 0.9,
    metalness: 0.02
  });

  // 1. Central Acoustic Privacy Screen / Divider between the 2 rows
  const divGeo = new THREE.BoxGeometry(totalRowWidth, 0.46, rowSpacing);
  const divider = new THREE.Mesh(divGeo, dividerMat);
  divider.position.set(0, 0.95, 0);
  divider.castShadow = true;
  group.add(divider);

  // 2. Loop through each desk in North row (facing South) and South row (facing North)
  const sides = [
    { dir: -1, zOffset: -(deskDepth / 2 + rowSpacing / 2), rotY: 0 },
    { dir: 1, zOffset: (deskDepth / 2 + rowSpacing / 2), rotY: Math.PI }
  ];

  sides.forEach((side) => {
    for (let i = 0; i < desksPerRow; i++) {
      const deskX = -totalRowWidth / 2 + (i + 0.5) * deskWidth;

      // Desk Top
      const topGeo = new THREE.BoxGeometry(deskWidth - 0.04, 0.04, deskDepth);
      const topMesh = new THREE.Mesh(topGeo, deskTopMat);
      topMesh.position.set(deskX, 0.73, side.zOffset);
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      topMesh.userData = { name: `Workstation Row Seat ${i + 1}`, isObstacle: true };
      group.add(topMesh);
      meshes.push(topMesh);

      // Steel frame legs
      const legGeo = new THREE.BoxGeometry(0.05, 0.71, deskDepth - 0.1);
      const legL = new THREE.Mesh(legGeo, metalMat);
      legL.position.set(deskX - (deskWidth / 2 - 0.06), 0.36, side.zOffset);
      group.add(legL);

      const legR = new THREE.Mesh(legGeo, metalMat);
      legR.position.set(deskX + (deskWidth / 2 - 0.06), 0.36, side.zOffset);
      group.add(legR);

      // Ultra-Slim Laptop on desk
      const laptopX = deskX + 0.28 * (side.dir > 0 ? -1 : 1);
      const laptopZ = side.zOffset + 0.12 * side.dir;
      const laptop = buildUltraSlimLaptop(laptopX, 0.75, laptopZ, side.rotY, palette);
      group.add(laptop);

      // Secondary Ultrawide Display
      const monitorX = deskX - 0.22 * (side.dir > 0 ? -1 : 1);
      const monitorZ = side.zOffset - 0.22 * side.dir;

      const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
      const bezelGeo = new THREE.BoxGeometry(0.68, 0.38, 0.03);
      const bezel = new THREE.Mesh(bezelGeo, bezelMat);
      bezel.position.set(monitorX, 1.05, monitorZ);
      bezel.rotation.y = side.rotY;
      bezel.castShadow = true;
      group.add(bezel);

      const displayMat = new THREE.MeshBasicMaterial({ map: createScreenTexture('code') });
      const displayGeo = new THREE.PlaneGeometry(0.64, 0.34);
      const display = new THREE.Mesh(displayGeo, displayMat);
      display.position.set(monitorX, 1.05, monitorZ + (side.dir > 0 ? -0.016 : 0.016));
      display.rotation.y = side.rotY;
      group.add(display);

      // Monitor Stand
      const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.32, 12);
      const arm = new THREE.Mesh(armGeo, metalMat);
      arm.position.set(monitorX, 0.89, monitorZ);
      group.add(arm);

      // Desk pad & Keyboard
      const padGeo = new THREE.BoxGeometry(0.65, 0.005, 0.32);
      const padMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(deskX, 0.752, side.zOffset + 0.14 * side.dir);
      group.add(pad);

      // Ergonomic Task Chair neatly tucked into row position
      const chairZ = side.zOffset + 0.62 * side.dir;
      const chair = buildErgonomicTaskChair(deskX, 0, chairZ, side.rotY, palette);
      group.add(chair);
    }
  });

  const totalD = (deskDepth * 2) + rowSpacing + 1.2;
  const collisionBox = new THREE.Box3(
    new THREE.Vector3(x - totalRowWidth / 2 - 0.2, y, z - totalD / 2),
    new THREE.Vector3(x + totalRowWidth / 2 + 0.2, y + 1.8, z + totalD / 2)
  );

  return { group, collisionBox, meshes };
}

/**
 * 10. Executive Glass Cabin:
 * Enclosed private glass cabin with black architectural frames, executive floating desk,
 * open laptop, executive leather chair, 2 visitor armchairs, credenza, and warm executive lamp.
 */
export function buildExecutiveCabin(
  x: number,
  y: number,
  z: number,
  width = 5.2,
  depth = 4.4,
  rotationY = 0,
  palette: FurniturePalette = {}
): { group: THREE.Group; collisionBox: THREE.Box3; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  const meshes: THREE.Mesh[] = [];

  const halfW = width / 2;
  const halfD = depth / 2;
  const wallH = 1.4; // Cutaway height matching realistic architectural rendering

  // Materials
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2e8f0,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    transmission: 0.6,
    ior: 1.5,
    thickness: 0.05
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
  const woodMat = new THREE.MeshStandardMaterial({ color: palette.woodTone || 0x2d1a0e, roughness: 0.3 });

  // Glass walls with dark mullion frames
  // Front glass wall with open doorway
  const doorWidth = 1.1;
  const frontGlassW = (width - doorWidth) / 2;

  [-halfW + frontGlassW / 2, halfW - frontGlassW / 2].forEach((paneX) => {
    const paneGeo = new THREE.BoxGeometry(frontGlassW, wallH, 0.06);
    const pane = new THREE.Mesh(paneGeo, glassMat);
    pane.position.set(paneX, wallH / 2, halfD);
    group.add(pane);

    const frameGeo = new THREE.BoxGeometry(frontGlassW + 0.02, 0.06, 0.08);
    const topFrame = new THREE.Mesh(frameGeo, frameMat);
    topFrame.position.set(paneX, wallH, halfD);
    group.add(topFrame);
  });

  // Executive Desk (Walnut finish)
  const deskGeo = new THREE.BoxGeometry(2.1, 0.06, 0.95);
  const desk = new THREE.Mesh(deskGeo, woodMat);
  desk.position.set(0, 0.74, -0.4);
  desk.castShadow = true;
  desk.receiveShadow = true;
  desk.userData = { name: 'Executive Walnut Desk', isObstacle: true };
  group.add(desk);
  meshes.push(desk);

  // Desk Modesty Panel & Legs
  const modestyGeo = new THREE.BoxGeometry(1.9, 0.45, 0.04);
  const modesty = new THREE.Mesh(modestyGeo, woodMat);
  modesty.position.set(0, 0.48, -0.15);
  group.add(modesty);

  // Ultra-Slim Laptop on executive desk
  const laptop = buildUltraSlimLaptop(-0.35, 0.77, -0.4, 0, palette);
  group.add(laptop);

  // Executive High-Back Leather Chair
  const chair = buildErgonomicTaskChair(0, 0, -1.05, 0, { upholstery: 0x18181b });
  group.add(chair);

  // 2 Guest / Client Armchairs facing executive desk
  [-0.65, 0.65].forEach((gx) => {
    const guestChair = buildErgonomicTaskChair(gx, 0, 0.45, Math.PI, { upholstery: 0x334155 });
    group.add(guestChair);
  });

  // Executive Storage Credenza along back wall
  const credenzaGeo = new THREE.BoxGeometry(2.4, 0.65, 0.48);
  const credenza = new THREE.Mesh(credenzaGeo, frameMat);
  credenza.position.set(0, 0.325, -halfD + 0.35);
  credenza.castShadow = true;
  group.add(credenza);
  meshes.push(credenza);

  // Warm Executive Desk Lamp with glowing light in night mode
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), frameMat);
  lampBase.position.set(0.7, 0.78, -0.5);
  group.add(lampBase);

  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 12), frameMat);
  lampStem.position.set(0.7, 0.95, -0.5);
  group.add(lampStem);

  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.6,
    roughness: 0.2
  });
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.14, 16), shadeMat);
  shade.position.set(0.7, 1.12, -0.5);
  group.add(shade);

  const collisionBox = new THREE.Box3(
    new THREE.Vector3(x - halfW, y, z - halfD),
    new THREE.Vector3(x + halfW, y + wallH + 0.4, z + halfD)
  );

  return { group, collisionBox, meshes };
}

/**
 * 11. Conference & Boardroom Cabin:
 * Glass partitioned boardroom with long conference table, 8 padded conference chairs,
 * and 85" wall presentation screen.
 */
export function buildConferenceCabin(
  x: number,
  y: number,
  z: number,
  width = 6.2,
  depth = 5.0,
  rotationY = 0,
  palette: FurniturePalette = {}
): { group: THREE.Group; collisionBox: THREE.Box3; meshes: THREE.Mesh[] } {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  const meshes: THREE.Mesh[] = [];

  const halfW = width / 2;
  const halfD = depth / 2;
  const wallH = 1.4;

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    transmission: 0.7
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
  const tableMat = new THREE.MeshStandardMaterial({ color: palette.woodTone || 0x1f2937, roughness: 0.35 });

  // Front glass partition with entrance
  const doorWidth = 1.4;
  const paneW = (width - doorWidth) / 2;
  [-halfW + paneW / 2, halfW - paneW / 2].forEach((px) => {
    const pane = new THREE.Mesh(new THREE.BoxGeometry(paneW, wallH, 0.06), glassMat);
    pane.position.set(px, wallH / 2, halfD);
    group.add(pane);

    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(paneW + 0.02, 0.06, 0.08), frameMat);
    topFrame.position.set(px, wallH, halfD);
    group.add(topFrame);
  });

  // Long Boardroom Conference Table (3.6m long, 1.25m wide)
  const confTableGeo = new THREE.BoxGeometry(3.6, 0.06, 1.25);
  const confTable = new THREE.Mesh(confTableGeo, tableMat);
  confTable.position.set(0, 0.74, 0);
  confTable.castShadow = true;
  confTable.receiveShadow = true;
  confTable.userData = { name: 'Boardroom Conference Table', isObstacle: true };
  group.add(confTable);
  meshes.push(confTable);

  // Twin pedestal bases
  [-1.1, 1.1].forEach((bx) => {
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.71, 0.75), frameMat);
    base.position.set(bx, 0.36, 0);
    group.add(base);
  });

  // Central connectivity module on table
  const connGeo = new THREE.BoxGeometry(0.45, 0.015, 0.16);
  const conn = new THREE.Mesh(connGeo, frameMat);
  conn.position.set(0, 0.775, 0);
  group.add(conn);

  // 8 Conference Chairs (4 per side)
  [-1.2, -0.4, 0.4, 1.2].forEach((cx) => {
    // North side chairs
    const chairN = buildErgonomicTaskChair(cx, 0, -0.85, 0, { upholstery: 0x1e293b });
    group.add(chairN);
    // South side chairs
    const chairS = buildErgonomicTaskChair(cx, 0, 0.85, Math.PI, { upholstery: 0x1e293b });
    group.add(chairS);
  });

  // 85" Video Conference Display on West Wall
  const screenBezel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.15, 2.1), frameMat);
  screenBezel.position.set(-halfW + 0.08, 1.15, 0);
  group.add(screenBezel);

  const displayMat = new THREE.MeshBasicMaterial({ map: createScreenTexture('dashboard') });
  const display = new THREE.Mesh(new THREE.PlaneGeometry(2.02, 1.08), displayMat);
  display.rotation.y = Math.PI / 2;
  display.position.set(-halfW + 0.115, 1.15, 0);
  group.add(display);

  const collisionBox = new THREE.Box3(
    new THREE.Vector3(x - halfW, y, z - halfD),
    new THREE.Vector3(x + halfW, y + wallH + 0.4, z + halfD)
  );

  return { group, collisionBox, meshes };
}

