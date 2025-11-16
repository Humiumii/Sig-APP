export default function FilterBar({ filters, setFilters }) {

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function clearFilters() {
    setFilters({
      type: "",
      comuna: "",
      q: ""
    });
  }

  return (
    <div style={styles.container}>
      
      {/* Tipo de servicio */}
      <select name="type" value={filters.type} onChange={handleChange}>
        <option value="">Tipo de servicio</option>
        <option value="notaria">Notaría</option>
        <option value="tribunal">Tribunal</option>
        <option value="fiscalia">Fiscalía</option>
        <option value="registro_civil">Registro Civil</option>
        <option value="centro_mediacion">Centro de Mediación</option>
        <option value="caj">CAJ</option>
      </select>

      {/* Comuna */}
      <select name="comuna" value={filters.comuna} onChange={handleChange}>
        <option value="">Comuna</option>
        <option value="Santiago">Santiago</option>
        <option value="Estación Central">Estación Central</option>
        <option value="Providencia">Providencia</option>
      </select>

      {/* Búsqueda libre */}
      <input
        type="text"
        name="q"
        placeholder="Buscar..."
        value={filters.q}
        onChange={handleChange}
      />

      {/* Botón limpiar */}
      <button onClick={clearFilters}>Limpiar</button>
    </div>
  );
}

const styles = {
  container: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1000,
    background: "white",
    padding: "10px",
    borderRadius: "8px",
    display: "flex",
    gap: "5px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
  }
};
