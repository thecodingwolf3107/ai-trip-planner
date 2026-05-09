import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});


function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, 10);

  return null;
}

function Map({ position, markers }) {
  return (
    <MapContainer
    
      center={position}
      zoom={10}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      {markers.map((place, index) => (

        <Marker
          key={index}
          position={[place.lat, place.lon]}
        >
          <Popup>{place.name}</Popup>
        </Marker>

      ))}

      <ChangeMapView center={position} />
    </MapContainer>
  );
}

export default Map;