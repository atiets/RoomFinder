import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icon issue
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function ChangeMapView({ coords, zoomLevel }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.flyTo(coords, zoomLevel, { animate: true, duration: 1.5 });
    }
  }, [coords, zoomLevel, map]);

  return null;
}

export default function MapView({ selectedArea }) {
  // Tọa độ mặc định cho trung tâm Việt Nam
  const vietnamCenter = [14.0583, 108.2772];
  const [position, setPosition] = useState(vietnamCenter);
  const [zoom, setZoom] = useState(6); // Default zoom (toàn Việt Nam)

  useEffect(() => {
    if (selectedArea && selectedArea.coords) {
      setPosition(selectedArea.coords);
      setZoom(selectedArea.zoomLevel || 6);
    } else {
      // Nếu không có vùng được chọn, hiển thị toàn Việt Nam
      setPosition(vietnamCenter);
      setZoom(6);
    }
  }, [selectedArea]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{ width: "100%", height: "80%", position: "relative" }}>
        <MapContainer
          center={position}
          zoom={zoom}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ChangeMapView coords={position} zoomLevel={zoom} />
          {/* Luôn hiển thị marker tại vị trí hiện tại */}
          <Marker position={position} />
        </MapContainer>

        {/* Chỉ hiển thị thông tin khi đã chọn quận/huyện */}
        {selectedArea && selectedArea.info && (
          <div
            className="district-info"
            style={{
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
              fontSize: "16px",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                marginBottom: "10px",
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                paddingBottom: "6px",
              }}
            >
              Thông tin giá: {selectedArea.info}
            </h3>
            {selectedArea.priceInfo && (
              <>
                <p>
                  <strong>Biến động giá:</strong>{" "}
                  {selectedArea.priceInfo.priceFluctuation}%
                </p>
                <p>
                  <strong>Giá trung bình:</strong>{" "}
                  {selectedArea.priceInfo.commonPrice} triệu VND/m²
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ height: "20%" }}>
        {/* Thêm nội dung khác ở đây nếu cần */}
      </div>
    </div>
  );
}
