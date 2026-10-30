import type { NavNode, NavPathResult, TurnInstruction } from '../types/spatial';

export interface ObstacleAABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
}

/**
 * Known solid architectural partitions and large furniture bounding boxes for the Home dataset.
 * Used for raycast line-of-sight visibility checking and string-pulling shortcutting.
 */
export const HOME_DEFAULT_OBSTACLES: ObstacleAABB[] = [
  // Living / Bedroom divider wall (x: [-7.4, -2.4], z: [-1.2, -0.8])
  { minX: -7.5, maxX: -2.3, minZ: -1.25, maxZ: -0.75, minY: 0, maxY: 2.5 },
  // Kitchen / Study divider wall (x: [3.4, 7.4], z: [-1.2, -0.8])
  { minX: 3.3, maxX: 7.5, minZ: -1.25, maxZ: -0.75, minY: 0, maxY: 2.5 },
  // Bedroom / Bath divider wall (x: [-1.2, -0.8], z: [-7.3, -3.9])
  { minX: -1.25, maxX: -0.75, minZ: -7.4, maxZ: -3.8, minY: 0, maxY: 2.5 },
  // Bath / Study divider wall (x: [2.35, 2.65], z: [-7.3, -3.9])
  { minX: 2.3, maxX: 2.7, minZ: -7.4, maxZ: -3.8, minY: 0, maxY: 2.5 },
  // Balcony partition railing (x: [-7.4, -2.6], z: [6.9, 7.1])
  { minX: -7.5, maxX: -2.5, minZ: 6.85, maxZ: 7.15, minY: 0, maxY: 1.5 },
  // Master Bed suite
  { minX: -5.7, maxX: -2.7, minZ: -6.2, maxZ: -3.0, minY: 0, maxY: 1.4 },
  // Sectional sofa suite
  { minX: -5.2, maxX: -2.0, minZ: 1.6, maxZ: 3.6, minY: 0, maxY: 1.0 },
  // Kitchen central island
  { minX: 2.6, maxX: 5.0, minZ: 1.8, maxZ: 3.8, minY: 0, maxY: 1.1 },
  // Computer workstation desk in study
  { minX: 3.0, maxX: 5.4, minZ: -6.6, maxZ: -4.4, minY: 0, maxY: 1.6 }
];

export const OFFICE_DEFAULT_OBSTACLES: ObstacleAABB[] = [
  // West corridor spine wall
  { minX: -0.8, maxX: -0.4, minZ: -7.0, maxZ: -2.5, minY: 0, maxY: 2.5 },
  { minX: -0.8, maxX: -0.4, minZ: 2.5, maxZ: 7.0, minY: 0, maxY: 2.5 },
  // East corridor spine wall
  { minX: 0.4, maxX: 0.8, minZ: -7.0, maxZ: -2.5, minY: 0, maxY: 2.5 },
  { minX: 0.4, maxX: 0.8, minZ: 2.5, maxZ: 7.0, minY: 0, maxY: 2.5 },
  // Boardroom conference table
  { minX: 5.0, maxX: 10.0, minZ: -5.0, maxZ: -1.5, minY: 0, maxY: 1.2 },
  // Workstation rows
  { minX: -10.5, maxX: -5.5, minZ: -5.0, maxZ: -1.5, minY: 0, maxY: 1.3 }
];

/**
 * Navigable indoor waypoint graph for the facility.
 */
export const INDOOR_NAV_GRAPH: Record<string, NavNode> = {
  // Central corridor spine
  'node-lobby': {
    id: 'node-lobby',
    position: [0, 0, 7],
    neighbors: ['node-cross-south'],
    name: 'Reception Foyer'
  },
  'node-cross-south': {
    id: 'node-cross-south',
    position: [0, 0, 3],
    neighbors: ['node-lobby', 'node-center', 'node-corridor-west-south', 'node-corridor-east-south'],
    name: 'South Crossroad'
  },
  'node-center': {
    id: 'node-center',
    position: [0, 0, 0],
    neighbors: ['node-cross-south', 'node-cross-north', 'node-west-junction', 'node-east-junction'],
    name: 'Central Plaza'
  },
  'node-cross-north': {
    id: 'node-cross-north',
    position: [0, 0, -4],
    neighbors: ['node-center', 'node-north-end', 'node-corridor-west-north', 'node-corridor-east-north'],
    name: 'Pantry Junction'
  },
  'node-north-end': {
    id: 'node-north-end',
    position: [0, 0, -8],
    neighbors: ['node-cross-north', 'node-restrooms'],
    name: 'North Gallery'
  },
  'node-restrooms': {
    id: 'node-restrooms',
    position: [4, 0, -8],
    neighbors: ['node-north-end'],
    name: 'Restroom Hallway'
  },

  // West Wing
  'node-corridor-west-south': {
    id: 'node-corridor-west-south',
    position: [-4, 0, 3],
    neighbors: ['node-cross-south', 'node-juspay-entrance'],
    name: 'West-South Hallway'
  },
  'node-juspay-entrance': {
    id: 'node-juspay-entrance',
    position: [-8, 0, 3],
    neighbors: ['node-corridor-west-south', 'node-west-junction'],
    name: 'Juspay Lab Entrance'
  },
  'node-west-junction': {
    id: 'node-west-junction',
    position: [-8, 0, 0],
    neighbors: ['node-center', 'node-juspay-entrance', 'node-west-exit', 'node-server-entrance'],
    name: 'West Wing Junction'
  },
  'node-west-exit': {
    id: 'node-west-exit',
    position: [-13, 0, 0],
    neighbors: ['node-west-junction'],
    name: 'West Emergency Exit'
  },
  'node-server-entrance': {
    id: 'node-server-entrance',
    position: [-8, 0, -6],
    neighbors: ['node-west-junction', 'node-corridor-west-north'],
    name: 'Server Hub Door'
  },
  'node-corridor-west-north': {
    id: 'node-corridor-west-north',
    position: [-4, 0, -4],
    neighbors: ['node-cross-north', 'node-server-entrance'],
    name: 'West-North Hallway'
  },

  // East Wing
  'node-corridor-east-south': {
    id: 'node-corridor-east-south',
    position: [4, 0, 3],
    neighbors: ['node-cross-south', 'node-techfest-entrance'],
    name: 'East-South Hallway'
  },
  'node-techfest-entrance': {
    id: 'node-techfest-entrance',
    position: [8, 0, 3],
    neighbors: ['node-corridor-east-south', 'node-east-junction'],
    name: 'Techfest Arena Entrance'
  },
  'node-east-junction': {
    id: 'node-east-junction',
    position: [8, 0, 0],
    neighbors: ['node-center', 'node-techfest-entrance', 'node-east-exit', 'node-conf-entrance'],
    name: 'East Wing Junction'
  },
  'node-east-exit': {
    id: 'node-east-exit',
    position: [13, 0, 0],
    neighbors: ['node-east-junction'],
    name: 'East Emergency Exit'
  },
  'node-conf-entrance': {
    id: 'node-conf-entrance',
    position: [8, 0, -6],
    neighbors: ['node-east-junction', 'node-corridor-east-north'],
    name: 'Boardroom Entrance'
  },
  'node-corridor-east-north': {
    id: 'node-corridor-east-north',
    position: [4, 0, -4],
    neighbors: ['node-cross-north', 'node-conf-entrance'],
    name: 'East-North Hallway'
  }
};

/**
 * Euclidean distance in 3D
 */
export function distance3D(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Check if a 2D line segment intersects an axis-aligned bounding box (Liang-Barsky slab algorithm)
 */
export function lineSegmentIntersectsAABB(
  p1: [number, number, number],
  p2: [number, number, number],
  box: ObstacleAABB,
  clearance = 0.35
): boolean {
  if (box.maxY !== undefined && box.maxY < 0.1) return false;
  if (box.minY !== undefined && box.minY > 1.8) return false;

  const minX = box.minX - clearance;
  const maxX = box.maxX + clearance;
  const minZ = box.minZ - clearance;
  const maxZ = box.maxZ + clearance;

  const x1 = p1[0];
  const z1 = p1[2];
  const x2 = p2[0];
  const z2 = p2[2];

  const dx = x2 - x1;
  const dz = z2 - z1;

  let t0 = 0.0;
  let t1 = 1.0;

  // X axis slab
  if (Math.abs(dx) < 1e-7) {
    if (x1 < minX || x1 > maxX) return false;
  } else {
    let tmin = (minX - x1) / dx;
    let tmax = (maxX - x1) / dx;
    if (tmin > tmax) {
      const temp = tmin;
      tmin = tmax;
      tmax = temp;
    }
    t0 = Math.max(t0, tmin);
    t1 = Math.min(t1, tmax);
    if (t0 > t1) return false;
  }

  // Z axis slab
  if (Math.abs(dz) < 1e-7) {
    if (z1 < minZ || z1 > maxZ) return false;
  } else {
    let tmin = (minZ - z1) / dz;
    let tmax = (maxZ - z1) / dz;
    if (tmin > tmax) {
      const temp = tmin;
      tmin = tmax;
      tmax = temp;
    }
    t0 = Math.max(t0, tmin);
    t1 = Math.min(t1, tmax);
    if (t0 > t1) return false;
  }

  return true;
}

/**
 * Line-of-sight test: returns true if the direct segment between p1 and p2
 * does NOT intersect any obstacle box.
 */
export function checkLineOfSight(
  p1: [number, number, number],
  p2: [number, number, number],
  obstacles: ObstacleAABB[],
  clearance = 0.32
): boolean {
  for (let i = 0; i < obstacles.length; i++) {
    if (lineSegmentIntersectsAABB(p1, p2, obstacles[i], clearance)) {
      return false;
    }
  }
  return true;
}

/**
 * Find the closest navigable graph node to any given point
 */
export function findNearestNode(
  point: [number, number, number],
  graph: Record<string, NavNode> = INDOOR_NAV_GRAPH
): NavNode {
  const keys = Object.keys(graph);
  if (keys.length === 0) {
    return { id: 'fallback', position: point, neighbors: [] };
  }
  let closest: NavNode = graph[keys[0]];
  let minDistance = Infinity;

  for (const key of keys) {
    const node = graph[key];
    const dist = distance3D(point, node.position);
    if (dist < minDistance) {
      minDistance = dist;
      closest = node;
    }
  }

  return closest;
}

/**
 * String-pulling (Funnel) shortcutting pass:
 * Collapses zigzagging waypoint sequences into the most direct, accurate, unobstructed lines.
 */
export function stringPullingPass(
  points: [number, number, number][],
  obstacles: ObstacleAABB[]
): [number, number, number][] {
  if (points.length <= 2) return points;

  const result: [number, number, number][] = [points[0]];
  let currIdx = 0;

  while (currIdx < points.length - 1) {
    // Try to connect to the furthest visible point ahead
    let furthestIdx = currIdx + 1;
    for (let testIdx = points.length - 1; testIdx > currIdx; testIdx--) {
      if (checkLineOfSight(points[currIdx], points[testIdx], obstacles, 0.32)) {
        furthestIdx = testIdx;
        break;
      }
    }
    result.push(points[furthestIdx]);
    currIdx = furthestIdx;
  }

  return result;
}

/**
 * Rounds out sharp corners around doorways by creating smooth 0.35m corner bevels.
 */
export function smoothCornerBevels(
  coords: [number, number, number][],
  obstacles: ObstacleAABB[]
): [number, number, number][] {
  if (coords.length <= 2) return coords;

  const smoothed: [number, number, number][] = [coords[0]];

  for (let i = 1; i < coords.length - 1; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const next = coords[i + 1];

    const d1 = distance3D(prev, curr);
    const d2 = distance3D(curr, next);

    // Bevel radius
    const bevel = Math.min(0.4, Math.min(d1 * 0.35, d2 * 0.35));

    if (bevel > 0.15) {
      // Cut in along previous segment
      const c1x = curr[0] - ((curr[0] - prev[0]) / d1) * bevel;
      const c1z = curr[2] - ((curr[2] - prev[2]) / d1) * bevel;
      const pC1: [number, number, number] = [c1x, 0, c1z];

      // Cut out along next segment
      const c2x = curr[0] + ((next[0] - curr[0]) / d2) * bevel;
      const c2z = curr[2] + ((next[2] - curr[2]) / d2) * bevel;
      const pC2: [number, number, number] = [c2x, 0, c2z];

      // Verify neither bevel point penetrates an obstacle
      if (checkLineOfSight(prev, pC1, obstacles, 0.25) && checkLineOfSight(pC1, pC2, obstacles, 0.25)) {
        smoothed.push(pC1);
        smoothed.push(pC2);
        continue;
      }
    }

    smoothed.push(curr);
  }

  smoothed.push(coords[coords.length - 1]);
  return smoothed;
}

/**
 * Dijkstra / A* with Obstacle-Aware String Pulling:
 * Guarantees direct, accurate routes without zigzags.
 */
export function findShortestPath(
  startPos: [number, number, number],
  endPos: [number, number, number],
  graph: Record<string, NavNode> = INDOOR_NAV_GRAPH,
  customObstacles?: ObstacleAABB[]
): NavPathResult | null {
  // Use provided obstacles or default
  const activeObstacles = customObstacles && customObstacles.length > 0
    ? customObstacles
    : HOME_DEFAULT_OBSTACLES;

  // 1. Direct Line-of-Sight Check:
  // If start and destination are in the same open room / aisle, navigate directly without detour!
  if (checkLineOfSight(startPos, endPos, activeObstacles, 0.35)) {
    const directDist = distance3D(startPos, endPos);
    return {
      nodes: [],
      coordinates: [startPos, endPos],
      totalDistanceMeters: Math.max(0.5, Math.round(directDist * 10) / 10),
      estimatedWalkingSeconds: Math.max(1, Math.round((directDist / 1.3) * 10) / 10),
      turnInstructions: [
        {
          text: `Head directly to destination (${Math.round(directDist * 10) / 10}m)`,
          type: 'straight',
          distanceMeters: Math.round(directDist * 10) / 10,
          position: startPos
        },
        {
          text: 'Arrived at your destination',
          type: 'arrive',
          distanceMeters: 0,
          position: endPos
        }
      ]
    };
  }

  // 2. Multi-room / Obstacle Routing via NavMesh
  const startNode = findNearestNode(startPos, graph);
  const endNode = findNearestNode(endPos, graph);

  if (startNode.id === endNode.id) {
    const directDist = distance3D(startPos, endPos);
    return {
      nodes: [startNode],
      coordinates: [startPos, endPos],
      totalDistanceMeters: Math.max(0.5, Math.round(directDist * 10) / 10),
      estimatedWalkingSeconds: Math.max(1, Math.round((directDist / 1.3) * 10) / 10),
      turnInstructions: [
        {
          text: `Proceed to ${endNode.name || 'target'}`,
          type: 'straight',
          distanceMeters: Math.round(directDist * 10) / 10,
          position: startPos
        },
        {
          text: 'Arrived at your destination',
          type: 'arrive',
          distanceMeters: 0,
          position: endPos
        }
      ]
    };
  }

  // Dijkstra shortest path on graph
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const id in graph) {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  }

  distances[startNode.id] = 0;

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let lowestDistance = Infinity;

    for (const id of unvisited) {
      if (distances[id] < lowestDistance) {
        lowestDistance = distances[id];
        currentId = id;
      }
    }

    if (!currentId || lowestDistance === Infinity) break;
    if (currentId === endNode.id) break;

    unvisited.delete(currentId);
    const currentNode = graph[currentId];
    if (!currentNode) continue;

    for (const neighborId of currentNode.neighbors) {
      if (!unvisited.has(neighborId)) continue;
      const neighborNode = graph[neighborId];
      if (!neighborNode) continue;
      const edgeWeight = distance3D(currentNode.position, neighborNode.position);
      const altDistance = distances[currentId] + edgeWeight;

      if (altDistance < distances[neighborId]) {
        distances[neighborId] = altDistance;
        previous[neighborId] = currentId;
      }
    }
  }

  // Reconstruct path
  const pathNodes: NavNode[] = [];
  let curr: string | null = endNode.id;

  while (curr !== null) {
    if (graph[curr]) {
      pathNodes.unshift(graph[curr]);
    }
    curr = previous[curr];
  }

  if (pathNodes.length === 0 || pathNodes[0].id !== startNode.id) {
    return {
      nodes: [],
      coordinates: [startPos, endPos],
      totalDistanceMeters: Math.round(distance3D(startPos, endPos) * 10) / 10,
      estimatedWalkingSeconds: Math.round(distance3D(startPos, endPos) / 1.3),
      turnInstructions: [
        { text: 'Proceed to target', type: 'straight', distanceMeters: Math.round(distance3D(startPos, endPos)), position: startPos },
        { text: 'Arrived at destination', type: 'arrive', distanceMeters: 0, position: endPos }
      ]
    };
  }

  // Construct raw waypoint chain
  const rawCoords: [number, number, number][] = [startPos];
  for (const node of pathNodes) {
    rawCoords.push(node.position);
  }
  rawCoords.push(endPos);

  // 3. String-Pulling Optimization Pass:
  // Cuts through open hallways and doorways directly, removing all right-angle zigzagging!
  const pulledCoords = stringPullingPass(rawCoords, activeObstacles);

  // 4. Smooth corner bevels around doorways
  const finalCoords = smoothCornerBevels(pulledCoords, activeObstacles);

  // Compute total distance
  let totalDistance = 0;
  for (let i = 0; i < finalCoords.length - 1; i++) {
    totalDistance += distance3D(finalCoords[i], finalCoords[i + 1]);
  }

  const estimatedSeconds = Math.max(2, Math.round(totalDistance / 1.3));
  const turnInstructions = generateTurnInstructions(finalCoords);

  return {
    nodes: pathNodes,
    coordinates: finalCoords,
    totalDistanceMeters: Math.round(totalDistance * 10) / 10,
    estimatedWalkingSeconds: estimatedSeconds,
    turnInstructions
  };
}

/**
 * Generate human-readable turn directions based on vectors
 */
function generateTurnInstructions(coords: [number, number, number][]): TurnInstruction[] {
  const instructions: TurnInstruction[] = [];
  if (coords.length < 2) return instructions;

  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const segDist = Math.round(distance3D(p1, p2) * 10) / 10;

    if (i === 0) {
      instructions.push({
        text: `Head straight for ${segDist}m`,
        type: 'straight',
        distanceMeters: segDist,
        position: p1
      });
      continue;
    }

    const p0 = coords[i - 1];
    const v1x = p1[0] - p0[0];
    const v1z = p1[2] - p0[2];
    const v2x = p2[0] - p1[0];
    const v2z = p2[2] - p1[2];

    const cross = v1x * v2z - v1z * v2x;
    const dot = v1x * v2x + v1z * v2z;
    const mag1 = Math.hypot(v1x, v1z);
    const mag2 = Math.hypot(v2x, v2z);
    const cosAngle = dot / (mag1 * mag2 || 1);
    const angleDeg = (Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI;

    if (angleDeg < 25) {
      instructions.push({
        text: `Continue straight for ${segDist}m`,
        type: 'straight',
        distanceMeters: segDist,
        position: p1
      });
    } else if (cross > 0) {
      instructions.push({
        text: `Turn right and proceed ${segDist}m`,
        type: 'right',
        distanceMeters: segDist,
        position: p1
      });
    } else {
      instructions.push({
        text: `Turn left and proceed ${segDist}m`,
        type: 'left',
        distanceMeters: segDist,
        position: p1
      });
    }
  }

  instructions.push({
    text: 'You have reached your destination',
    type: 'arrive',
    distanceMeters: 0,
    position: coords[coords.length - 1]
  });

  return instructions;
}
