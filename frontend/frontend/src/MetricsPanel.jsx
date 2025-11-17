import { useEffect, useState } from "react";
import axios from "axios";

export default function MetricsPanel({ comuna }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!comuna) {
      setMetrics(null);
      return;
    }

    setLoading(true);

    axios
      .get(`http://localhost:3001/api/metrics?comuna=${comuna}`)
      .then((res) => setMetrics(res.data))
      .catch((err) => console.error("Error obteniendo métricas:", err))
      .finally(() => setLoading(false));
  }, [comuna]);

  return (
    <div style={styles.wrap}>
      <h3>Métricas</h3>

      {!comuna && (
        <p style={{ color: "#666" }}>Selecciona una comuna para ver métricas.</p>
      )}

      {loading && <p>Cargando métricas...</p>}

      {metrics && !loading && (
        <div style={styles.box}>
          <p><b>Comuna:</b> {metrics.comuna}</p>
          <p><b>Total servicios:</b> {metrics.totalServicios}</p>
          <p><b>Población:</b> {metrics.poblacion ?? "—"}</p>
          <p><b>Superficie:</b> {metrics.superficie_km2 ?? "—"} km²</p>
          <p><b>Servicios por 100k hab.:</b> {metrics.servicios_por_100k ?? "—"}</p>
          <p><b>Densidad (serv/km²):</b> {metrics.densidad_servicios_por_km2 ?? "—"}</p>
          <p><b>Distancia promedio:</b> {metrics.distancia_promedio_km ?? "—"} km</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    position: "absolute",
    top: 100,     // Debajo de la FilterBar
    right: 20,
    width: 260,
    background: "white",
    padding: "14px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.20)",
    zIndex: 2000
  },
  box: {
    fontSize: "14px",
    marginTop: "8px",
    lineHeight: "1.4"
  },
  labelBtn: {
    padding: "6px 10px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#000000ff",
    cursor: "pointer"
  }
};
