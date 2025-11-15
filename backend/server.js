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
    const meta = JSON.parse(fs.readFileSync(META_FILE, "utf8"));
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: "No se pudo leer meta.json" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
