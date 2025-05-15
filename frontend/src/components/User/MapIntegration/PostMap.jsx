import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./PostMap.css";

// Sửa lỗi icon của Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 16);
  }, [coords, map]);
  return null;
}

export default function PostMap({ latitude, longitude, title, address }) {
  const coords = [latitude, longitude];
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="map-container">
      {/* Bản đồ */}
      <div style={{ height: "300px", width: "100%" }}>
        <MapContainer
          center={coords}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ChangeMapView coords={coords} />
          <Marker position={coords}>
            <Popup className="map-popup">
              <strong>{title}</strong>
              <br />
              {address}
              <br />
              <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                👉 Chỉ đường với Google Maps
              </a>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Nút chỉ đường - Cải tiến UI */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
        }}
      >
        <a href={googleMapsUrl} target="_blank" rel="noreferrer">
          <button className="map-button">Mở Google Maps chỉ đường</button>
        </a>
      </div>
    </div>
  );
}
