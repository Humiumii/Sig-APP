import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function MapView({ services, selected }) {

  const mapRef = useRef();

  // Si el usuario selecciona un resultado de la lista → centrar mapa
  useEffect(() => {
    if (selected && mapRef.current) {
      mapRef.current.setView([selected.lat, selected.lon], 16);
    }
  }, [selected]);

  return (
    <MapContainer
      center={[-33.45, -70.66]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
      whenCreated={map => (mapRef.current = map)}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {services.map(svc => (
        <Marker key={svc.id} position={[svc.lat, svc.lon]} icon={icon}>
          <Popup>
            <b>{svc.name}</b><br />
            {svc.address}<br />
            {svc.phone}<br />
            <i>{svc.hours}</i>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
