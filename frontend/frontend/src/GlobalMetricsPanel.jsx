import { useEffect, useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

export default function GlobalMetricsPanel({ onClose }) {
  const [data, setData] = useState(null);
  const [comunaA, setComunaA] = useState("");
  const [comunaB, setComunaB] = useState("");
 
  useEffect(() => {
    axios
      .get("http://localhost:3001/api/metrics?all=true")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error cargando métricas globales:", err));
  }, []);
 
  // Variables calculadas para las comunas seleccionadas (evita useEffect extra)
  const selectedA = data?.find((d) => d.comuna === comunaA) ?? null;
  const selectedB = data?.find((d) => d.comuna === comunaB) ?? null;
   
  return (
    <div style={styles.backdrop}>
      <div style={styles.panel}>
        <h2>Métricas Globales</h2>
 
        <button onClick={onClose} style={styles.close}>
          Cerrar
        </button>
 
        {!data && <p>Cargando métricas...</p>}
 
        {data && (
          <>
            {/* TABLA */}
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Comuna</th>
                  <th>Servicios</th>
                  <th>Hab.</th>
                  <th>100k hab.</th>
                  <th>Densidad</th>
                </tr>
              </thead>
 
              <tbody>
                {data.map((row) => (
                  <tr key={row.comuna}>
                    <td>{row.comuna}</td>
                    <td>{row.total}</td>
                    <td>{row.poblacion ?? "—"}</td>
                    <td>{row.servicios_por_100k ?? "—"}</td>
                    <td>{row.densidad_servicios_por_km2 ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
 
            <h3 style={{ marginTop: "30px" }}>Servicios por Comuna</h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="comuna" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Servicios" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <h3 style={{ marginTop: "30px" }}>Servicios por 100k Habitantes</h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="comuna" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="servicios_por_100k" fill="#82ca9d" name="Servicios por 100k" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* ================================
                  COMPARADOR DE DOS COMUNAS
                ================================= */}
            <h3 style={{ marginTop: "40px" }}>Comparar dos comunas</h3>
 
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label>Comuna A:</label><br />
                <select
                  value={comunaA}
                  onChange={(e) => setComunaA(e.target.value)}
                  style={{ padding: "6px" }}
                >
                  <option value="">Seleccionar</option>
                  {data.map((c) => (
                    <option key={c.comuna} value={c.comuna}>{c.comuna}</option>
                  ))}
                </select>
              </div>
 
              <div>
                <label>Comuna B:</label><br />
                <select
                  value={comunaB}
                  onChange={(e) => setComunaB(e.target.value)}
                  style={{ padding: "6px" }}
                >
                  <option value="">Seleccionar</option>
                  {data.map((c) => (
                    <option key={c.comuna} value={c.comuna}>{c.comuna}</option>
                  ))}
                </select>
              </div>
            </div>
 
            {/* Panel comparativo */}
            {comunaA && comunaB && (
               <>
                {selectedA && selectedB ? (
                   <div style={styles.compareBox}>
                     <h4>Ficha comparativa</h4>
 
                     <table style={styles.compareTable}>
                       <tbody>
                         <tr>
                           <th>Métrica</th>
                           <th>{comunaA}</th>
                           <th>{comunaB}</th>
                         </tr>
                         <tr>
                           <td>Total servicios</td>
                           <td>{selectedA.total}</td>
                           <td>{selectedB.total}</td>
                         </tr>
                         <tr>
                           <td>Servicios por 100k</td>
                           <td>{selectedA.servicios_por_100k}</td>
                           <td>{selectedB.servicios_por_100k}</td>
                         </tr>
                         <tr>
                           <td>Densidad por km²</td>
                           <td>{selectedA.densidad_servicios_por_km2}</td>
                           <td>{selectedB.densidad_servicios_por_km2}</td>
                         </tr>
                         <tr>
                           <td>Población</td>
                           <td>{selectedA.poblacion}</td>
                           <td>{selectedB.poblacion}</td>
                         </tr>
                       </tbody>
                     </table>
 
                     {/* Gráfico comparativo */}
                     <h4 style={{ marginTop: "20px" }}>Comparación visual</h4>
                     <div style={{ width: "100%", height: 300 }}>
                       <ResponsiveContainer>
                         <BarChart data={[{
                           metric: "Servicios",
                           A: selectedA.total,
                           B: selectedB.total
                         },{
                           metric: "Por 100k hab.",
                           A: selectedA.servicios_por_100k,
                           B: selectedB.servicios_por_100k
                         },{
                           metric: "Densidad/km²",
                           A: selectedA.densidad_servicios_por_km2,
                           B: selectedB.densidad_servicios_por_km2
                         }]}
                         >
                           <CartesianGrid strokeDasharray="3 3" />
                           <XAxis dataKey="metric" />
                           <YAxis />
                           <Tooltip />
                           <Legend />
                           <Bar dataKey="A" fill="#8884d8" name={comunaA} />
                           <Bar dataKey="B" fill="#82ca9d" name={comunaB} />
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 ) : (
                   <p>Esperando datos para las comunas seleccionadas...</p>
                 )}
               </>
             )}
           </>
         )}
       </div>
     </div>
   );
 }
 
 const styles = {
   backdrop: {
     position: "fixed",
     inset: 0,
     background: "rgba(0,0,0,0.35)",
     zIndex: 5000,
     display: "flex",
     justifyContent: "center",
     alignItems: "center"
   },
   panel: {
     width: "70%",
     maxHeight: "90vh",
     overflowY: "auto",
     background: "white",
     padding: "20px",
     borderRadius: "10px",
     boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
     position: "relative"
   },
   table: {
     width: "100%",
     borderCollapse: "collapse",
     marginTop: "20px"
   },
   compareBox: {
     background: "#f8f8f8",
     padding: "15px",
     borderRadius: "10px",
     boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
     marginBottom: "20px"
   },
   compareTable: {
     width: "100%",
     borderCollapse: "collapse",
     marginTop: "10px"
   },
   close: {
     position: "absolute",
     top: 15,
     right: 15,
     padding: "6px 10px",
     border: "1px solid #ccc",
     background: "black",
     borderRadius: "6px",
     cursor: "pointer"
   }
 };
