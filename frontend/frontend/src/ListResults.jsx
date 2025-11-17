export default function ListResults({ services, onSelect, onClose }) {
  return (
    <div style={styles.container}>
      
      {/* Botón cerrar */}
      <button style={styles.closeBtn} onClick={onClose}>✖</button>

      <h3>Resultados ({services.length})</h3>

      {services.length === 0 && <p>No hay servicios con estos filtros.</p>}

      <ul style={styles.list}>
        {services.map(svc => (
          <li 
            key={svc.id} 
            style={styles.item}
            onClick={() => onSelect(svc)}
          >
            <b>{svc.name}</b><br />
            <span>{svc.type} — {svc.comuna}</span><br />
            <small>{svc.address}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    position: "absolute",
    top: "90px",
    left: "20px",
    width: "300px",
    maxHeight: "90vh",
    overflowY: "auto",
    zIndex: 1500,
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
  },

  closeBtn: {
    position: "absolute",
    top: "5px",
    right: "8px",
    background: "black",
    border: "none",
    fontSize: "18px",
    cursor: "pointer"
  },

  list: {
    listStyle: "none",
    padding: 0,
    margin: "30px 0 0 0"
  },

  item: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    cursor: "pointer"
  }
};
