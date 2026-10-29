import type { NavNode, NavPathResult, TurnInstruction } from '../types/spatial';

/**
 * Navigable indoor waypoint graph for the facility.
 * Nodes correspond to hallway intersections, corridor centerlines, and room doorways.
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

  // West Wing (Juspay Lab & Server Hub & West Exit)
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

  // East Wing (Techfest Arena & Conference Room & East Exit)
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
 * Find the closest navigable graph node to any given point (e.g. user camera or POI)
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
 * Dijkstra / A* optimal pathfinding algorithm
 */
export function findShortestPath(
  startPos: [number, number, number],
  endPos: [number, number, number],
  graph: Record<string, NavNode> = INDOOR_NAV_GRAPH
): NavPathResult | null {
  const startNode = findNearestNode(startPos, graph);
  const endNode = findNearestNode(endPos, graph);

  if (startNode.id === endNode.id) {
    const directDist = distance3D(startPos, endPos);
    return {
      nodes: [startNode],
      coordinates: [startPos, endPos],
      totalDistanceMeters: Math.max(1, Math.round(directDist * 10) / 10),
      estimatedWalkingSeconds: Math.max(2, Math.round((directDist / 1.3) * 10) / 10),
      turnInstructions: [
        {
          text: `Proceed directly to ${endNode.name || 'destination'}`,
          type: 'straight',
          distanceMeters: Math.round(directDist),
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

  // Priority Queue / Min-set for Dijkstra
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
    // Find unvisited node with lowest distance
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
    // Fallback direct path
    return null;
  }

  // Construct coordinates: startPos -> pathNodes -> endPos
  const rawCoords: [number, number, number][] = [startPos];
  for (const node of pathNodes) {
    rawCoords.push(node.position);
  }
  rawCoords.push(endPos);

  // Straighten coordinates to eliminate zigzags and collinear kinks
  const cleanCoords = straightenCoordinates(rawCoords);

  // Compute total distance
  let totalDistance = 0;
  for (let i = 0; i < cleanCoords.length - 1; i++) {
    totalDistance += distance3D(cleanCoords[i], cleanCoords[i + 1]);
  }

  // Assume avg walking speed = 1.3 meters/sec
  const estimatedSeconds = Math.max(3, Math.round(totalDistance / 1.3));

  // Generate Turn-by-Turn directions
  const turnInstructions = generateTurnInstructions(cleanCoords);

  return {
    nodes: pathNodes,
    coordinates: cleanCoords,
    totalDistanceMeters: Math.round(totalDistance * 10) / 10,
    estimatedWalkingSeconds: estimatedSeconds,
    turnInstructions
  };
}

/**
 * Straightens the route by removing collinear kinks, micro-segments,
 * and unnecessary intermediate nodes to ensure a clean, straight Google Maps walking line.
 */
export function straightenCoordinates(coords: [number, number, number][]): [number, number, number][] {
  if (coords.length <= 2) return coords;

  // Pass 1: Remove micro-segments and collinear kinks
  const simplified: [number, number, number][] = [coords[0]];

  for (let i = 1; i < coords.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const curr = coords[i];
    const next = coords[i + 1];

    // Distance threshold: skip micro-steps
    if (distance3D(prev, curr) < 0.3) continue;

    // Check collinearity in the XZ floor plane
    const v1x = curr[0] - prev[0];
    const v1z = curr[2] - prev[2];
    const v2x = next[0] - curr[0];
    const v2z = next[2] - curr[2];

    const len1 = Math.hypot(v1x, v1z);
    const len2 = Math.hypot(v2x, v2z);

    if (len1 > 0.001 && len2 > 0.001) {
      const dot = (v1x * v2x + v1z * v2z) / (len1 * len2);
      // If angle is nearly straight (> 0.90), skip curr to maintain straight lane
      if (dot > 0.90) {
        continue;
      }
    }

    simplified.push(curr);
  }

  // Ensure destination is properly connected
  const endPoint = coords[coords.length - 1];
  if (simplified.length === 1 || distance3D(simplified[simplified.length - 1], endPoint) > 0.15) {
    simplified.push(endPoint);
  } else {
    simplified[simplified.length - 1] = endPoint;
  }

  // Pass 2: Clean up any tiny residual turns
  const finalPass: [number, number, number][] = [simplified[0]];
  for (let i = 1; i < simplified.length - 1; i++) {
    const prev = finalPass[finalPass.length - 1];
    const curr = simplified[i];
    if (distance3D(prev, curr) < 0.35) continue;
    finalPass.push(curr);
  }
  finalPass.push(simplified[simplified.length - 1]);

  return finalPass;
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
    // Vector A: p0 -> p1, Vector B: p1 -> p2 (in XZ plane)
    const v1x = p1[0] - p0[0];
    const v1z = p1[2] - p0[2];
    const v2x = p2[0] - p1[0];
    const v2z = p2[2] - p1[2];

    // Cross product in 2D determines left vs right turn
    const cross = v1x * v2z - v1z * v2x;
    const dot = v1x * v2x + v1z * v2z;
    const mag1 = Math.sqrt(v1x * v1x + v1z * v1z);
    const mag2 = Math.sqrt(v2x * v2x + v2z * v2z);
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
