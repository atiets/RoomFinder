import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import area from "../../../mockData/area";
import MapView from "./Map";
import "./Compare.css";

const centerVN = { lat: 14.0583, lng: 108.2772 }; // Tâm Việt Nam

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  const staticErrorMessage = "Something went wrong!";

  const componentDidCatch = (error, info) => {
    setHasError(true);
    console.error("Error caught by error boundary:", error, info);
  };

  if (hasError) {
    return <div>{staticErrorMessage}</div>;
  }

  return children;
};

const CompareArea = () => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [mapCenter, setMapCenter] = useState(centerVN);
  const [mapZoom, setMapZoom] = useState(6);
  const navigate = useNavigate();

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedAreas([]);

    if (province && area[province]) {
      setMapCenter(area[province].position);
      setMapZoom(11);
    }
  };

  const handleToggleArea = (district) => {
    const areaName = `${selectedProvince} - ${district}`;
    setSelectedAreas((prev) =>
      prev.includes(areaName)
        ? prev.filter((a) => a !== areaName)
        : [...prev, areaName]
    );

    const districtPos = area[selectedProvince]?.districts[district];
    if (districtPos) {
      setMapCenter(districtPos);
      setMapZoom(13);
    }
  };

  const handleViewPrice = () => {
    if (selectedAreas.length > 0) {
      navigate("/compare-chart", {
        state: { selectedAreas, area },
      });
    } else {
      alert("Vui lòng chọn ít nhất một khu vực.");
    }
  };

  return (
    <div className="compare-wrapper">
      <div className="compare-left">
        <h2 className="compare-title">So sánh giá phòng trọ</h2>
        <p className="compare-subtitle">
          Cập nhật dữ liệu giá mới nhất tháng 04/2025 tại các thành phố lớn
        </p>

        <div className="select-section">
          <label htmlFor="province-select" className="select-label">
            Chọn tỉnh/thành phố:
          </label>
          <select
            id="province-select"
            className="province-select"
            value={selectedProvince}
            onChange={handleProvinceChange}
          >
            <option value="">-- Chọn tỉnh/thành --</option>
            {Object.keys(area).map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        {selectedProvince && area[selectedProvince] && area[selectedProvince].districts && (
          <div className="district-buttons">
            {Object.keys(area[selectedProvince].districts).map((district) => {
              const areaKey = `${selectedProvince} - ${district}`;
              return (
                <button
                  key={district}
                  className={`district-btn ${selectedAreas.includes(areaKey) ? "selected" : ""}`}
                  onClick={() => handleToggleArea(district)}
                >
                  {district}
                </button>
              );
            })}
          </div>
        )}

        <button className="view-price-btn" onClick={handleViewPrice}>
          Xem giá ngay
        </button>

        <div className="compare-info">
          <p>✔ Dữ liệu từ 100 triệu tin đăng BĐS</p>
          <p>✔ Giá giao dịch thực tế</p>
          <p>✔ Chi tiết đến quận, phường, đường</p>
          <p>✔ Cập nhật hằng tháng</p>
        </div>
      </div>

      <div className="compare-right">
      <div className="compare-right">
      <MapView
  selectedArea={{
    coords: [mapCenter.lat, mapCenter.lng], 
    zoomLevel: mapZoom
  }}
/>
</div>

      </div>
    </div>
  );
};

const CompareAreaWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <CompareArea />
    </ErrorBoundary>
  );
};

export default CompareAreaWithErrorBoundary;