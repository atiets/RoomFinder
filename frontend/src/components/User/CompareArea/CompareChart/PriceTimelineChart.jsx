import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PriceTimelineChart = ({ data }) => {
  const theme = useTheme();
  
  // Xử lý nếu không có dữ liệu
  if (!data || data.length === 0) {
    return (
      <Box className="no-chart-data">
        <Typography variant="subtitle1" align="center">
          Không có đủ dữ liệu để hiển thị biểu đồ theo thời gian
        </Typography>
      </Box>
    );
  }
  
  // Lọc ra những tháng có dữ liệu
  const filteredData = data.filter(item => item && item.avgPrice !== null);
  
  // Chuẩn bị dữ liệu cho Chart.js
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Giá thấp nhất',
        data: data.map(item => item.minPrice),
        fill: true,
        backgroundColor: 'rgba(200, 230, 201, 0.2)',
        borderColor: '#81c784',
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: 'Giá trung bình',
        data: data.map(item => item.avgPrice),
        fill: false,
        borderColor: '#4caf50',
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7
      },
      {
        label: 'Giá cao nhất',
        data: data.map(item => item.maxPrice),
        fill: false,
        borderColor: '#ff9800',
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7
      }
    ]
  };

  // Cấu hình biểu đồ
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = data[context.dataIndex];
            const value = context.raw !== null ? context.raw.toFixed(2) + ' triệu/m²' : 'Không có dữ liệu';
            const count = item.count ? `(${item.count} tin đăng)` : '';
            return `${context.dataset.label}: ${value} ${count}`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Triệu VND/m²'
        }
      }
    }
  };

  return (
    <Box className="timeline-chart-container" height={400}>
      {filteredData.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <Box className="no-chart-data">
          <Typography variant="subtitle1" align="center">
            Không có đủ dữ liệu để hiển thị biểu đồ theo thời gian
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PriceTimelineChart;