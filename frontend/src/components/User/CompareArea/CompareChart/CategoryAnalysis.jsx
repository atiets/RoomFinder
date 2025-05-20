import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { formatCurrency } from './utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Màu sắc cho biểu đồ
const COLORS = ['#81c784', '#ffb74d', '#64b5f6', '#e57373', '#ba68c8'];

const CategoryAnalysis = ({ data, selectedCategory, selectedTransaction }) => {
  // Chuẩn bị dữ liệu cho biểu đồ tròn (phân bổ giá theo loại BĐS)
  const pieChartData = Object.entries(data).map(([category, transactions]) => {
    // Lấy giá cho loại giao dịch được chọn (nếu có)
    const transactionData = transactions[selectedTransaction];
    return {
      name: category,
      value: transactionData ? transactionData.commonPrice : 0,
      count: transactionData ? transactionData.count : 0,
      fluctuation: transactionData ? transactionData.priceFluctuation : 0,
    };
  }).filter(item => item.value > 0); // Chỉ hiển thị những loại có dữ liệu
  
  // Chuẩn bị dữ liệu cho biểu đồ cột (biến động giá theo loại BĐS)
  const barChartData = pieChartData.map(item => ({
    name: item.name,
    fluctuation: item.fluctuation,
    color: item.fluctuation >= 0 ? '#81c784' : '#e57373', // Màu xanh nếu tăng, đỏ nếu giảm
  }));

  // Format dữ liệu cho Chart.js
  const pieData = {
    labels: pieChartData.map(item => item.name),
    datasets: [
      {
        data: pieChartData.map(item => item.value),
        backgroundColor: COLORS,
        borderColor: COLORS.map(color => color.replace(')', ', 0.8)')),
        borderWidth: 1
      }
    ]
  };

  const barData = {
    labels: barChartData.map(item => item.name),
    datasets: [
      {
        label: 'Biến động giá (%)',
        data: barChartData.map(item => item.fluctuation),
        backgroundColor: barChartData.map(item => item.color)
      }
    ]
  };

  // Tùy chọn cho biểu đồ
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          generateLabels: function(chart) {
            const labels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
            return labels.map((label, i) => {
              const price = pieChartData[i]?.value.toFixed(2) || 0;
              label.text = `${label.text} (${price} triệu/m²)`;
              return label;
            });
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = pieChartData[context.dataIndex];
            return [
              `${item.name}: ${item.value.toFixed(2)} triệu/m²`,
              `Biến động: ${item.fluctuation > 0 ? '+' : ''}${item.fluctuation.toFixed(2)}%`,
              `Số tin đăng: ${item.count}`
            ];
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Biến động: ${context.raw > 0 ? '+' : ''}${context.raw.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Biến động giá (%)'
        }
      }
    }
  };

  return (
    <Box className="category-analysis">
      {Object.keys(data).length > 0 ? (
        <Grid container spacing={2}>
          {/* Biểu đồ tròn - Phân bổ giá */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" className="chart-title" align="center">
              Phân bổ giá theo loại BĐS
            </Typography>
            <Box height={300}>
              <Pie data={pieData} options={pieOptions} />
            </Box>
          </Grid>
          
          {/* Biểu đồ cột - Biến động giá */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" className="chart-title" align="center">
              Biến động giá theo loại BĐS (%)
            </Typography>
            <Box height={300}>
              <Bar data={barData} options={barOptions} />
            </Box>
          </Grid>
          
          {/* Bảng chi tiết */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" className="data-summary" mt={2}>
              {pieChartData.length > 0 ? (
                <>
                  <span className="highlight">{selectedCategory}</span> có giá 
                  trung bình là <span className="highlight">{formatCurrency(pieChartData.find(item => item.name === selectedCategory)?.value || 0)} triệu/m²</span>, 
                  {pieChartData.find(item => item.name === selectedCategory)?.fluctuation > 0 ? ' tăng ' : ' giảm '}
                  <span className="highlight">{Math.abs((pieChartData.find(item => item.name === selectedCategory)?.fluctuation || 0)).toFixed(2)}%</span> so với tháng trước.
                </>
              ) : (
                'Không có đủ dữ liệu để phân tích.'
              )}
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Box className="no-data-message">
          <Typography variant="body1" align="center">
            Không có đủ dữ liệu để phân tích theo loại bất động sản
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CategoryAnalysis;