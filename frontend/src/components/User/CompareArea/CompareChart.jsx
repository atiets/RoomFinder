// src/components/CompareChart.jsx
import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CompareChart = ({ selectedAreas, mockData }) => {
  const areaNames = selectedAreas;
  const avgPrices = areaNames.map((area) => mockData[area].average);
  const pricePerSqm = areaNames.map((area) =>
    Math.round(mockData[area].average / mockData[area].area)
  );

  const data = {
    labels: areaNames,
    datasets: [
      {
        label: "Giá trung bình (VND)",
        data: avgPrices,
        backgroundColor: "#4fc3f7",
      },
      {
        label: "Giá / m²",
        data: pricePerSqm,
        backgroundColor: "#ba68c8",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString() + "đ";
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        Biểu đồ so sánh giá phòng
      </h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default CompareChart;