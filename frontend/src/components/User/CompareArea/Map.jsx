// Map.js
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const provinceCoordinates = {
  "TP.HCM": { lat: 10.8231, lng: 106.6297 },
  "Hà Nội": { lat: 21.0285, lng: 105.8542 },
  "Đà Nẵng": { lat: 16.0544, lng: 108.2022 },
  "Cần Thơ": { lat: 10.0455, lng: 105.7461 },
  "Bình Dương": { lat: 10.9626, lng: 106.6609 },
  "Hải Phòng": { lat: 20.8449, lng: 106.6884 },
  "Thừa Thiên Huế": { lat: 16.4625, lng: 107.5843 },
  "Khánh Hòa": { lat: 12.2491, lng: 109.1911 },
  "Bà Rịa - Vũng Tàu": { lat: 10.3587, lng: 107.0732 },
};

const Map = ({ selectedProvince }) => {
  const position = provinceCoordinates[selectedProvince];

  return (
    <div className="map-container">
      <MapContainer center={position || [14.0583, 108.2772]} zoom={6} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {position && (
          <Marker position={position}>
            <Popup>{selectedProvince}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;