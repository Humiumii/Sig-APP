import { useState, useEffect } from "react";
import axios from "axios";

import MapView from "./MapView";
import FilterBar from "./FilterBar";
import ListResults from "./ListResults";

export default function App() {
  const [filters, setFilters] = useState({
    type: "",
    comuna: "",
    q: ""
  });

  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);

  // Controla si se muestra o no el panel de lista
  const [showList, setShowList] = useState(true);

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

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <FilterBar filters={filters} setFilters={setFilters} />

      {/* Mostrar/Ocultar panel */}
      {showList ? (
        <ListResults
          services={services}
          onSelect={(svc) => {
            setSelected(svc);
            // opcional: cerrar panel al seleccionar:
            // setShowList(false);
          }}
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

      <MapView services={services} selected={selected} />
    </div>
  );
}
