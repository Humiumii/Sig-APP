import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/api/services")
      .then(res => setServices(res.data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>LegalMap - Prototipo</h1>

      <ul>
        {services.map(s => (
          <li key={s.id}>
            {s.name} — {s.comuna}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
