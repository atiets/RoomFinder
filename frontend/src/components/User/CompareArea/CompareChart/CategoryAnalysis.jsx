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

// Mapping tên category để hiển thị
const CATEGORY_DISPLAY_NAMES = {
  'Căn hộ/chung cư': 'Căn hộ/chung cư',
  'Nhà ở': 'Nhà ở', 
  'Đất': 'Đất',
  'Văn phòng, mặt bằng kinh doanh': 'Văn phòng',
  'phòng trọ': 'Phòng trọ'
};

const CategoryAnalysis = ({ data, selectedCategory, selectedTransaction }) => {
  console.log("CategoryAnalysis - Input data:", { data, selectedCategory, selectedTransaction });
  
  // Kiểm tra dữ liệu đầu vào
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    console.log("CategoryAnalysis - No valid data provided");
    return (
      <Box className="category-analysis">
        <Box className="no-data-message">
          <Typography variant="body1" align="center">
            Không có đủ dữ liệu để phân tích theo loại bất động sản
          </Typography>
        </Box>
      </Box>
    );
  }

  // Chuẩn bị dữ liệu cho biểu đồ tròn (phân bổ giá theo loại BĐS)
  const pieChartData = Object.entries(data).map(([category, transactions]) => {
    console.log(`Processing category: ${category}`, transactions);
    
    // Kiểm tra transactions có phải là object không
    if (!transactions || typeof transactions !== 'object') {
      console.log(`Invalid transactions data for category: ${category}`);
      return {
        name: CATEGORY_DISPLAY_NAMES[category] || category,
        value: 0,
        count: 0,
        fluctuation: 0,
      };
    }
    
    // Lấy giá cho loại giao dịch được chọn
    const transactionData = transactions[selectedTransaction];
    console.log(`Transaction data for ${category} - ${selectedTransaction}:`, transactionData);
    
    return {
      name: CATEGORY_DISPLAY_NAMES[category] || category,
      value: transactionData?.commonPrice || 0,
      count: transactionData?.count || 0,
      fluctuation: transactionData?.priceFluctuation || 0,
    };
  }).filter(item => item.value > 0); // Chỉ hiển thị những loại có dữ liệu
  
  console.log("CategoryAnalysis - Processed pieChartData:", pieChartData);
  
  // Chuẩn bị dữ liệu cho biểu đồ cột (biến động giá theo loại BĐS)
  const barChartData = pieChartData.map(item => ({
    name: item.name,
    fluctuation: item.fluctuation,
    color: item.fluctuation >= 0 ? '#81c784' : '#e57373', // Màu xanh nếu tăng, đỏ nếu giảm
  }));

  // Kiểm tra nếu không có dữ liệu để hiển thị
  if (pieChartData.length === 0) {
    return (
      <Box className="category-analysis">
        <Box className="no-data-message">
          <Typography variant="body1" align="center">
            Không có dữ liệu cho loại giao dịch "{selectedTransaction}" trong khu vực này
          </Typography>
        </Box>
      </Box>
    );
  }

  // Format dữ liệu cho Chart.js
  const pieData = {
    labels: pieChartData.map(item => item.name),
    datasets: [
      {
        data: pieChartData.map(item => item.value),
        backgroundColor: COLORS.slice(0, pieChartData.length),
        borderColor: COLORS.slice(0, pieChartData.length).map(color => color.replace(')', ', 0.8)')),
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
              const dataItem = pieChartData[i];
              if (dataItem) {
                const price = dataItem.value?.toFixed(2) || '0.00';
                label.text = `${dataItem.name} (${price} triệu/m²)`;
              }
              return label;
            });
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = pieChartData[context.dataIndex];
            if (!item) return '';
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

  // Tìm thông tin về category được chọn
  const selectedCategoryData = pieChartData.find(item => {
    const displayName = CATEGORY_DISPLAY_NAMES[selectedCategory] || selectedCategory;
    return item.name === displayName;
  });

  console.log("CategoryAnalysis - Selected category data:", selectedCategoryData);

  return (
    <Box className="category-analysis">
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
            {selectedCategoryData ? (
              <>
                <span className="highlight">
                  {CATEGORY_DISPLAY_NAMES[selectedCategory] || selectedCategory}
                </span> có giá 
                trung bình là <span className="highlight">
                  {formatCurrency(selectedCategoryData.value)} triệu/m²
                </span>, 
                {selectedCategoryData.fluctuation > 0 ? ' tăng ' : selectedCategoryData.fluctuation < 0 ? ' giảm ' : ' không đổi '}
                <span className="highlight">
                  {Math.abs(selectedCategoryData.fluctuation).toFixed(2)}%
                </span> so với tháng trước.
              </>
            ) : (
              <>
                Không có đủ dữ liệu cho loại <span className="highlight">
                  {CATEGORY_DISPLAY_NAMES[selectedCategory] || selectedCategory}
                </span> trong khu vực này.
              </>
            )}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CategoryAnalysis;