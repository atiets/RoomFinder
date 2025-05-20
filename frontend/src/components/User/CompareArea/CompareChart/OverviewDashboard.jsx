import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Divider, Tooltip, Button } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { formatCurrency } from './utils/formatters';
import {
  FaBuilding,
  FaHome,
  FaMapMarkedAlt,
  FaStore,
  FaBed,
  FaSignature,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaCity,
  FaMapSigns,
} from "react-icons/fa";

// Danh sách các loại bất động sản và giao dịch
const categories = [
  { id: "Căn hộ/chung cư", name: "Căn hộ", icon: <FaBuilding /> },
  { id: "Nhà ở", name: "Nhà ở", icon: <FaHome /> },
  { id: "Đất", name: "Đất", icon: <FaMapMarkedAlt /> },
  { id: "Văn phòng, mặt bằng kinh doanh", name: "Văn phòng", icon: <FaStore /> },
  { id: "phòng trọ", name: "Phòng trọ", icon: <FaBed /> },
];

const transactionTypes = [
  { id: "Cho thuê", name: "Cho thuê", icon: <FaSignature /> },
  { id: "Cần bán", name: "Cần bán", icon: <FaMoneyBillWave /> },
];

const OverviewDashboard = ({ 
  data, 
  provinces = [], 
  districtCoordinatesData = {}, 
  onChangeProvince, 
  onChangeDistrict, 
  onChangeCategory, 
  onChangeTransaction,
  onApplyChanges
}) => {
  console.log("OverviewDashboard rendered");
  
  // State cho các lựa chọn
  const [selectedCategory, setSelectedCategory] = useState(data.category);
  const [selectedTransaction, setSelectedTransaction] = useState(data.transactionType);
  const [selectedProvince, setSelectedProvince] = useState(data.province);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(data.district);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Log để kiểm tra state
  console.log("Selection mode:", isSelectionMode);
  console.log("Current selections:", {
    selectedCategory,
    selectedTransaction,
    selectedProvince,
    selectedDistrict
  });

  // Cập nhật local state khi props thay đổi
  useEffect(() => {
    setSelectedCategory(data.category);
    setSelectedTransaction(data.transactionType);
    setSelectedProvince(data.province);
    setSelectedDistrict(data.district);
  }, [data]);

  // Cập nhật districts khi province thay đổi
  useEffect(() => {
    if (selectedProvince && districtCoordinatesData[selectedProvince]) {
      const provinceDistricts = districtCoordinatesData[selectedProvince];
      const formattedDistricts = Object.keys(provinceDistricts).map(district => ({
        district,
        coordinates: provinceDistricts[district]
      }));
      setDistricts(formattedDistricts);
    } else {
      setDistricts([]);
    }
  }, [selectedProvince, districtCoordinatesData]);

  // Icon và màu cho xu hướng
  const getTrendIcon = () => {
    switch(data.trend) {
      case 'up': return <TrendingUp className="trend-icon up" />;
      case 'down': return <TrendingDown className="trend-icon down" />;
      default: return <TrendingFlat className="trend-icon stable" />;
    }
  };

  // Handlers cho các thay đổi
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (onChangeCategory) onChangeCategory(category);
  };

  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(transaction);
    if (onChangeTransaction) onChangeTransaction(transaction);
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedDistrict(null);
    if (onChangeProvince) onChangeProvince(province);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    if (onChangeDistrict) onChangeDistrict(district);
  };

  // Toggle chế độ chọn lựa
  const toggleSelectionMode = () => {
    console.log("Toggle selection mode called, current:", isSelectionMode);
    setIsSelectionMode(prevMode => !prevMode);
  };

  // Apply changes
  const applyChanges = () => {
    console.log("Applying changes from OverviewDashboard");
    if (onApplyChanges) {
      onApplyChanges();
    }
    toggleSelectionMode();
  };

  // Nút để chuyển sang chế độ chọn lựa
  const ToggleButton = () => (
    <Grid item xs={12} className="toggle-mode-section">
      <Button 
        variant="outlined" 
        color="primary" 
        onClick={toggleSelectionMode}
        className="toggle-mode-button"
        sx={{ marginTop: 2 }}
      >
        <FaExchangeAlt style={{ marginRight: "8px" }} />
        Thay đổi khu vực/loại BĐS
      </Button>
    </Grid>
  );

  // Phải tách ViewMode thành một component riêng để tránh rerender
  if (isSelectionMode) {
    return (
      <Paper elevation={0} className="overview-dashboard">
        <Box>
          {/* Layout hai cột với ngăn cách */}
          <div className="filter-row">
            <div className="filter-section filter-half">
              <h3 className="filter-title">
                <FaBuilding style={{ marginRight: "8px" }} /> Loại bất động sản
              </h3>
              <div className="category-buttons">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-card ${selectedCategory === category.id ? "selected" : ""}`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section filter-half">
              <h3 className="filter-title">
                <FaExchangeAlt style={{ marginRight: "8px" }} /> Loại giao dịch
              </h3>
              <div className="transaction-buttons">
                {transactionTypes.map((transaction) => (
                  <button
                    key={transaction.id}
                    className={`transaction-card ${selectedTransaction === transaction.id ? "selected" : ""}`}
                    onClick={() => handleTransactionSelect(transaction.id)}
                  >
                    <span className="transaction-icon">{transaction.icon}</span>
                    <span className="transaction-name">{transaction.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chọn tỉnh/thành phố */}
          <div className="filter-section">
            <h3 className="filter-title">
              <FaCity style={{ marginRight: "8px" }} /> Tỉnh/Thành phố
            </h3>
            <select
              id="province-select"
              className="province-select"
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

          {/* Chọn quận/huyện */}
          {districts.length > 0 && (
            <div className="filter-section">
              <h3 className="filter-title">
                <FaMapSigns style={{ marginRight: "8px" }} /> Quận/Huyện
              </h3>
              <div className="district-buttons">
                {districts.map((districtObj) => {
                  const hasData = 
                    selectedCategory && 
                    selectedTransaction && 
                    districtObj.coordinates.byCategoryAndTransaction && 
                    districtObj.coordinates.byCategoryAndTransaction[selectedCategory] && 
                    districtObj.coordinates.byCategoryAndTransaction[selectedCategory][selectedTransaction];

                  return (
                    <button
                      key={districtObj.district}
                      className={`district-btn ${selectedDistrict === districtObj.district ? "selected" : ""} 
                                ${hasData ? "" : "no-data"}`}
                      onClick={() => handleDistrictSelect(districtObj.district)}
                      disabled={!hasData}
                      title={hasData ? "" : "Không có dữ liệu cho lựa chọn này"}
                    >
                      {districtObj.district}
                      {hasData && (
                        <span className="data-badge">
                          {
                            districtObj.coordinates.byCategoryAndTransaction[
                              selectedCategory
                            ][selectedTransaction].count
                          }
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nút áp dụng và quay lại */}
          <div className="action-section" style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={toggleSelectionMode}
              style={{ marginRight: "10px" }}
            >
              Hủy
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={applyChanges}
              className="apply-button"
            >
              Áp dụng
            </Button>
          </div>
        </Box>
      </Paper>
    );
  }

  // Mode xem (mặc định)
  return (
    <Paper elevation={0} className="overview-dashboard">
      <Grid container spacing={2}>
        {/* Thông tin khu vực và loại BĐS */}
        <Grid item xs={12} md={4} className="info-section">
          <Box className="location-info">
            <Typography variant="h6">{data.district}</Typography>
            <Typography variant="subtitle1" color="textSecondary">{data.province}</Typography>
          </Box>
          
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          <Divider sx={{ display: { xs: 'block', md: 'none' }, my: 1 }} />
          
          <Box className="property-info">
            <Box className="category-icon-chart">
              {categories.find(c => c.id === data.category)?.icon || <FaBuilding />}
            </Box>
            <Box>
              <Typography variant="subtitle1" className="category-title-chart">{data.category}</Typography>
              <Typography variant="body2" color="textSecondary">{data.transactionType}</Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Thông tin giá */}
        <Grid item xs={12} md={4} className="price-section">
          <Box className="price-box">
            <Typography variant="caption" color="textSecondary">Giá trung bình hiện tại</Typography>
            <Typography variant="h4" className="price-value">
              {formatCurrency(data.currentPrice)} <span className="unit">triệu/m²</span>
            </Typography>
            
            <Box className="price-range">
              <Tooltip title="Giá thấp nhất" arrow>
                <span>
                  <Typography variant="caption" component="span">
                    Thấp: {formatCurrency(data.minPrice)}
                  </Typography>
                </span>
              </Tooltip>
              <Tooltip title="Giá cao nhất" arrow>
                <span>
                  <Typography variant="caption" component="span">
                    Cao: {formatCurrency(data.maxPrice)}
                  </Typography>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Grid>
        
        {/* Thông tin xu hướng */}
        <Grid item xs={12} md={4} className="trend-section">
          <Box className="trend-box">
            <Box className="fluctuation-box">
              <Typography variant="caption" color="textSecondary">
                Biến động giá so với tháng trước
              </Typography>
              <Box className="fluctuation-value">
                {getTrendIcon()}
                <Typography 
                  variant="h5" 
                  className={`fluctuation-percentage ${data.trend}`}
                >
                  {data.priceFluctuation > 0 ? '+' : ''}{data.priceFluctuation.toFixed(2)}%
                </Typography>
              </Box>
            </Box>
            
            <Box className="data-stats">
              <Typography variant="body2">
                Dựa trên <strong>{data.totalPosts}</strong> tin đăng
              </Typography>
              <Typography variant="body2">
                Từ <strong>{data.wardCount}</strong> phường/xã
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Nút để chuyển sang chế độ chọn lựa */}
        <ToggleButton />
      </Grid>
    </Paper>
  );
};

export default OverviewDashboard;