/**
 * Geo-math utilities for route generation.
 */

/** Calculate destination point given distance (km) and bearing (radians). */
export function destinationPoint(
  lat: number,
  lng: number,
  distanceKm: number,
  bearingRad: number
): [number, number] {
  const R = 6371;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) +
      Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(bearingRad)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(distanceKm / R) * Math.cos(lat1),
      Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
}

/** Haversine distance between two lat/lng points in km. */
export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Bearing (radians) from point 1 to point 2. */
export function getBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const l1 = lat1 * (Math.PI / 180);
  const l2 = lat2 * (Math.PI / 180);

  const y = Math.sin(dLon) * Math.cos(l2);
  const x =
    Math.cos(l1) * Math.sin(l2) - Math.sin(l1) * Math.cos(l2) * Math.cos(dLon);
  return Math.atan2(y, x);
}

/** Generate waypoints for OSRM routing between two points. */
export function generateWaypoints(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  targetDistanceKm: number
): [number, number][] {
  const isLoop = startLat === endLat && startLng === endLng;

  if (isLoop) {
    const numPoints = 6;
    const radius = targetDistanceKm / (2 * Math.PI);
    const centerAngle = Math.random() * 2 * Math.PI;
    const center = destinationPoint(startLat, startLng, radius, centerAngle);

    const waypoints: [number, number][] = [[startLng, startLat]];
    const startAngleToCenter = getBearing(
      center[0],
      center[1],
      startLat,
      startLng
    );

    for (let i = 1; i < numPoints; i++) {
      const angleOffset = (i / numPoints) * 2 * Math.PI;
      const angle =
        startAngleToCenter + angleOffset + (Math.random() * 0.5 - 0.25);
      const jitteredRadius = radius * (0.5 + Math.random() * 1.0);
      const p = destinationPoint(center[0], center[1], jitteredRadius, angle);
      waypoints.push([p[1], p[0]]);
    }
    waypoints.push([startLng, startLat]);
    return waypoints;
  } else {
    const L = getDistanceKm(startLat, startLng, endLat, endLng);
    const D_prime = targetDistanceKm / 1.3;

    if (D_prime <= L * 1.1) {
      return [
        [startLng, startLat],
        [endLng, endLat],
      ];
    }

    const numPoints = 4;
    const a = D_prime / 2;
    const c = L / 2;
    const b = Math.sqrt(Math.max(0, a * a - c * c));

    const waypoints: [number, number][] = [[startLng, startLat]];

    const midLat = (startLat + endLat) / 2;
    const midLng = (startLng + endLng) / 2;
    const bearing = getBearing(startLat, startLng, endLat, endLng);

    const direction = Math.random() > 0.5 ? 1 : -1;

    for (let i = 1; i <= numPoints; i++) {
      const progress = i / (numPoints + 1);
      const t = Math.PI - progress * Math.PI;

      const jitterX = (Math.random() - 0.5) * (a * 0.4);
      const jitterY = (Math.random() - 0.5) * (b * 0.4);

      const x = a * Math.cos(t) + jitterX;
      const y = direction * b * Math.sin(t) + jitterY;

      const distMidToW = Math.sqrt(x * x + y * y);
      const angleMidToW = Math.atan2(y, x);
      const globalBearing = bearing + angleMidToW;

      const w = destinationPoint(midLat, midLng, distMidToW, globalBearing);
      waypoints.push([w[1], w[0]]);
    }

    waypoints.push([endLng, endLat]);
    return waypoints;
  }
}
