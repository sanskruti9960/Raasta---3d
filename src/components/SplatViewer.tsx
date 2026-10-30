import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import type { POI, RoomZone, ViewMode, NavPathResult, EnvironmentPreset, CustomRoomData, LightingTime, UtilityLayer } from '../types/spatial';
import { HOME_ROOM_ZONES } from '../data/homeDataset';
import { OFFICE_ROOM_ZONES } from '../data/officeDataset';
import {
  buildIndoorDigitalTwin,
  createPOIMarkerMesh,
  createNavigationPathMesh
} from '../utils/indoorSceneBuilder';

export interface SplatViewerProps {
  modelUrl?: string;
  preset: EnvironmentPreset;
  customRoom?: CustomRoomData | null;
  pois: POI[];
  selectedPOI: POI | null;
  onSelectPOI: (poi: POI | null) => void;
  selectedZone: RoomZone | null;
  onSelectZone: (zone: RoomZone | null) => void;
  activePath: NavPathResult | null;
  mode: ViewMode;
  lightingTime?: LightingTime;
  utilityLayer?: UtilityLayer;
  onTelemetryUpdate?: (telemetry: {
    position: [number, number, number];
    headingDegrees: number;
    fps: number;
  }) => void;
  isAddingPOI?: boolean;
  onFloorClick?: (point: [number, number, number]) => void;
  onRoomChange?: (zone: RoomZone | null) => void;
  onTapObject?: (objectInfo: { name: string; position: [number, number, number]; zoneName?: string }) => void;
  isAutoRoaming?: boolean;
  onAutoRoamComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
}

/**
 * Continuous Circle-to-AABB character physics solver:
 * Prevents tunneling or bypassing through ANY wall, partition, desk, table, or sofa.
 * Smoothly slides along obstacle faces.
 */
function resolvePlayerCollision(
  candX: number,
  candZ: number,
  radius: number,
  boxes: THREE.Box3[]
): { x: number; z: number } {
  let curX = candX;
  let curZ = candZ;

  for (let pass = 0; pass < 3; pass++) {
    let hadCollision = false;

    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      // Test obstacle height in player body zone (0.05m to 2.0m)
      if (b.max.y < 0.05 || b.min.y > 2.0) continue;

      const cx = Math.max(b.min.x, Math.min(b.max.x, curX));
      const cz = Math.max(b.min.z, Math.min(b.max.z, curZ));

      const dx = curX - cx;
      const dz = curZ - cz;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        hadCollision = true;
        const dist = Math.sqrt(distSq);

        if (dist > 1e-4) {
          const overlap = radius - dist;
          curX += (dx / dist) * overlap;
          curZ += (dz / dist) * overlap;
        } else {
          // Center is inside box - push to closest edge
          const dLeft = Math.abs(curX - b.min.x);
          const dRight = Math.abs(b.max.x - curX);
          const dTop = Math.abs(curZ - b.min.z);
          const dBottom = Math.abs(b.max.z - curZ);
          const minD = Math.min(dLeft, dRight, dTop, dBottom);

          if (minD === dLeft) curX = b.min.x - radius;
          else if (minD === dRight) curX = b.max.x + radius;
          else if (minD === dTop) curZ = b.min.z - radius;
          else curZ = b.max.z + radius;
        }
      }
    }

    if (!hadCollision) break;
  }

  return { x: curX, z: curZ };
}

/**
 * Creates a clean Google 3D Maps navigation explorer avatar
 */
function createAvatarMesh(): THREE.Group {
  const avatar = new THREE.Group();
  avatar.name = 'player-3d-avatar';

  // 1. Directional Base Circle (Flat on floor)
  const baseRingGeo = new THREE.RingGeometry(0.18, 0.36, 32);
  const baseRingMat = new THREE.MeshBasicMaterial({ color: 0x1a73e8, side: THREE.DoubleSide });
  const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
  baseRing.rotation.x = -Math.PI / 2;
  baseRing.position.y = 0.02;
  avatar.add(baseRing);

  // 2. Forward Heading Pointer
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0.52);
  arrowShape.lineTo(-0.16, 0.28);
  arrowShape.lineTo(0.16, 0.28);
  arrowShape.closePath();
  const arrowGeo = new THREE.ShapeGeometry(arrowShape);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0x1a73e8, side: THREE.DoubleSide });
  const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
  arrowMesh.rotation.x = -Math.PI / 2;
  arrowMesh.position.y = 0.025;
  avatar.add(arrowMesh);

  // 3. Humanoid Explorer Body
  const bodyGeo = new THREE.CylinderGeometry(0.16, 0.13, 0.62, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1a73e8, // Google Blue
    roughness: 0.4,
    metalness: 0.1
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.82;
  body.castShadow = true;
  avatar.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.14, 20, 20);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.1
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.30;
  head.castShadow = true;
  avatar.add(head);

  // Legs / Stem
  const legsGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.52, 12);
  const legsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const legs = new THREE.Mesh(legsGeo, legsMat);
  legs.position.y = 0.28;
  legs.castShadow = true;
  avatar.add(legs);

  return avatar;
}

export default function SplatViewer({
  modelUrl,
  preset = 'home',
  customRoom,
  pois,
  selectedPOI,
  onSelectPOI,
  onSelectZone,
  activePath,
  mode,
  lightingTime = 'afternoon',
  utilityLayer = 'none',
  onTelemetryUpdate,
  isAddingPOI = false,
  onFloorClick,
  onRoomChange,
  onTapObject,
  isAutoRoaming = false,
  onAutoRoamComplete,
  onStepChange
}: SplatViewerProps) {
  // Dedicated host for WebGL canvas - never directly host React children to prevent DOM de-sync
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [modelStatus, setModelStatus] = useState<string>('3D View Active');
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [inspectedObstacle, setInspectedObstacle] = useState<string | null>(null);

  // References to keep Three.js state persistent across all re-renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const viewerRef = useRef<InstanceType<typeof GaussianSplats3D.Viewer> | null>(null);
  const dtArchitectureRef = useRef<THREE.Group | null>(null);
  const poiGroupRef = useRef<THREE.Group | null>(null);
  const zoneGroupRef = useRef<THREE.Group | null>(null);
  const pathGroupRef = useRef<THREE.Group | null>(null);
  const avatarRef = useRef<THREE.Group | null>(null);
  const animatedElementsRef = useRef<Array<{ update: (delta: number, elapsed: number) => void }>>([]);
  const pathUpdaterRef = useRef<((delta: number, elapsed: number) => void) | null>(null);
  const poiUpdatersRef = useRef<Array<(delta: number, elapsed: number) => void>>([]);

  const collisionBoxesRef = useRef<THREE.Box3[]>([]);
  const wallMeshesRef = useRef<THREE.Mesh[]>([]);
  const obstacleMeshesRef = useRef<THREE.Mesh[]>([]);
  const hasLoadedSplatRef = useRef<boolean>(false);

  // Active dataset and room tracking refs
  const presetRef = useRef(preset);
  const customRoomRef = useRef(customRoom);
  const onRoomChangeRef = useRef(onRoomChange);
  const lastDetectedZoneIdRef = useRef<string | null>(null);

  // Player position in 3D space
  const playerPos = useRef<THREE.Vector3>(
    new THREE.Vector3(preset === 'home' ? 0.5 : 0, 0, preset === 'home' ? 0.5 : 7)
  );

  // Navigation auto-roam tracking
  const autoRoamIndex = useRef<number>(0);
  const isAutoRoamingRef = useRef<boolean>(isAutoRoaming);
  const onAutoRoamCompleteRef = useRef(onAutoRoamComplete);
  const onStepChangeRef = useRef(onStepChange);

  // Callbacks refs to prevent re-instantiating WebGL
  const onTelemetryUpdateRef = useRef(onTelemetryUpdate);
  const onSelectPOIRef = useRef(onSelectPOI);
  const onSelectZoneRef = useRef(onSelectZone);
  const onFloorClickRef = useRef(onFloorClick);
  const onTapObjectRef = useRef(onTapObject);

  useEffect(() => {
    presetRef.current = preset;
    customRoomRef.current = customRoom;
    onRoomChangeRef.current = onRoomChange;
    onTelemetryUpdateRef.current = onTelemetryUpdate;
    onSelectPOIRef.current = onSelectPOI;
    onSelectZoneRef.current = onSelectZone;
    onFloorClickRef.current = onFloorClick;
    onTapObjectRef.current = onTapObject;
    isAutoRoamingRef.current = isAutoRoaming;
    onAutoRoamCompleteRef.current = onAutoRoamComplete;
    onStepChangeRef.current = onStepChange;
  });

  // Walk & 3rd Person state
  const keysPressed = useRef<Record<string, boolean>>({});
  const cameraEuler = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isCrouching = useRef(false);
  const eyeHeight = useRef(1.6);
  const isSprinting = useRef(false);
  const isMouseDown = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Fly-to animation state
  const flyAnimationRef = useRef<{
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    startTime: number;
    duration: number;
    active: boolean;
  }>({
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    startTime: 0,
    duration: 1.0,
    active: false
  });

  // Handle fly-to POI or Room
  const triggerFlyTo = useCallback((targetPosition: [number, number, number]) => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    const currentTarget = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(0, 0, 0);

    const endTarget = new THREE.Vector3(targetPosition[0], targetPosition[1] + 0.3, targetPosition[2]);
    const offset = new THREE.Vector3(0, 2.4, 3.6);
    const endPos = endTarget.clone().add(offset);

    flyAnimationRef.current = {
      startPos: camera.position.clone(),
      endPos,
      startTarget: currentTarget,
      endTarget,
      startTime: performance.now() / 1000,
      duration: 1.0,
      active: true
    };
  }, []);

  // Trigger camera flight on POI selection
  useEffect(() => {
    if (selectedPOI) {
      triggerFlyTo(selectedPOI.position);
    }
  }, [selectedPOI, triggerFlyTo]);

  // Rebuild architecture when preset, lighting or utility changes without tearing down WebGL
  const rebuildArchitecture = useCallback((
    presetName: EnvironmentPreset,
    lTime: LightingTime = lightingTime,
    uLayer: UtilityLayer = utilityLayer
  ) => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Update scene background based on lighting time
    const bgHex = lTime === 'morning' ? 0x1b2032 : lTime === 'dusk' ? 0x111422 : lTime === 'night' ? 0x090b14 : 0x161a29;
    scene.background = new THREE.Color(bgHex);

    // Remove existing architecture & zones
    const oldArch = scene.getObjectByName('digital-twin-architecture');
    if (oldArch) scene.remove(oldArch);

    const oldZones = scene.getObjectByName('room-zones-group');
    if (oldZones) scene.remove(oldZones);

    const dt = buildIndoorDigitalTwin(
      scene,
      presetName,
      (z) => onSelectZoneRef.current?.(z),
      customRoom,
      { lightingTime: lTime, utilityLayer: uLayer }
    );
    dtArchitectureRef.current = dt.architectureGroup;
    zoneGroupRef.current = dt.zoneGroup;
    animatedElementsRef.current = dt.animatedElements;
    // Collect all solid wall and furniture collision boxes
    const allBoxes: THREE.Box3[] = [...dt.wallBoxes, ...dt.obstacleBoxes];
    dt.wallMeshes.forEach((mesh) => {
      mesh.geometry.computeBoundingBox();
      if (mesh.geometry.boundingBox) {
        mesh.updateMatrixWorld(true);
        const b = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
        allBoxes.push(b);
      }
    });
    dt.obstacleMeshes.forEach((mesh) => {
      mesh.geometry.computeBoundingBox();
      if (mesh.geometry.boundingBox) {
        mesh.updateMatrixWorld(true);
        const b = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
        allBoxes.push(b);
      }
    });
    collisionBoxesRef.current = allBoxes;
    wallMeshesRef.current = dt.wallMeshes;
    obstacleMeshesRef.current = dt.obstacleMeshes;

    // Reset player position when preset switches
    if (presetName === 'custom_room' && customRoom) {
      playerPos.current.set(0, 0, customRoom.dimensions.depth / 2 - 0.8);
    } else if (presetName === 'home') {
      playerPos.current.set(0.5, 0, 0.5);
    } else {
      playerPos.current.set(0, 0, 7);
    }
    if (avatarRef.current) {
      avatarRef.current.position.set(playerPos.current.x, 0, playerPos.current.z);
    }
  }, [customRoom, lightingTime, utilityLayer]);

  // 1. One-time Setup of Three.js Scene & Render Loop
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    // Create Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x161a29); // Exact fuselab deep midnight studio background
    sceneRef.current = scene;

    const width = host.clientWidth || window.innerWidth;
    const height = host.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0.5, 9, 13);
    camera.lookAt(0, 0, 1.5);
    cameraRef.current = camera;

    // WebGL Renderer with High-Performance Settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Mount canvas into host
    host.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 1.0;
    controls.maxDistance = 55;
    controls.target.set(0, 0.5, 1.5);
    controlsRef.current = controls;

    // Initial architecture build
    rebuildArchitecture(preset);

    // Create 3D Avatar
    const avatar = createAvatarMesh();
    avatar.position.set(playerPos.current.x, 0, playerPos.current.z);
    scene.add(avatar);
    avatarRef.current = avatar;

    // Placeholder groups
    const poiGroup = new THREE.Group();
    poiGroup.name = 'live-poi-group';
    scene.add(poiGroup);
    poiGroupRef.current = poiGroup;

    const pathGroup = new THREE.Group();
    pathGroup.name = 'live-path-group';
    scene.add(pathGroup);
    pathGroupRef.current = pathGroup;

    // Render loop state
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    let currentFps = 60;
    let animationFrameId: number;
    let isCancelled = false;

    const clock = new THREE.Clock();

    function animate() {
      if (isCancelled) return;
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min(clock.getDelta(), 0.06);
      const elapsed = clock.getElapsedTime();

      // FPS tracking
      frameCount++;
      if (now - lastFpsUpdate >= 500) {
        currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      // Smooth Fly-To animation
      if (flyAnimationRef.current.active) {
        const anim = flyAnimationRef.current;
        const animElapsed = now / 1000 - anim.startTime;
        const progress = Math.min(1, animElapsed / anim.duration);
        const ease = 1 - Math.pow(1 - progress, 3);

        if (Number.isFinite(anim.endPos.x) && Number.isFinite(anim.endTarget.x)) {
          camera.position.lerpVectors(anim.startPos, anim.endPos, ease);
          const currentTgt = new THREE.Vector3().lerpVectors(anim.startTarget, anim.endTarget, ease);
          if (controlsRef.current) {
            controlsRef.current.target.copy(currentTgt);
          }
          camera.lookAt(currentTgt);
        }

        if (progress >= 1) {
          anim.active = false;
          if (controlsRef.current && mode === 'orbit') {
            controlsRef.current.target.copy(anim.endTarget);
            controlsRef.current.update();
          }
        }
      }

      // -----------------------------------------------------------------------
      // PLAYER MOVEMENT & SOLID COLLISION (Walk & 3rd Person & AR)
      // -----------------------------------------------------------------------
      const isPlayerMovingMode = mode === 'walk' || mode === 'third' || mode === 'ar';

      if (isPlayerMovingMode && !flyAnimationRef.current.active) {
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }

        const speed = isSprinting.current ? 5.5 : 3.2;
        const moveVec = new THREE.Vector3();

        const isW = Boolean(keysPressed.current['KeyW'] || keysPressed.current['w'] || keysPressed.current['ArrowUp'] || keysPressed.current['arrowup']);
        const isS = Boolean(keysPressed.current['KeyS'] || keysPressed.current['s'] || keysPressed.current['ArrowDown'] || keysPressed.current['arrowdown']);
        const isA = Boolean(keysPressed.current['KeyA'] || keysPressed.current['a'] || keysPressed.current['ArrowLeft'] || keysPressed.current['arrowleft']);
        const isD = Boolean(keysPressed.current['KeyD'] || keysPressed.current['d'] || keysPressed.current['ArrowRight'] || keysPressed.current['arrowright']);

        if (isW) moveVec.z -= 1;
        if (isS) moveVec.z += 1;
        if (isA) moveVec.x -= 1;
        if (isD) moveVec.x += 1;

        if (moveVec.lengthSq() > 0) {
          moveVec.normalize();

          // Calculate forward & right vectors based on camera yaw
          const yaw = cameraEuler.current.y;
          const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
          const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

          const totalDeltaMovement = forward
            .clone()
            .multiplyScalar(-moveVec.z * speed * delta)
            .add(right.clone().multiplyScalar(moveVec.x * speed * delta));

          // Sub-step continuous collision resolution (impermeable walls & furniture)
          const subStepCount = Math.max(1, Math.ceil(totalDeltaMovement.length() / 0.05));
          const stepVec = totalDeltaMovement.clone().divideScalar(subStepCount);
          const playerRadius = 0.40;

          for (let step = 0; step < subStepCount; step++) {
            const candX = playerPos.current.x + stepVec.x;
            const candZ = playerPos.current.z + stepVec.z;
            const resolved = resolvePlayerCollision(candX, candZ, playerRadius, collisionBoxesRef.current);
            playerPos.current.x = resolved.x;
            playerPos.current.z = resolved.z;
          }

          // Safe perimeter bounds clamp strictly per dataset
          let boundX = 6.9;
          let boundZmin = -6.8;
          let boundZmax = 9.3;

          if (presetRef.current === 'office') {
            boundX = 12.5;
            boundZmin = -8.0;
            boundZmax = 8.0;
          } else if (presetRef.current === 'custom_room' && customRoomRef.current) {
            boundX = (customRoomRef.current.dimensions.width / 2) - 0.35;
            boundZmin = -(customRoomRef.current.dimensions.depth / 2) + 0.35;
            boundZmax = (customRoomRef.current.dimensions.depth / 2) - 0.35;
          }

          playerPos.current.x = Math.max(-boundX, Math.min(boundX, playerPos.current.x));
          playerPos.current.z = Math.max(boundZmin, Math.min(boundZmax, playerPos.current.z));
        }

        // Automatic roaming along active navigation route
        if (isAutoRoamingRef.current && activePath && activePath.coordinates.length > 1) {
          const tgt = activePath.coordinates[autoRoamIndex.current];
          if (tgt) {
            const dir = new THREE.Vector3(tgt[0] - playerPos.current.x, 0, tgt[2] - playerPos.current.z);
            const dist = dir.length();

            if (dist < 0.5) {
              if (autoRoamIndex.current < activePath.coordinates.length - 1) {
                autoRoamIndex.current += 1;
                onStepChangeRef.current?.(autoRoamIndex.current);
              } else {
                onAutoRoamCompleteRef.current?.();
              }
            } else {
              dir.normalize();
              const autoSpeed = 2.2; // Smooth walking pace
              const stepDist = autoSpeed * delta;
              const candX = playerPos.current.x + dir.x * Math.min(stepDist, dist);
              const candZ = playerPos.current.z + dir.z * Math.min(stepDist, dist);
              const resolved = resolvePlayerCollision(candX, candZ, 0.40, collisionBoxesRef.current);
              playerPos.current.x = resolved.x;
              playerPos.current.z = resolved.z;

              // Smoothly steer camera yaw toward travel direction
              const targetYaw = Math.atan2(-dir.x, -dir.z);
              let diffYaw = targetYaw - cameraEuler.current.y;
              while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
              while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
              cameraEuler.current.y += diffYaw * Math.min(1, delta * 5.0);
              camera.quaternion.setFromEuler(cameraEuler.current);
            }
          }
        }

        // Update Avatar Position and Rotation
        if (avatarRef.current) {
          avatarRef.current.position.set(playerPos.current.x, 0, playerPos.current.z);
          avatarRef.current.rotation.y = cameraEuler.current.y;
          // Visible in 3rd person mode, hidden in 1st person walk
          avatarRef.current.visible = mode === 'third';
        }

        // Camera Positioning per Mode
        if (mode === 'walk' || mode === 'ar') {
          // 1st Person: Eye-level camera
          const targetHeight = isCrouching.current ? 0.95 : 1.6;
          eyeHeight.current += (targetHeight - eyeHeight.current) * 0.15;
          camera.position.set(playerPos.current.x, eyeHeight.current, playerPos.current.z);
        } else if (mode === 'third') {
          // 3rd Person: Follow behind avatar with Raycasted Wall/Obstacle Collision
          const yaw = cameraEuler.current.y;
          const pitch = cameraEuler.current.x;

          // Camera target is player chest
          const targetPt = new THREE.Vector3(playerPos.current.x, 1.15, playerPos.current.z);

          // Calculate ideal camera position behind the player
          const camDist = 3.4;
          const camHeight = 1.6 - pitch * 1.5;
          const backVec = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize();

          const desiredCamPos = targetPt
            .clone()
            .addScaledVector(backVec, camDist)
            .add(new THREE.Vector3(0, camHeight, 0));

          // RAYCAST COLLISION: Cast ray from player chest to desired camera position
          // Guarantees camera stops strictly BEFORE walls or obstacles, never passing through
          const rayDir = new THREE.Vector3().subVectors(desiredCamPos, targetPt);
          const fullDist = rayDir.length();

          if (fullDist > 0.05) {
            rayDir.normalize();
            const camRaycaster = new THREE.Raycaster(targetPt, rayDir, 0.05, fullDist);
            const occluders = [...wallMeshesRef.current, ...obstacleMeshesRef.current];
            const hits = camRaycaster.intersectObjects(occluders, false);

            if (hits.length > 0) {
              // Wall or obstacle is hit! Stop strictly before the hit point
              const hitDist = hits[0].distance;
              // Never go past (hitDist - 0.20m), never closer than 0.35m from player
              const safeDist = Math.max(0.35, Math.min(hitDist - 0.20, fullDist));
              camera.position.copy(targetPt).addScaledVector(rayDir, safeDist);
              if (safeDist < 1.3) {
                // Elevate camera slightly for clear over-the-shoulder view
                camera.position.y += (1.3 - safeDist) * 0.4;
              }
            } else {
              camera.position.copy(desiredCamPos);
            }
          } else {
            camera.position.copy(desiredCamPos);
          }

          camera.lookAt(targetPt);
        }
      } else if (mode === 'orbit') {
        const isW = Boolean(keysPressed.current['KeyW'] || keysPressed.current['w'] || keysPressed.current['ArrowUp'] || keysPressed.current['arrowup']);
        const isS = Boolean(keysPressed.current['KeyS'] || keysPressed.current['s'] || keysPressed.current['ArrowDown'] || keysPressed.current['arrowdown']);
        const isA = Boolean(keysPressed.current['KeyA'] || keysPressed.current['a'] || keysPressed.current['ArrowLeft'] || keysPressed.current['arrowleft']);
        const isD = Boolean(keysPressed.current['KeyD'] || keysPressed.current['d'] || keysPressed.current['ArrowRight'] || keysPressed.current['arrowright']);

        const moveVec = new THREE.Vector3();
        if (isW) moveVec.z -= 1;
        if (isS) moveVec.z += 1;
        if (isA) moveVec.x -= 1;
        if (isD) moveVec.x += 1;

        if (moveVec.lengthSq() > 0 && !flyAnimationRef.current.active) {
          moveVec.normalize();
          const camDir = new THREE.Vector3();
          camera.getWorldDirection(camDir);
          camDir.y = 0;
          camDir.normalize();

          const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();
          const panSpeed = (isSprinting.current ? 12 : 6) * delta;
          const panOffset = camDir.clone().multiplyScalar(-moveVec.z * panSpeed)
            .add(camRight.clone().multiplyScalar(moveVec.x * panSpeed));

          camera.position.add(panOffset);
          if (controlsRef.current) {
            controlsRef.current.target.add(panOffset);
          }
          playerPos.current.add(panOffset);
          if (avatarRef.current) {
            avatarRef.current.position.set(playerPos.current.x, 0, playerPos.current.z);
          }
        }

        if (controlsRef.current && !flyAnimationRef.current.active) {
          controlsRef.current.enabled = true;
          controlsRef.current.update();
        }
        if (avatarRef.current) {
          avatarRef.current.visible = true;
        }
      }

      // Safety check against NaN
      if (!Number.isFinite(camera.position.x) || !Number.isFinite(camera.position.y) || !Number.isFinite(camera.position.z)) {
        camera.position.set(0.5, 9, 13);
        if (controlsRef.current) controlsRef.current.target.set(0, 0.5, 1.5);
      }

      // Update animated elements
      animatedElementsRef.current.forEach((el) => el.update(delta, elapsed));
      poiUpdatersRef.current.forEach((fn) => fn(delta, elapsed));
      if (pathUpdaterRef.current) {
        pathUpdaterRef.current(delta, elapsed);
      }

      // Render Three.js Scene
      if (hasLoadedSplatRef.current && viewerRef.current) {
        viewerRef.current.update();
        viewerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }

      // Real-time active room detection
      const px = playerPos.current.x;
      const pz = playerPos.current.z;
      const currentActiveZones = presetRef.current === 'custom_room'
        ? (customRoomRef.current?.zones || [])
        : presetRef.current === 'home'
          ? HOME_ROOM_ZONES
          : OFFICE_ROOM_ZONES;

      const detectedZone = currentActiveZones.find(
        (z) => px >= z.bounds.minX && px <= z.bounds.maxX && pz >= z.bounds.minZ && pz <= z.bounds.maxZ
      ) || null;

      if (detectedZone?.id !== lastDetectedZoneIdRef.current) {
        lastDetectedZoneIdRef.current = detectedZone?.id || null;
        onRoomChangeRef.current?.(detectedZone);
      }

      // Telemetry update
      if (onTelemetryUpdateRef.current) {
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        let headingDeg = (Math.atan2(camDir.x, -camDir.z) * 180) / Math.PI;
        if (headingDeg < 0) headingDeg += 360;

        onTelemetryUpdateRef.current({
          position: [
            Math.round(playerPos.current.x * 10) / 10,
            Math.round(playerPos.current.y * 10) / 10,
            Math.round(playerPos.current.z * 10) / 10
          ],
          headingDegrees: Math.round(headingDeg),
          fps: currentFps
        });
      }
    }

    animate();

    const handleResize = () => {
      if (!host || !camera || !renderer) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      viewerRef.current?.dispose();
      renderer.dispose();
      if (host && host.contains(renderer.domElement)) {
        host.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONCE on mount

  // Watch preset, lighting, and utility changes and rebuild architecture dynamically without destroying WebGL
  useEffect(() => {
    rebuildArchitecture(preset, lightingTime, utilityLayer);
    if (cameraRef.current && controlsRef.current && mode === 'orbit') {
      if (preset === 'custom_room' && customRoom) {
        cameraRef.current.position.set(0, 6.5, customRoom.dimensions.depth + 2.5);
        controlsRef.current.target.set(0, 0.4, 0);
      } else if (preset === 'home') {
        cameraRef.current.position.set(0.5, 8.5, 12);
        controlsRef.current.target.set(0, 0.5, 1.5);
      } else {
        cameraRef.current.position.set(0, 11, 16);
        controlsRef.current.target.set(0, 0.5, 0);
      }
    }
  }, [preset, customRoom, rebuildArchitecture, mode, lightingTime, utilityLayer]);

  // Load custom splat model when modelUrl changes
  useEffect(() => {
    if (!modelUrl || !canvasHostRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) {
      return;
    }
    setModelStatus('Loading 3D model...');
    let isCancelled = false;

    try {
      const viewer = new GaussianSplats3D.Viewer({
        rootElement: canvasHostRef.current,
        threeScene: sceneRef.current,
        camera: cameraRef.current,
        renderer: rendererRef.current,
        selfDrivenMode: false,
        useBuiltInControls: false,
        sharedMemoryForWorkers: false,
        gpuAcceleratedSort: false,
        logLevel: GaussianSplats3D.LogLevel.None
      });
      viewerRef.current = viewer;

      viewer
        .addSplatScene(modelUrl, {
          showLoadingUI: true,
          progressiveLoad: true
        })
        .then(() => {
          if (!isCancelled) {
            hasLoadedSplatRef.current = true;
            setModelStatus('3D Model Active');
          }
        })
        .catch(() => {
          setModelStatus(preset === 'home' ? 'Home Floorplan Active' : 'Corporate Hub Active');
        });
    } catch {
      setTimeout(() => {
        if (!isCancelled) {
          setModelStatus(preset === 'home' ? 'Home Floorplan Active' : 'Corporate Hub Active');
        }
      }, 0);
    }

    return () => {
      isCancelled = true;
    };
  }, [modelUrl, preset]);

  // Update POI 3D Markers whenever POIs array changes
  useEffect(() => {
    const poiGroup = poiGroupRef.current;
    if (!poiGroup) return;

    while (poiGroup.children.length > 0) {
      poiGroup.remove(poiGroup.children[0]);
    }
    poiUpdatersRef.current = [];

    pois.forEach((poi) => {
      const { mesh, update } = createPOIMarkerMesh(poi, onSelectPOIRef.current);
      poiGroup.add(mesh);
      poiUpdatersRef.current.push(update);
    });
  }, [pois]);

  // Update Navigation Path 3D Mesh whenever activePath changes
  useEffect(() => {
    const pathGroup = pathGroupRef.current;
    if (!pathGroup) return;

    while (pathGroup.children.length > 0) {
      pathGroup.remove(pathGroup.children[0]);
    }
    pathUpdaterRef.current = null;

    if (activePath && activePath.coordinates.length > 1) {
      const { group, update } = createNavigationPathMesh(activePath.coordinates);
      pathGroup.add(group);
      pathUpdaterRef.current = update;
    }
  }, [activePath]);

  // Mode changes (Orbit vs Third Person vs Walk vs AR)
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (mode === 'walk' || mode === 'third' || mode === 'ar') {
      controls.enabled = false;
      camera.fov = mode === 'ar' ? 55 : 60;
      camera.updateProjectionMatrix();
    } else {
      controls.enabled = true;
      camera.fov = 52;
      camera.updateProjectionMatrix();
      if (camera.position.y < 2.5) {
        camera.position.set(0.5, 8.5, 12);
        controls.target.set(0, 0.5, 1.5);
      }
    }
  }, [mode]);

  // Keyboard Event Listeners with comprehensive keycode, letter, and arrow support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept keys if user is typing in a text field
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      keysPressed.current[e.code] = true;
      if (e.key) {
        keysPressed.current[e.key.toLowerCase()] = true;
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        isSprinting.current = true;
      }
      if (e.code === 'KeyC' || e.key === 'c' || e.key === 'C') {
        isCrouching.current = !isCrouching.current;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      if (e.key) {
        keysPressed.current[e.key.toLowerCase()] = false;
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        isSprinting.current = false;
      }
    };

    const handleBlur = () => {
      keysPressed.current = {};
      isSprinting.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Safe Click Handling (Resilient against any error - NEVER blanks the screen)
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      try {
        const host = canvasHostRef.current;
        const camera = cameraRef.current;
        const scene = sceneRef.current;
        if (!host || !camera || !scene) return;

        const rect = host.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

        // 1. Check for POI clicks
        if (poiGroupRef.current && poiGroupRef.current.children.length > 0) {
          const intersects = raycaster.intersectObjects(poiGroupRef.current.children, true);
          if (intersects.length > 0) {
            for (const hit of intersects) {
              let obj: THREE.Object3D | null = hit.object;
              while (obj && obj !== poiGroupRef.current) {
                if (obj.userData && obj.userData.poi) {
                  onSelectPOIRef.current?.(obj.userData.poi);
                  return;
                }
                obj = obj.parent;
              }
            }
          }
        }

        // 2. Check for Obstacle / Furniture clicks -> Trigger SOP naming & inspection on tap
        if (obstacleMeshesRef.current.length > 0 && !isAddingPOI) {
          const obsIntersects = raycaster.intersectObjects(obstacleMeshesRef.current, false);
          if (obsIntersects.length > 0) {
            const hit = obsIntersects[0];
            const hitObstacle = hit.object;
            const objName = (hitObstacle.userData && hitObstacle.userData.name)
              ? hitObstacle.userData.name
              : 'Room Asset';

            setInspectedObstacle(objName);
            onTapObjectRef.current?.({
              name: objName,
              position: [
                Math.round(hit.point.x * 10) / 10,
                0.4,
                Math.round(hit.point.z * 10) / 10
              ]
            });
            return;
          }
        }

        // 3. Check for Room Zone clicks
        if (zoneGroupRef.current && !isAddingPOI) {
          const zoneIntersects = raycaster.intersectObjects(zoneGroupRef.current.children, true);
          let foundZone: RoomZone | null = null;
          if (zoneIntersects.length > 0) {
            for (const hit of zoneIntersects) {
              if (hit.object && hit.object.userData && hit.object.userData.zone) {
                foundZone = hit.object.userData.zone;
                break;
              }
            }
          }
          if (!foundZone) {
            const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const hitPoint = new THREE.Vector3();
            raycaster.ray.intersectPlane(floorPlane, hitPoint);
            if (hitPoint && Number.isFinite(hitPoint.x) && Number.isFinite(hitPoint.z)) {
              const currentActiveZones = presetRef.current === 'custom_room'
                ? (customRoomRef.current?.zones || [])
                : presetRef.current === 'home'
                  ? HOME_ROOM_ZONES
                  : OFFICE_ROOM_ZONES;

              foundZone = currentActiveZones.find(
                (z) => hitPoint.x >= z.bounds.minX && hitPoint.x <= z.bounds.maxX && hitPoint.z >= z.bounds.minZ && hitPoint.z <= z.bounds.maxZ
              ) || null;
            }
          }
          if (foundZone) {
            onSelectZoneRef.current?.(foundZone);
            return;
          }
        }

        // 4. Add POI mode click
        if (isAddingPOI && onFloorClickRef.current) {
          const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
          const intersectPoint = new THREE.Vector3();
          raycaster.ray.intersectPlane(floorPlane, intersectPoint);
          if (intersectPoint && Number.isFinite(intersectPoint.x) && Number.isFinite(intersectPoint.z)) {
            onFloorClickRef.current([
              Math.round(intersectPoint.x * 10) / 10,
              0.4,
              Math.round(intersectPoint.z * 10) / 10
            ]);
            return;
          }
        }

        // 5. Request pointer lock ONLY in 1st-person walk mode
        if (mode === 'walk' && document.pointerLockElement !== host) {
          try {
            const p = host.requestPointerLock?.();
            if (p && typeof p.catch === 'function') {
              p.catch(() => {});
            }
          } catch {
            // ignore pointer lock failures
          }
        }
      } catch (err) {
        console.warn('Click handled safely:', err);
      }
    },
    [mode, isAddingPOI]
  );

  // Mouse look & drag rotation with NaN guards
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const camera = cameraRef.current;
      if (!camera) return;

      if (!Number.isFinite(e.movementX) || !Number.isFinite(e.movementY)) return;
      if (Math.abs(e.movementX) > 200 || Math.abs(e.movementY) > 200) return;

      const sensitivity = 0.0022;
      const isPlayerMode = mode === 'walk' || mode === 'third' || mode === 'ar';

      // Pointer lock active
      if (isPlayerMode && document.pointerLockElement === canvasHostRef.current) {
        cameraEuler.current.y -= e.movementX * sensitivity;
        cameraEuler.current.x -= e.movementY * sensitivity;
        cameraEuler.current.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, cameraEuler.current.x));

        if (mode === 'walk' || mode === 'ar') {
          camera.quaternion.setFromEuler(cameraEuler.current);
        }
      }
      // Drag look if not locked
      else if (isPlayerMode && isMouseDown.current) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        if (Number.isFinite(dx) && Number.isFinite(dy)) {
          cameraEuler.current.y -= dx * sensitivity;
          cameraEuler.current.x -= dy * sensitivity;
          cameraEuler.current.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, cameraEuler.current.x));

          if (mode === 'walk' || mode === 'ar') {
            camera.quaternion.setFromEuler(cameraEuler.current);
          }
        }
      }
    };

    const handleMouseDownEvt = (e: MouseEvent) => {
      isMouseDown.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUpEvt = () => {
      isMouseDown.current = false;
    };

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === canvasHostRef.current);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDownEvt);
    document.addEventListener('mouseup', handleMouseUpEvt);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDownEvt);
      document.removeEventListener('mouseup', handleMouseUpEvt);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [mode]);

  return (
    <div className={`spatial-viewport ${mode === 'walk' || mode === 'third' || mode === 'ar' ? 'cursor-crosshair' : 'cursor-grab'}`}>
      {/* 
        Dedicated Canvas Host: Three.js WebGL canvas is mounted ONLY inside this div.
        React overlay elements live as separate siblings to guarantee that React
        virtual DOM reconciliation NEVER corrupts or blanks the screen on click!
      */}
      <div
        ref={canvasHostRef}
        className="webgl-canvas-host"
        onClick={handleCanvasClick}
      />

      {/* Center crosshair in first-person walk mode */}
      {mode === 'walk' && (
        <div className="center-crosshair">
          <div className="crosshair-dot" />
        </div>
      )}

      {/* Clean Google 3D Maps status badge */}
      <div className="status-pill">
        <span className="status-dot" />
        <span className="status-text">{modelStatus}</span>
      </div>

      {/* Traceable Obstacle Inspection Pill */}
      {inspectedObstacle && (
        <div className="obstacle-inspect-pill">
          <span className="obstacle-dot" />
          <span>Object: {inspectedObstacle}</span>
        </div>
      )}

      {/* Dynamic Navigation Instructions Banner */}
      {!isPointerLocked && (
        <div className="walk-helper-pill">
          {mode === 'orbit' ? (
            <span>WASD / Arrows to pan view • Left-click + drag to rotate • Scroll to zoom</span>
          ) : (
            <span>WASD / Arrows to walk • Click to look • Shift to sprint • C to crouch</span>
          )}
        </div>
      )}
    </div>
  );
}
