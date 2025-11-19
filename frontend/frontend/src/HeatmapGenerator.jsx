// src/HeatmapGenerator.js
// Generador de puntos + consultas a OpenRouteService (vía backend local)

// -------------------------------
// Haversine (metros)
// -------------------------------
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// -------------------------------
// Random grid dentro de BBox
// -------------------------------
function generateRandomPointsInBBox(bbox, count) {
  const pts = [];

  for (let i = 0; i < count; i++) {
    const lat =
      Math.random() * (bbox.maxLat - bbox.minLat) + bbox.minLat;
    const lon =
      Math.random() * (bbox.maxLon - bbox.minLon) + bbox.minLon;
    pts.push({ lat, lon });
  }

  return pts;
}

// -------------------------------
// Bounding Box dinámico
// -------------------------------
function bboxFromServices(services, paddingFactor = 0.03) {
  const lats = services.map(s => parseFloat(s.lat)).filter(n => !isNaN(n));
  const lons = services.map(s => parseFloat(s.lon)).filter(n => !isNaN(n));

  if (lats.length === 0 || lons.length === 0) {
    return {
      minLat: -33.48,
      maxLat: -33.40,
      minLon: -70.73,
      maxLon: -70.58
    };
  }

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const latPad = (maxLat - minLat) * paddingFactor;
  const lonPad = (maxLon - minLon) * paddingFactor;

  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLon: minLon - lonPad,
    maxLon: maxLon + lonPad
  };
}

// -------------------------------
// Llamada a backend local ORS Proxy
// -------------------------------
async function orsWalkingDistance(lat1, lon1, lat2, lon2) {
  // Sanitizar coordenadas (previene error 500)
  lat1 = parseFloat(lat1);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);
  lon2 = parseFloat(lon2);

  if (
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    console.warn("Coordenadas inválidas → fallback haversine");
    return null;
  }

  const url = "http://localhost:3001/api/ors/directions";

  const body = {
    coordinates: [
      [lon1, lat1],
      [lon2, lat2]
    ]
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      // ORS puede tirar 500 cuando no existe camino o hay error interno
      console.warn("ORS backend response not ok:", res.status);
      return null;
    }

    const json = await res.json();

    const dist = json?.routes?.[0]?.summary?.distance;
    if (typeof dist === "number") return dist;

    return null;
  } catch (err) {
    console.error("ORS error:", err);
    return null;
  }
}

// -------------------------------
// Helper chunk array
// -------------------------------
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function cacheKey(type, count) {
  return `heat_${type}_${count}`;
}

// -------------------------------
// MAIN: generar dataset del heatmap
// -------------------------------
export async function generateHeatmapData(
  servicesList,
  options = {}
) {
  const totalPoints = options.totalPoints || 500;
  const concurrency = options.concurrency || 5;
  const delayBetweenBatchesMs =
    options.delayBetweenBatchesMs || 250;

  const type =
    servicesList.length > 0 ? servicesList[0].type : "all";

  const ckey = cacheKey(type, totalPoints);
  const cached = localStorage.getItem(ckey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  const bbox = bboxFromServices(servicesList, 0.04);
  const points = generateRandomPointsInBBox(bbox, totalPoints);

  // --------------------------------------
  // Obtener nearest service con Haversine
  // --------------------------------------
  const tasks = points.map(p => {
    let nearest = null;
    let minD = Infinity;

    for (const s of servicesList) {
      const slat = parseFloat(s.lat);
      const slon = parseFloat(s.lon);
      if (isNaN(slat) || isNaN(slon)) continue;

      const d = haversine(p.lat, p.lon, slat, slon);
      if (d < minD) {
        minD = d;
        nearest = s;
      }
    }

    return { point: p, nearest };
  });

  const results = [];
  const chunks = chunkArray(tasks, concurrency);

  // --------------------------------------
  // Ejecutar ORS + fallback haversine
  // --------------------------------------
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    const promises = chunk.map(async ({ point, nearest }) => {
      if (!nearest) return null;

      const slat = parseFloat(nearest.lat);
      const slon = parseFloat(nearest.lon);

      if (isNaN(slat) || isNaN(slon)) {
        return {
          lat: point.lat,
          lon: point.lon,
          distance: haversine(point.lat, point.lon, slat, slon)
        };
      }

      // ORS distance
      const dist = await orsWalkingDistance(
        point.lat,
        point.lon,
        slat,
        slon
      );

      // Fallback siempre seguro
      const finalDist =
        dist !== null
          ? dist
          : haversine(point.lat, point.lon, slat, slon);

      return {
        lat: point.lat,
        lon: point.lon,
        distance: finalDist
      };
    });

    const resolved = await Promise.all(promises);
    resolved.forEach(r => r && results.push(r));

    if (i < chunks.length - 1) {
      await new Promise(r =>
        setTimeout(r, delayBetweenBatchesMs)
      );
    }
  }

  try {
    localStorage.setItem(ckey, JSON.stringify(results));
  } catch {}

  return results;
}
