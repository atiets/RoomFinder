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
import { getDistrictCoordinatesByCity } from "../../../redux/postAPI"; 
import "./CompareChart.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CompareChart = () => {
  const location = useLocation();
  const initialSelectedAreas = location.state?.selectedAreas || [];
  const initialSelectedDistrict = location.state?.selectedDistrict || null;
  const initialSelectedProvince = location.state?.selectedProvince || "";

  const [selectedProvince, setSelectedProvince] = useState(initialSelectedProvince);
  const [selectedAreas, setSelectedAreas] = useState(initialSelectedAreas);
  const [districtCoordinatesData, setDistrictCoordinatesData] = useState({});
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDistrictCoordinatesByCity();
        setDistrictCoordinatesData(data);
        setProvinces(Object.keys(data));
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (initialSelectedDistrict && initialSelectedProvince) {
      const areaKey = `${initialSelectedProvince} - ${initialSelectedDistrict}`;
      if (!selectedAreas.includes(areaKey)) {
        setSelectedAreas([areaKey]);
      }
    }
  }, [initialSelectedDistrict, initialSelectedProvince, selectedAreas]);

  const handleToggleArea = (district) => {
    const areaName = `${selectedProvince} - ${district}`;
    if (selectedAreas.includes(areaName)) {
      setSelectedAreas([]);
    } else {
      setSelectedAreas([areaName]);
    }
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedAreas([]);
  };

  const getChartData = () => {
    const labels = [];
    const fluctuationData = [];
    const priceData = [];

    selectedAreas.forEach((areaStr) => {
      const [province, district] = areaStr.split(" - ");
      const data = districtCoordinatesData[province]?.[district];

      if (data) {
        labels.push(`${district} (${province})`);
        fluctuationData.push(data.priceFluctuation || 0);
        priceData.push(data.commonPrice || 0);
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
          <select
            id="province-select"
            value={selectedProvince}
            onChange={handleProvinceChange}
          >
            <option value="">-- Chọn tỉnh/thành --</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        {selectedProvince &&
          districtCoordinatesData[selectedProvince] && (
            <div className="district-buttons">
              {Object.keys(districtCoordinatesData[selectedProvince]).map(
                (district) => {
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
                }
              )}
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