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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const NeighborhoodComparison = ({ data, selectedDistrict, selectedNeighbors, onNeighborSelect, currentDistrictData }) => {
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  // Chuyển đổi dữ liệu thành mảng và thêm district key
  const neighborhoodData = Object.entries(data || {}).map(([district, info]) => ({
    district,
    ...info
  }));
  
  // Lấy thông tin quận hiện tại từ currentDistrictData (được truyền từ overview)
  const currentDistrictInfo = currentDistrictData ? {
    commonPrice: currentDistrictData.currentPrice || 0,
    priceFluctuation: currentDistrictData.priceFluctuation || 0,
    count: currentDistrictData.totalPosts || 0
  } : {
    commonPrice: 0,
    priceFluctuation: 0,
    count: 0
  };
  
  // Thêm khu vực được chọn với dữ liệu thực tế
  const allDistricts = [
    // Quận hiện tại được chọn
    {
      district: selectedDistrict,
      commonPrice: currentDistrictInfo.commonPrice,
      priceFluctuation: currentDistrictInfo.priceFluctuation,
      count: currentDistrictInfo.count,
      isSelected: true,
      isCurrentDistrict: true
    },
    // Các quận lân cận
    ...neighborhoodData.map(item => ({
      district: item.district,
      commonPrice: item.commonPrice || 0,
      priceFluctuation: item.priceFluctuation || 0,
      count: item.count || 0,
      isSelected: selectedNeighbors.includes(item.district),
      isCurrentDistrict: false
    }))
  ];
  
  // Dữ liệu cho biểu đồ so sánh - bao gồm cả quận hiện tại
  const chartData = [
    // Luôn bao gồm quận hiện tại
    {
      name: selectedDistrict,
      price: currentDistrictInfo.commonPrice,
      color: '#4caf50'
    },
    // Thêm các quận đã chọn
    ...selectedNeighbors
      .filter(district => data[district] && data[district].commonPrice)
      .map(district => ({
        name: district,
        price: data[district].commonPrice,
        color: '#ff9800'
      }))
  ].filter(item => item.price > 0);
  
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
    if (selectedNeighbors.length > 0 || currentDistrictInfo.commonPrice > 0) {
      setShowCompareModal(true);
    }
  };

  return (
    <Box className="neighborhood-comparison">
      {allDistricts.length > 0 ? (
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
                      {item.commonPrice > 0 ? formatCurrency(item.commonPrice) : '—'}
                    </TableCell>
                    <TableCell align="right" className="trend-cell">
                      {item.commonPrice > 0 ? (
                        <Box className="trend-value">
                          {getTrendIcon(item.priceFluctuation)}
                          <Typography 
                            variant="body2" 
                            className={item.priceFluctuation > 0 ? 'up' : item.priceFluctuation < 0 ? 'down' : 'stable'}
                          >
                            {item.priceFluctuation > 0 ? '+' : ''}{item.priceFluctuation.toFixed(2)}%
                          </Typography>
                        </Box>
                      ) : '—'}
                    </TableCell>
                    <TableCell align="right">
                      {item.count > 0 ? item.count : '—'}
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
                            disabled={item.commonPrice === 0}
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
              disabled={chartData.length === 0}
              className="compare-button"
            >
              So sánh chi tiết ({chartData.length} khu vực)
            </Button>
          </Box>
          
          {/* Modal so sánh chi tiết */}
          <Dialog 
            open={showCompareModal} 
            onClose={() => setShowCompareModal(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              So sánh chi tiết giá bất động sản ({chartData.length} khu vực)
            </DialogTitle>
            <DialogContent>
              {chartData.length > 0 ? (
                <Box height={400} mt={2}>
                  <Bar data={barChartData} options={barChartOptions} />
                </Box>
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  Không có dữ liệu để hiển thị biểu đồ so sánh
                </Typography>
              )}
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