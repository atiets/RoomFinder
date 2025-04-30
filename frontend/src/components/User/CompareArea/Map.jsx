import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

// Hàm thay đổi view bản đồ
function ChangeMapView({ coords, zoomLevel }) {
    const map = useMap();
    useEffect(() => {
        if (map) {
            map.setView(coords, zoomLevel);
        }
    }, [coords, zoomLevel, map]);

    return null;
}

export default function MapView({ selectedArea }) {
    const [position, setPosition] = useState([10.762622, 106.660172]); // Default: Ho Chi Minh City
    const [zoom, setZoom] = useState(6); // Default zoom for Vietnam
    const [info, setInfo] = useState(null);
  
    useEffect(() => {
      if (selectedArea) {
        const { coords, zoomLevel, info } = selectedArea;
        setPosition(coords);
        setZoom(zoomLevel);
        setInfo(info);
      }
    }, [selectedArea]);
  
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <div style={{ width: "100%", height: "80%", position: "relative" }}>
          {/* district-info nằm trong phần map */}
          <MapContainer
            center={position}
            zoom={zoom}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ChangeMapView coords={position} zoomLevel={zoom} />
            <Marker position={position} />
          </MapContainer>
  
          {/* district-info overlay */}
          {info && (
            <div className="district-info" style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              background: "rgba(0, 0, 0, 0.6)",
              borderRadius: "12px",
              padding: "16px",
              color: "#fff",
              maxWidth: "300px",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              fontSize: "16px"
            }}>
              <h3 style={{ fontSize: "20px", marginBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
                Thông tin giá: {info.districtName} - {info.provinceName}
              </h3>
              <p><strong>Biến động giá:</strong> {info.priceFluctuation}%</p>
              <p><strong>Giá trung bình:</strong> {info.commonPrice} triệu VND/m²</p>
            </div>
          )}
        </div>
  
        {/* Khoảng trống 20% còn lại phía dưới có thể chứa thêm nội dung */}
        <div style={{ height: "20%" }}>
          {/* Nếu cần nội dung thêm ở đây */}
        </div>
      </div>
    );
  }  