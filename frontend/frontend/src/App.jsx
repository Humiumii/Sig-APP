// src/App.jsx
import { useState, useEffect } from "react";
import axios from "axios";

import MetricsPanel from "./MetricsPanel";
import MapView from "./MapView";
import FilterBar from "./FilterBar";
import ListResults from "./ListResults";
import GlobalMetricsPanel from "./GlobalMetricsPanel";

import IsoPanel from "./IsoPanel";
import { generateHeatmapData } from "./HeatmapGenerator";

export default function App() {
  const [filters, setFilters] = useState({
    type: "",
    comuna: "",
    q: ""
  });

  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showGlobalMetrics, setShowGlobalMetrics] = useState(false);

  // Lista panel
  const [showList, setShowList] = useState(true);

  // Heatmap state
  const [heatmapData, setHeatmapData] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Cargar servicios filtrados desde el backend
  useEffect(() => {
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.comuna) params.comuna = filters.comuna;
    if (filters.q) params.q = filters.q;

    axios
      .get("http://localhost:3001/api/services", { params })
      .then(res => {
        setServices(res.data);
        setSelected(null);
      })
      .catch(err => console.error(err));
  }, [filters]);

  // Handler para IsoPanel
  async function handleGenerate({ type, points }) {
    // Filter services by type
    const filtered = services.length > 0
      ? services.filter(s => s.type === type)
      : [];

    if (filtered.length === 0) {
      alert("No hay servicios de ese tipo en la lista actual.");
      return;
    }

    setGenerating(true);
    setHeatmapData([]); // limpiar vista previa

    try {
      // generateHeatmapData hace batching y cache
      const data = await generateHeatmapData(filtered, {
        totalPoints: points,
        concurrency: 5,
        delayBetweenBatchesMs: 250
      });

      setHeatmapData(data || []);
    } catch (err) {
      console.error("Error generando heatmap:", err);
      alert("Error generando el mapa de distancias. Revisa la consola.");
    } finally {
      setGenerating(false);
    }
  }

  function handleClearHeatmap() {
    setHeatmapData([]);
    // también puedes limpiar el cache en localStorage si quieres:
    // localStorage.removeItem(`heat_${type}_${points}`);
  }

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <FilterBar filters={filters} setFilters={setFilters} />
      <MetricsPanel comuna={filters.comuna} />

      <button
        onClick={() => setShowGlobalMetrics(true)}
        style={{
          position: "absolute",
          top: 320,
          right: 20,
          zIndex: 2000,
          padding: "8px 12px",
          background: "white",
          borderRadius: 8,
          border: "1px solid #ddd",
          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          cursor: "pointer"
        }}
      >
        Ver métricas globales
      </button>

      {/* Mostrar/Ocultar panel de lista */}
      {showList ? (
        <ListResults
          services={services}
          onSelect={(svc) => { setSelected(svc); /* opcional setShowList(false); */ }}
          onClose={() => setShowList(false)}
        />
      ) : (
        <button
          onClick={() => setShowList(true)}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 3000,
            padding: "10px 14px",
            background: "white",
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            border: "1px solid #ddd",
            cursor: "pointer"
          }}
        >
          Mostrar resultados
        </button>
      )}

      {/* IsoPanel: generar heatmap */}
      <IsoPanel onGenerate={handleGenerate} onClear={handleClearHeatmap} />

      {/* Loader indicador */}
      {generating && (
        <div style={{
          position: "absolute", top: 20, right: 20, zIndex: 3000,
          background: "rgba(255,255,255,0.95)", padding: 10, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          Generando mapa de distancias... (esto puede tardar)
        </div>
      )}

      <MapView services={services} selected={selected} heatmapData={heatmapData} />

      {showGlobalMetrics && (
        <GlobalMetricsPanel onClose={() => setShowGlobalMetrics(false)} />
      )}
    </div>
  );
}
