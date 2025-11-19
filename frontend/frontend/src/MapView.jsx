// src/MapView.jsx
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Centra el mapa cuando selected cambia
function MapCenterer({ selected }) {
  const map = useMap();
  useEffect(() => {
    if (!selected) return;
    const lat = parseFloat(selected.lat);
    const lon = parseFloat(selected.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      map.setView([lat, lon], 16, { animate: true });
    }
  }, [selected, map]);
  return null;
}

// Color según distancia (metros)
function colorForDistance(d) {
  // define rangos: 0-500 (verde), 500-1200 (amarillo), >1200 (rojo)
  if (d <= 500) return "#2ecc71";
  if (d <= 1200) return "#f1c40f";
  return "#e74c3c";
}

export default function MapView({ services = [], selected, heatmapData = [] }) {
  const markerRefs = useRef({});

  // abrir popup del seleccionado
  useEffect(() => {
    if (!selected) return;
    const ref = markerRefs.current[selected.id];
    if (ref && ref.openPopup) {
      setTimeout(() => {
        // abrir con pequeño delay para asegurar que el marker exista
        try { ref.openPopup(); } catch {}
      }, 250);
    }
  }, [selected]);

  return (
    <MapContainer
      center={[-33.45, -70.66]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MapCenterer selected={selected} />

      {/* marcadores */}
      {services.map(svc => {
        const lat = parseFloat(svc.lat);
        const lon = parseFloat(svc.lon);
        if (isNaN(lat) || isNaN(lon)) return null;
        return (
          <Marker
            key={svc.id}
            position={[lat, lon]}
            icon={icon}
            ref={(r) => { if (r) markerRefs.current[svc.id] = r; }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <b>{svc.name}</b><br />
                <small>{svc.type} — {svc.comuna}</small><br />
                <small>{svc.address}</small>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* heatmap: círculos coloreados */}
      {Array.isArray(heatmapData) && heatmapData.map((p, i) => {
        const lat = parseFloat(p.lat);
        const lon = parseFloat(p.lon);
        const dist = Number(p.distance || 0);
        if (isNaN(lat) || isNaN(lon)) return null;

        const color = colorForDistance(dist);
        // radius visual: puedes ajustarlo (metros en el mapa)
        const radius = 200; // tamaño fijo; si quieres variable usa dist/50 por ej

        return (
          <Circle
            key={`hm-${i}`}
            center={[lat, lon]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.6,
              weight: 0.5
            }}
          />
        );
      })}
    </MapContainer>
  );
}
