// backend/server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data", "services.json");
const META_FILE = path.join(__dirname, "data", "meta.json");

// util: normalizar texto (quita diacríticos, lowercase, trim)
function normalize(s) {
  if (!s) return "";
  return s
    .toString()
    .normalize("NFD")          // separa diacríticos
    .replace(/[\u0300-\u036f]/g, "") // quita diacríticos
    .toLowerCase()
    .trim();
}

// leer JSON de disco (con manejo de errores)
function readServices() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error leyendo services.json:", err);
    return [];
  }
}

// endpoint principal con filtrado robusto
app.get("/api/services", (req, res) => {
  try {
    const { type = "", comuna = "", q = "" } = req.query;

    console.log("GET /api/services query:", req.query);

    const data = readServices();

    // Normalizar criterios de búsqueda
    const nType = normalize(type);
    const nComuna = normalize(comuna);
    const nQ = normalize(q);

    let filtered = data.filter((s) => {
      // Si registro no tiene campos esperados, tratarlo con defaults
      const sType = normalize(s.type || "");
      const sComuna = normalize(s.comuna || "");
      const sName = normalize(s.name || "");
      const sAddress = normalize(s.address || "");
      const sTags = Array.isArray(s.tags) ? s.tags.map(normalize).join(" ") : "";

      // Si existen filtros, cada uno debe cumplirse:
      // - type: match exact (normalizado)
      // - comuna: match exact (normalizado)
      // - q: contains en name/address/tags
      if (nType && nType !== "" && sType !== nType) return false;
      if (nComuna && nComuna !== "" && sComuna !== nComuna) return false;
      if (nQ && nQ !== "") {
        const hay = sName.includes(nQ) || sAddress.includes(nQ) || sTags.includes(nQ);
        if (!hay) return false;
      }
      return true;
    });

    res.json(filtered);
  } catch (err) {
    console.error("Error en /api/services:", err);
    res.status(500).json({ error: "Error procesando la petición" });
  }
});

// endpoint metrics (si lo necesitas)
app.get("/api/metrics", (req, res) => {
  try {
    const { comuna, all } = req.query;

    const services = readServices();
    const meta = JSON.parse(fs.readFileSync(META_FILE, "utf8"));

    const norm = (s) =>
      s
        ? s
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
        : "";

    // Función haversine para distancias (km)
    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const toRad = (v) => (v * Math.PI) / 180;

      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // ----------------------------------
    // 1) Resumen por todas las comunas
    // ----------------------------------
    if (all === "true") {
      const grouped = {};

      services.forEach((s) => {
        const c = s.comuna || "sin_comuna";
        if (!grouped[c]) grouped[c] = [];
        grouped[c].push(s);
      });

      const result = Object.entries(grouped).map(([c, arr]) => {
        const metaC = meta.comunas[c] || {};
        const pobl = metaC.poblacion || null;
        const sup = metaC.superficie_km2 || null;
        const total = arr.length;

        return {
          comuna: c,
          total,
          poblacion: pobl,
          superficie_km2: sup,
          servicios_por_100k:
            pobl ? Number(((total / pobl) * 100000).toFixed(2)) : null,
          densidad_servicios_por_km2:
            sup ? Number((total / sup).toFixed(4)) : null,
        };
      });

      return res.json(result);
    }

    // ----------------------------------
    // 2) Detalles de una comuna específica
    // ----------------------------------
    if (comuna) {
      const target = norm(comuna);

      const filtered = services.filter(
        (s) => norm(s.comuna) === target
      );

      const total = filtered.length;
      const metaC = meta.comunas[comuna] || {};
      const pobl = metaC.poblacion || null;
      const sup = metaC.superficie_km2 || null;

      // Calcular centroide
      const coords = filtered
        .map((s) => ({
          lat: parseFloat(s.lat),
          lon: parseFloat(s.lon),
        }))
        .filter((c) => !isNaN(c.lat) && !isNaN(c.lon));

      let centroide = null;
      if (coords.length > 0) {
        const sum = coords.reduce(
          (acc, c) => ({
            lat: acc.lat + c.lat,
            lon: acc.lon + c.lon,
          }),
          { lat: 0, lon: 0 }
        );

        centroide = {
          lat: sum.lat / coords.length,
          lon: sum.lon / coords.length,
        };
      }

      // Distancia promedio desde centroide
      let distancia_promedio_km = null;

      if (centroide) {
        const totalDist = coords.reduce(
          (acc, c) =>
            acc +
            haversine(
              centroide.lat,
              centroide.lon,
              c.lat,
              c.lon
            ),
          0
        );

        distancia_promedio_km = Number(
          (totalDist / coords.length).toFixed(3)
        );
      }

      return res.json({
        comuna,
        totalServicios: total,
        poblacion: pobl,
        superficie_km2: sup,
        servicios_por_100k:
          pobl ? Number(((total / pobl) * 100000).toFixed(2)) : null,
        densidad_servicios_por_km2:
          sup ? Number((total / sup).toFixed(4)) : null,
        centroide,
        distancia_promedio_km,
        servicios: filtered,
      });
    }

    // ----------------------------------
    // 3) Fallback cuando no piden nada
    // ----------------------------------
    res.json({
      totalServicios: services.length,
    });
  } catch (err) {
    console.error("Error en /api/metrics:", err);
    res.status(500).json({ error: "No se pudieron calcular métricas" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
