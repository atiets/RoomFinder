import React, { useState } from "react";
import "./Compare.css";
import CompareChart from "./CompareChart";

const mockData = {
  "TP.HCM": {
    "Quận 1": { average: 4500000, area: 18 },
    "Quận 3": { average: 4300000, area: 19 },
    "Quận 7": { average: 4700000, area: 21 },
    "Thủ Đức": { average: 3500000, area: 22 },
    "Gò Vấp": { average: 3000000, area: 20 },
    "Tân Bình": { average: 3200000, area: 19 },
    "Bình Thạnh": { average: 4000000, area: 21 },
  },
  "Hà Nội": {
    "Cầu Giấy": { average: 3900000, area: 18 },
    "Đống Đa": { average: 4200000, area: 17 },
    "Ba Đình": { average: 4600000, area: 19 },
    "Thanh Xuân": { average: 3700000, area: 20 },
    "Hà Đông": { average: 3400000, area: 22 },
  },
  "Đà Nẵng": {
    "Hải Châu": { average: 3600000, area: 20 },
    "Thanh Khê": { average: 3300000, area: 21 },
    "Liên Chiểu": { average: 3100000, area: 23 },
  },
  "Cần Thơ": {
    "Ninh Kiều": { average: 3000000, area: 22 },
    "Bình Thủy": { average: 2700000, area: 24 },
    "Cái Răng": { average: 2500000, area: 23 },
  },
  "Bình Dương": {
    "Thủ Dầu Một": { average: 3200000, area: 20 },
    "Dĩ An": { average: 3100000, area: 21 },
    "Thuận An": { average: 3000000, area: 22 },
  },
  "Hải Phòng": {
    "Ngô Quyền": { average: 3400000, area: 19 },
    "Lê Chân": { average: 3300000, area: 20 },
    "Hồng Bàng": { average: 3100000, area: 21 },
  },
  "Thừa Thiên Huế": {
    "TP. Huế": { average: 2800000, area: 23 },
    "Hương Thủy": { average: 2600000, area: 25 },
  },
  "Khánh Hòa": {
    "Nha Trang": { average: 3500000, area: 22 },
    "Cam Ranh": { average: 2700000, area: 24 },
  },
  "Bà Rịa - Vũng Tàu": {
    "TP. Vũng Tàu": { average: 3600000, area: 21 },
    "Bà Rịa": { average: 3000000, area: 22 },
  },
};

const CompareArea = () => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedAreas, setSelectedAreas] = useState([]);

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
    setSelectedAreas([]); // reset khu vực khi đổi tỉnh
  };

  const handleToggleArea = (district) => {
    const areaName = `${selectedProvince} - ${district}`;
    setSelectedAreas((prev) =>
      prev.includes(areaName)
        ? prev.filter((a) => a !== areaName)
        : [...prev, areaName]
    );
  };

  const sortedAreas = [...selectedAreas].sort((a, b) => {
    const [provA, distA] = a.split(" - ");
    const [provB, distB] = b.split(" - ");
    return (
      mockData[provB][distB].average - mockData[provA][distA].average
    );
  });

  return (
    <div className="compare-area-container">
      <h2>So sánh giá phòng trọ giữa các khu vực</h2>

      {/* Chọn tỉnh/thành */}
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="province-select">Chọn tỉnh/thành: </label>
        <select
          id="province-select"
          value={selectedProvince}
          onChange={handleProvinceChange}
        >
          <option value="">-- Chọn tỉnh/thành phố --</option>
          {Object.keys(mockData).map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      {/* Chọn khu vực (quận/huyện) */}
      {selectedProvince && (
        <div className="area-buttons">
          {Object.keys(mockData[selectedProvince]).map((district) => {
            const areaKey = `${selectedProvince} - ${district}`;
            return (
              <button
                key={district}
                className={`area-btn ${
                  selectedAreas.includes(areaKey) ? "selected" : ""
                }`}
                onClick={() => handleToggleArea(district)}
              >
                {district}
              </button>
            );
          })}
        </div>
      )}

      {/* Hiển thị bảng và biểu đồ nếu đã chọn khu vực */}
      {selectedAreas.length > 0 ? (
        <>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Khu vực</th>
                <th>Giá trung bình (VND)</th>
                <th>Diện tích TB (m²)</th>
                <th>Giá / m²</th>
              </tr>
            </thead>
            <tbody>
              {sortedAreas.map((areaKey) => {
                const [province, district] = areaKey.split(" - ");
                const data = mockData[province][district];
                return (
                  <tr key={areaKey}>
                    <td>{areaKey}</td>
                    <td>{data.average.toLocaleString()}</td>
                    <td>{data.area}</td>
                    <td>
                      {Math.round(data.average / data.area).toLocaleString()}đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <CompareChart
            selectedAreas={sortedAreas}
            mockData={Object.entries(mockData).reduce((acc, [prov, districts]) => {
              Object.entries(districts).forEach(([dist, val]) => {
                acc[`${prov} - ${dist}`] = val;
              });
              return acc;
            }, {})}
          />
        </>
      ) : (
        <p className="hint">Chọn tỉnh và khu vực để xem bảng và biểu đồ so sánh</p>
      )}
    </div>
  );
};

export default CompareArea;