import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, Compare } from '@mui/icons-material';
import { formatCurrency } from './utils/formatters';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

// Đăng ký các component của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const NeighborhoodComparison = ({ data, selectedDistrict, selectedNeighbors, onNeighborSelect }) => {
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  // Chuyển đổi dữ liệu thành mảng và thêm district key
  const neighborhoodData = Object.entries(data).map(([district, info]) => ({
    district,
    ...info
  }));
  
  // Thêm khu vực được chọn
  const allDistricts = [
    // Quận hiện tại được chọn là mặc định
    {
      district: selectedDistrict,
      isSelected: true,
      isCurrentDistrict: true
    },
    // Các quận lân cận
    ...neighborhoodData.map(item => ({
      district: item.district,
      commonPrice: item.commonPrice,
      priceFluctuation: item.priceFluctuation,
      count: item.count,
      isSelected: selectedNeighbors.includes(item.district),
      isCurrentDistrict: false
    }))
  ];
  
  // Dữ liệu cho biểu đồ so sánh
  const chartData = [...selectedNeighbors, selectedDistrict]
    .filter(district => {
      // Lọc ra quận hiện tại và các quận đã chọn
      return district === selectedDistrict || 
        (data[district] && data[district].commonPrice);
    })
    .map(district => {
      if (district === selectedDistrict) {
        // Quận hiện tại (giá trị từ data nếu có)
        return {
          name: district,
          price: 0, // Cần cập nhật giá thực tế nếu có
          color: '#4caf50'
        };
      }
      return {
        name: district,
        price: data[district].commonPrice,
        color: '#ff9800'
      };
    });
  
  // Chuẩn bị dữ liệu Chart.js
  const barChartData = {
    labels: chartData.map(item => item.name),
    datasets: [
      {
        label: 'Giá trung bình (triệu/m²)',
        data: chartData.map(item => item.price),
        backgroundColor: chartData.map(item => item.color),
        borderColor: chartData.map(item => item.color.replace(')', ', 0.8)')),
        borderWidth: 1
      }
    ]
  };
  
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Giá trung bình: ${context.raw.toFixed(2)} triệu/m²`;
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
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const getTrendIcon = (fluctuation) => {
    if (fluctuation > 0) return <TrendingUp className="trend-icon up" />;
    if (fluctuation < 0) return <TrendingDown className="trend-icon down" />;
    return <TrendingFlat className="trend-icon stable" />;
  };

  const handleCompareClick = () => {
    if (selectedNeighbors.length > 0) {
      setShowCompareModal(true);
    }
  };

  return (
    <Box className="neighborhood-comparison">
      {neighborhoodData.length > 0 ? (
        <>
          <TableContainer className="comparison-table">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Quận/Huyện</TableCell>
                  <TableCell align="right">Giá TB (triệu/m²)</TableCell>
                  <TableCell align="right">Biến động</TableCell>
                  <TableCell align="right">Tin đăng</TableCell>
                  <TableCell align="center">So sánh</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allDistricts.map((item) => (
                  <TableRow 
                    key={item.district}
                    className={item.isCurrentDistrict ? 'current-district' : ''}
                  >
                    <TableCell component="th" scope="row">
                      {item.district}
                      {item.isCurrentDistrict && (
                        <Chip 
                          label="Hiện tại" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          className="current-chip"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {item.isCurrentDistrict ? '—' : formatCurrency(item.commonPrice)}
                    </TableCell>
                    <TableCell align="right" className="trend-cell">
                      {item.isCurrentDistrict ? (
                        '—'
                      ) : (
                        <Box className="trend-value">
                          {getTrendIcon(item.priceFluctuation)}
                          <Typography 
                            variant="body2" 
                            className={item.priceFluctuation > 0 ? 'up' : item.priceFluctuation < 0 ? 'down' : 'stable'}
                          >
                            {item.priceFluctuation > 0 ? '+' : ''}{item.priceFluctuation.toFixed(2)}%
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {item.isCurrentDistrict ? '—' : item.count}
                    </TableCell>
                    <TableCell align="center">
                      {!item.isCurrentDistrict && (
                        <Tooltip title={item.isSelected ? "Bỏ chọn" : "Chọn để so sánh"}>
                          <Chip
                            label={item.isSelected ? "Đã chọn" : "Chọn"}
                            variant={item.isSelected ? "filled" : "outlined"}
                            color={item.isSelected ? "primary" : "default"}
                            size="small"
                            onClick={() => onNeighborSelect(item.district)}
                            className="select-chip"
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box mt={2} className="compare-actions">
            <Typography variant="caption" className="selection-info">
              Đã chọn {selectedNeighbors.length}/3 khu vực để so sánh
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Compare />}
              onClick={handleCompareClick}
              disabled={selectedNeighbors.length === 0}
              className="compare-button"
            >
              So sánh chi tiết
            </Button>
          </Box>
          
          {/* Modal so sánh chi tiết */}
          <Dialog 
            open={showCompareModal} 
            onClose={() => setShowCompareModal(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>So sánh chi tiết giá bất động sản</DialogTitle>
            <DialogContent>
              <Box height={400} mt={2}>
                <Bar data={barChartData} options={barChartOptions} />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowCompareModal(false)}>Đóng</Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <Box className="no-data-message">
          <Typography variant="body1">
            Không có dữ liệu để so sánh với khu vực lân cận
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default NeighborhoodComparison;