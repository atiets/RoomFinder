import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { getCompareChartData, getDistrictCoordinatesByCity } from '../../../../redux/postAPI';

// Components
import OverviewDashboard from './OverviewDashboard';
import PriceTimelineChart from './PriceTimelineChart';
import NeighborhoodComparison from './NeighborhoodComparison';
import CategoryAnalysis from './CategoryAnalysis';
import DownloadReportButton from './DownloadReportButton';

import './style.css';

const CompareChart = () => {
  console.log("CompareChart - Component rendering start");
  
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNeighbors, setSelectedNeighbors] = useState([]);
  
  // Thêm state cho provinces và districtCoordinatesData
  const [provinces, setProvinces] = useState([]);
  const [districtCoordinatesData, setDistrictCoordinatesData] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log("CompareChart - location state:", location.state);
  
  // Lấy state truyền từ trang trước
  const {
    selectedProvince,
    selectedDistrict,
    selectedCategory,
    selectedTransaction
  } = location.state || {};
  
  // State mới để lưu trữ giá trị hiện tại (có thể thay đổi)
  const [currentProvince, setCurrentProvince] = useState(selectedProvince);
  const [currentDistrict, setCurrentDistrict] = useState(selectedDistrict);
  const [currentCategory, setCurrentCategory] = useState(selectedCategory);
  const [currentTransaction, setCurrentTransaction] = useState(selectedTransaction);
  
  console.log("CompareChart - Extracted params:", {
    selectedProvince,
    selectedDistrict,
    selectedCategory,
    selectedTransaction
  });

  // Lấy dữ liệu tọa độ quận/huyện cho toàn bộ hệ thống
  useEffect(() => {
    const fetchDistrictData = async () => {
      try {
        console.log("CompareChart - Fetching district coordinates data");
        const data = await getDistrictCoordinatesByCity();
        setDistrictCoordinatesData(data);
        setProvinces(Object.keys(data));
        console.log("CompareChart - District data fetched successfully");
      } catch (err) {
        console.error("CompareChart - Error fetching district data:", err);
      }
    };
    
    fetchDistrictData();
  }, []);

  // Handlers cho OverviewDashboard
  const handleChangeProvince = (province) => {
    console.log("Thay đổi province thành:", province);
    setCurrentProvince(province);
  };

  const handleChangeDistrict = (district) => {
    console.log("Thay đổi district thành:", district);
    setCurrentDistrict(district);
  };

  const handleChangeCategory = (category) => {
    console.log("Thay đổi category thành:", category);
    setCurrentCategory(category);
  };

  const handleChangeTransaction = (transaction) => {
    console.log("Thay đổi transaction thành:", transaction);
    setCurrentTransaction(transaction);
  };
  
  // Hàm để lấy dữ liệu biểu đồ (tách ra để có thể gọi lại)
  const fetchChartData = async (province, district, category, transaction) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!province || !district || !category || !transaction) {
        const errorMsg = "Thiếu thông tin để hiển thị biểu đồ";
        console.error("CompareChart - Missing params:", errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log("CompareChart - Calling API with params:", {
        province,
        district,
        category,
        transaction
      });
      
      const data = await getCompareChartData(
        province,
        district,
        category,
        transaction
      );
      
      console.log("CompareChart - API response received:", data);
      
      // Kiểm tra và xử lý dữ liệu categoryAnalysis
      if (data.categoryAnalysis) {
        console.log("CompareChart - Category analysis data:", data.categoryAnalysis);
      }
      
      setChartData(data);
      setLoading(false);
    } catch (err) {
      console.error("CompareChart - Error fetching data:", err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Hàm áp dụng thay đổi
  const handleApplyChanges = () => {
    console.log("Applying changes with:", {
      province: currentProvince,
      district: currentDistrict,
      category: currentCategory,
      transaction: currentTransaction
    });
    
    // Refetch data with new parameters
    fetchChartData(
      currentProvince,
      currentDistrict,
      currentCategory,
      currentTransaction
    );
  };
  
  // Fetch data khi component mount
  useEffect(() => {
    console.log("CompareChart - useEffect data fetching triggered");
    fetchChartData(selectedProvince, selectedDistrict, selectedCategory, selectedTransaction);
  }, [selectedProvince, selectedDistrict, selectedCategory, selectedTransaction]);
  
  // Handler cho việc chọn quận/huyện để so sánh
  const handleNeighborSelect = (districtName) => {
    console.log("CompareChart - handleNeighborSelect called with:", districtName);
    if (selectedNeighbors.includes(districtName)) {
      setSelectedNeighbors(prev => prev.filter(d => d !== districtName));
    } else {
      if (selectedNeighbors.length < 3) {
        setSelectedNeighbors(prev => [...prev, districtName]);
      }
    }
  };
  
  // Quay lại trang trước
  const handleGoBack = () => {
    console.log("CompareChart - handleGoBack called");
    navigate(-1);
  };

  // Loading state
  if (loading) {
    console.log("CompareChart - Rendering loading state");
    return (
      <Box className="loading-container">
        <CircularProgress size={60} className="progress-green" />
        <Typography variant="h6" mt={2}>Đang tải dữ liệu bất động sản...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    console.log("CompareChart - Rendering error state:", error);
    return (
      <Box className="error-container">
        <Typography variant="h5" color="error" gutterBottom>Có lỗi xảy ra</Typography>
        <Typography>{error}</Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Quay lại trang tìm kiếm
        </Button>
      </Box>
    );
  }

  // No data state
  if (!chartData) {
    console.log("CompareChart - Rendering no data state");
    return (
      <Box className="no-data-container">
        <Typography variant="h5" gutterBottom>Không tìm thấy dữ liệu</Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Quay lại trang tìm kiếm
        </Button>
      </Box>
    );
  }

  console.log("CompareChart - Rendering full component with data");
  
  try {
    return (
      <Container maxWidth="lg" className="compare-chart-container">
        <Box className="header-section">
          <Button 
            variant="text" 
            startIcon={<ArrowBack />} 
            onClick={handleGoBack}
            className="back-button"
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h1" className="page-title">
            Phân tích giá bất động sản
          </Typography>
          <DownloadReportButton chartData={chartData} />
        </Box>
        
        <Grid container spacing={3}>
          {/* Phần 1: Dashboard tổng quan */}
          <Grid item xs={12}>
            {console.log("CompareChart - Rendering OverviewDashboard with data:", chartData.overview)}
            <OverviewDashboard 
              data={chartData.overview}
              provinces={provinces}
              districtCoordinatesData={districtCoordinatesData}
              onChangeProvince={handleChangeProvince}
              onChangeDistrict={handleChangeDistrict}
              onChangeCategory={handleChangeCategory}
              onChangeTransaction={handleChangeTransaction}
              onApplyChanges={handleApplyChanges}
            />
          </Grid>
          
          {/* Phần 2: Biểu đồ theo thời gian */}
          <Grid item xs={12}>
            <Paper elevation={0} className="chart-paper">
              <Typography variant="h6" className="section-title">Biến động giá theo thời gian</Typography>
              {console.log("CompareChart - Rendering PriceTimelineChart with data:", chartData.timelineData)}
              <PriceTimelineChart data={chartData.timelineData} />
            </Paper>
          </Grid>
          
          {/* Phần 3: So sánh với khu vực lân cận */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} className="chart-paper">
              <Typography variant="h6" className="section-title">So sánh với khu vực lân cận</Typography>
              {console.log("CompareChart - Rendering NeighborhoodComparison with data:", {
                neighboringDistricts: chartData.neighboringDistricts,
                selectedDistrict: currentDistrict,
                selectedNeighbors: selectedNeighbors,
                currentDistrictData: chartData.overview
              })}
              <NeighborhoodComparison 
                data={chartData.neighboringDistricts}
                selectedDistrict={currentDistrict}
                selectedNeighbors={selectedNeighbors}
                onNeighborSelect={handleNeighborSelect}
                currentDistrictData={chartData.overview} // ✅ Truyền thêm dữ liệu quận hiện tại
              />
            </Paper>
          </Grid>
          
          {/* Phần 4: Phân tích theo loại bất động sản */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} className="chart-paper">
              <Typography variant="h6" className="section-title">Phân tích theo loại bất động sản</Typography>
              {console.log("CompareChart - Rendering CategoryAnalysis with data:", {
                categoryAnalysis: chartData.categoryAnalysis,
                selectedCategory: currentCategory,
                selectedTransaction: currentTransaction
              })}
              <CategoryAnalysis 
                data={chartData.categoryAnalysis}
                selectedCategory={currentCategory} // ✅ Sử dụng currentCategory
                selectedTransaction={currentTransaction} // ✅ Sử dụng currentTransaction
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  } catch (error) {
    console.error("CompareChart - Error in render:", error);
    return (
      <Box className="error-container">
        <Typography variant="h5" color="error" gutterBottom>Lỗi hiển thị</Typography>
        <Typography>{error.message}</Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Quay lại trang tìm kiếm
        </Button>
      </Box>
    );
  }
};

export default CompareChart;