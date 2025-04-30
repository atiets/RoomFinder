import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import area from "../../../mockData/area";
import "./CompareChart.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CompareChart = () => {
  const location = useLocation();
  const initialSelectedAreas = location.state?.selectedAreas || [];

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedAreas, setSelectedAreas] = useState(initialSelectedAreas);

  useEffect(() => {
    if (initialSelectedAreas.length > 0) {
      const [province, district] = initialSelectedAreas[0].split(" - ");
      setSelectedProvince(province);
    }
  }, [initialSelectedAreas]);

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedAreas([]); // Reset areas when province changes
  };

  const handleToggleArea = (district) => {
    const areaName = `${selectedProvince} - ${district}`;
    setSelectedAreas((prevSelected) =>
      prevSelected.includes(areaName)
        ? prevSelected.filter((area) => area !== areaName) // Remove if already selected
        : [...prevSelected, areaName] // Add if not selected
    );
  };

  const getChartData = () => {
    const labels = [];
    const fluctuationData = [];
    const priceData = [];

    selectedAreas.forEach((areaStr) => {
      const [city, district] = areaStr.split(" - ");
      const data = area[city]?.districts[district];
      if (data) {
        labels.push(`${district} (${city})`);
        fluctuationData.push(data.priceFluctuation);
        priceData.push(data.commonPrice);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "Biến động giá (%)",
          data: fluctuationData,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
        {
          label: "Giá trung bình (triệu VND/m²)",
          data: priceData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  };

  return (
    <div className="chart-wrapper">
      <div className="left">
        <h2>Chọn khu vực</h2>

        <div className="select-section">
          <label htmlFor="province-select">Tỉnh / Thành phố:</label>
          <select id="province-select" value={selectedProvince} onChange={handleProvinceChange}>
            <option value="">-- Chọn tỉnh/thành --</option>
            {Object.keys(area).map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        {selectedProvince && (
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
      </div>

      <div className="right">
        <h2>Biểu đồ so sánh</h2>
        <div className="chart-container">
          <Bar
            data={getChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Giá & Biến động theo khu vực" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CompareChart;