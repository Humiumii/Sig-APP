// src/IsoPanel.jsx
import { useState } from "react";

export default function IsoPanel({ onGenerate, onClear }) {
  const [type, setType] = useState("notaria");
  const [points, setPoints] = useState(500);

  function handleGenerate() {
    onGenerate({ type, points });
  }

  return (
    <div style={styles.container}>
      <h3>Generar mapa de distancia</h3>

      <label style={styles.label}>Tipo de servicio</label>
      <select value={type} onChange={e => setType(e.target.value)} style={styles.select}>
        <option value="notaria">Notarías</option>
        <option value="tribunal">Tribunales</option>
        <option value="fiscalia">Fiscalías</option>
        <option value="registro_civil">Registro Civil</option>
        <option value="caj">CAJ</option>
        <option value="centro_mediacion">Centros de Mediación</option>
      </select>

      <label style={styles.label}>Puntos (total)</label>
      <select value={points} onChange={e => setPoints(Number(e.target.value))} style={styles.select}>
        <option value={300}>300 (rápido)</option>
        <option value={500}>500 (balance)</option>
        <option value={800}>800 (más detalle)</option>
      </select>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleGenerate} style={styles.btnPrimary}>Generar</button>
        <button onClick={onClear} style={styles.btnSecondary}>Limpiar</button>
      </div>

      <small style={{ color: "#666" }}>
        Nota: se realizan peticiones a OpenRouteService (API key local). El proceso puede tardar.
      </small>
    </div>
  );
}

const styles = {
  container: {
    position: "absolute",
    bottom: "20px",
    left: "20px",
    width: "260px",
    padding: "12px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
    zIndex: 2200
  },
  label: {
    display: "block",
    marginTop: 6,
    marginBottom: 4,
    fontSize: 12,
    color: "#333"
  },
  select: {
    width: "100%",
    padding: "6px",
    marginBottom: 6
  },
  btnPrimary: {
    padding: "8px 10px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  btnSecondary: {
    padding: "8px 10px",
    background: "#eee",
    color: "#222",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  }
};
