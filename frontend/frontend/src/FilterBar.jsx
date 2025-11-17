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
        <option value="Maipú">Maipú</option>
        <option value="Puente Alto">Puente Alto</option>
        <option value="Las Condes">Las Condes</option>
        <option value="La Florida">La Florida</option>
        <option value="Ñuñoa">Ñuñoa</option>
        <option value="Recoleta">Recoleta</option>
        <option value="Macul">Macul</option>
        <option value="Cerro Navia">Cerro Navia</option>
        <option value="Independencia">Independencia</option>
        <option value="La Granja">La Granja</option>
        <option value="Lo Prado">Lo Prado</option>
        <option value="Renca">Renca</option>
        <option value="San Miguel">San Miguel</option>
        <option value="Vitacura">Vitacura</option>
        <option value="Quilicura">Quilicura</option>
        <option value="Pudahuel">Pudahuel</option>
        <option value="San Joaquín">San Joaquín</option>
        <option value="La Cisterna">La Cisterna</option>
        <option value="Cerrillos">Cerrillos</option>
        <option value="Lo Espejo">Lo Espejo</option>
        <option value="Pedro Aguirre Cerda">Pedro Aguirre Cerda</option>
        <option value="San Ramón">San Ramón</option>
        <option value="El Bosque">El Bosque</option>
        <option value="La Pintana">La Pintana</option>
        <option value="Puente Alto">Puente Alto</option>
        <option value="San Bernardo">San Bernardo</option>
        <option value="Buin">Buin</option>
        <option value="Calera de Tango">Calera de Tango</option>
        <option value="Melipilla">Melipilla</option>
        <option value="Talagante">Talagante</option>
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
