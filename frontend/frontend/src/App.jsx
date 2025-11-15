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

  // Cargar servicios filtrados
  useEffect(() => {
    const params = {};

    if (filters.type !== "") params.type = filters.type;
    if (filters.comuna !== "") params.comuna = filters.comuna;
    if (filters.q !== "") params.q = filters.q;

    axios
      .get("http://localhost:3001/api/services", { params })
      .then(res => {
        setServices(res.data);   // ← AQUÍ SÍ LLEGA LA LISTA FILTRADA
        setSelected(null);       // reset seleccionado si cambias filtros
      })
      .catch(err => console.log(err));
  }, [filters]);

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <FilterBar filters={filters} setFilters={setFilters} />
      <ListResults services={services} onSelect={setSelected} />
      <MapView services={services} selected={selected} />
    </div>
  );
}