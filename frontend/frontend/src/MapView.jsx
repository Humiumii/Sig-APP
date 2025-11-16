import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// --- Componente que centra el mapa ---
function MapCenterer({ selected }) {
  const map = useMap();

  useEffect(() => {
    if (!selected) return;

    const lat = parseFloat(selected.lat);
    const lon = parseFloat(selected.lon);

    if (!isNaN(lat) && !isNaN(lon)) {
      map.setView([lat, lon], 17, { animate: true });
    }
  }, [selected, map]);

  return null;
}

export default function MapView({ services, selected }) {

  // Guardamos refs de todos los markers
  const markerRefs = useRef({});

  // Cuando selected cambia → abrir popup del marker correcto
  useEffect(() => {
    if (!selected) return;

    const ref = markerRefs.current[selected.id];

    if (ref && ref.openPopup) {
      ref.openPopup();    // ← Esto abre el popup automáticamente
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

      {services.map(svc => {
        const lat = parseFloat(svc.lat);
        const lon = parseFloat(svc.lon);

        if (isNaN(lat) || isNaN(lon)) return null;

        return (
          <Marker
            key={svc.id}
            position={[lat, lon]}
            icon={icon}

            // Guardar referencia del marker
            ref={(ref) => {
              if (ref) markerRefs.current[svc.id] = ref;
            }}
          >
            <Popup>
              <b>{svc.name}</b><br />
              {svc.address}<br />
              {svc.comuna}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
