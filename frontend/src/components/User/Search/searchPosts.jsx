// components/Search/SearchPosts.js
import { Box, Divider } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import categoryIcon from "../../../assets/images/categoryIcon.png";
import filterIcon from "../../../assets/images/filterIcon.png";
import locationIcon from "../../../assets/images/locationIcon.png";
import searchIcon from "../../../assets/images/searchIcon.png";

import { searchPosts } from "../../../redux/postAPI";
import { setError, setLoading, setPosts } from "../../../redux/postSlice";
import LocationSelector from "../LocationSelector/LocationSelector";
import "./searchPosts.css";

const SearchPosts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, loading, error } = useSelector((state) => state.posts);
  
  const [isDropdownCategoryOpen, setIsDropdownCategoryOpen] = useState(false);
  const [isDropdownTransactionOpen, setIsDropdownTransactionOpen] = useState(false);
  const [isDropdownFilterOpen, setIsDropdownFilterOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [textAnimation, setTextAnimation] = useState(true);

  const [filters, setFilters] = useState({
    keyword: "",
    province: "",
    district: "",
    ward: "",
    category: "",
    transactionType: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
  });

  // **Slides data mới cho website tìm phòng trọ**
  const slidesData = [
    {
      id: 1,
      image: "https://luxurydecor.vn/wp-content/uploads/2020/02/noi-that-phong-khach-chung-cu-8.jpg",
      title: "Căn hộ chung cư hiện đại",
      subtitle: "Tìm kiếm căn hộ chung cư với thiết kế hiện đại, đầy đủ tiện nghi và vị trí thuận lợi",
      highlight: "Căn hộ/Chung cư",
      primaryColor: "#66BB6A",
      secondaryColor: "#FF8A65",
      category: "apartment"
    },
    {
      id: 2,
      image: "https://cdn1.genspark.ai/user-upload-image/5_generated/9951d20a-650b-44c3-82f5-de1f56a8d137",
      title: "Phòng trọ cao cấp",
      subtitle: "Khám phá các phòng trọ được thiết kế hiện đại, thoáng mát với giá cả hợp lý",
      highlight: "Phòng trọ",
      primaryColor: "#FF8A65",
      secondaryColor: "#66BB6A",
      category: "room"
    },
    {
      id: 3,
      image: "https://static-images.vnncdn.net/files/publish/2023/3/31/nha-cap-4-1345.jpg",
      title: "Nhà ở gia đình",
      subtitle: "Tìm ngôi nhà lý tưởng cho gia đình với không gian rộng rãi và môi trường an toàn",
      highlight: "Nhà ở",
      primaryColor: "#4CAF50",
      secondaryColor: "#FFB74D",
      category: "house"
    },
    {
      id: 4,
      image: "https://static-1.happynest.vn/storage/uploads/2020/04/eb04e52da19ab9268166fe578b9817ee.jpg",
      title: "Văn phòng & Mặt bằng",
      subtitle: "Cho thuê văn phòng và mặt bằng kinh doanh tại vị trí đắc địa, thuận tiện giao thông",
      highlight: "Văn phòng",
      primaryColor: "#2196F3",
      secondaryColor: "#FF9800",
      category: "office"
    },
    {
      id: 5,
      image: "https://cdn1.genspark.ai/user-upload-image/5_generated/d06d68d8-fc8e-46d4-b798-54cc522b43a0",
      title: "Đất đầu tư sinh lời",
      subtitle: "Cơ hội đầu tư đất nền với tiềm năng sinh lời cao và pháp lý rõ ràng",
      highlight: "Đất đai",
      primaryColor: "#795548",
      secondaryColor: "#FF7043",
      category: "land"
    }
  ];

  const categories = [
    { value: "", label: "Tất cả danh mục" },
    { value: "Căn hộ/chung cư", label: "Căn hộ/chung cư" },
    { value: "Nhà ở", label: "Nhà ở" },
    { value: "Đất", label: "Đất" },
    { value: "Văn phòng, mặt bằng kinh doanh", label: "Văn phòng, mặt bằng kinh doanh" },
    { value: "phòng trọ", label: "Phòng trọ" },
  ];

  const transactionTypes = [
    { value: "", label: "Tất cả loại giao dịch" },
    { value: "Cho thuê", label: "Cho thuê" },
    { value: "Cần bán", label: "Cần bán" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleCategoryChange = (category) => {
    setFilters({
      ...filters,
      category: category,
    });
    setIsDropdownCategoryOpen(false);
  };

  const handleTransactionTypeChange = (transactionType) => {
    setFilters({
      ...filters,
      transactionType: transactionType,
    });
    setIsDropdownTransactionOpen(false);
  };

  const handleLocationChange = (locationData) => {
    setFilters(prev => ({
      ...prev,
      ...locationData
    }));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-filter-box')) {
        setIsDropdownCategoryOpen(false);
        setIsDropdownTransactionOpen(false);
        setIsDropdownFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const convertValue = (value) => {
    if (!value) return "";
    const converted = parseFloat(value.replace(/[^\d.-]/g, ""));
    return isNaN(converted) ? "" : converted;
  };

  const handleSearch = async () => {
    dispatch(setLoading(true));
    try {
      const token = localStorage.getItem("token");

      const preparedFilters = {
        ...filters,
        minPrice: convertValue(filters.minPrice),
        maxPrice: convertValue(filters.maxPrice),
        minArea: convertValue(filters.minArea),
        maxArea: convertValue(filters.maxArea),
      };

      const filtersWithoutEmptyValues = Object.fromEntries(
        Object.entries(preparedFilters).filter(([key, value]) => value !== ""),
      );

      console.log("🔍 Search filters:", filtersWithoutEmptyValues);

      const results = await searchPosts(filtersWithoutEmptyValues, token);
      dispatch(setPosts(results));
      navigate("/search", {
        state: { results, filters: filtersWithoutEmptyValues },
      });
    } catch (error) {
      dispatch(setError(error.message));
      console.error("Search error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const formatPrice = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const settings = {
    infinite: true,
    speed: 1200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    beforeChange: (current, next) => {
      setTextAnimation(false);
      setTimeout(() => {
        setCurrentSlide(next);
        setTextAnimation(true);
      }, 200);
    },
    customPaging: (i) => (
      <div className={`custom-dot ${i === currentSlide ? 'active' : ''}`}>
        <span></span>
      </div>
    ),
    appendDots: dots => (
      <div className="slider-dots-container">
        <ul className="slider-dots">{dots}</ul>
      </div>
    ),
  };

  const currentSlideData = slidesData[currentSlide];

  return (
    <div className="search-posts">
      <div className="home-container-slide-picture">
        <Slider {...settings} className="hero-slider">
          {slidesData.map((slide, index) => (
            <div key={slide.id} className="slide-item">
              <div className="slide-background">
                <img src={slide.image} alt={slide.title} className="slide-image" />
                <div 
                  className="slide-overlay"
                  style={{
                    background: `linear-gradient(135deg, ${slide.primaryColor}10, ${slide.secondaryColor}15)`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </Slider>

        {/* **Animated Text Content** */}
        <div className="slide-content-wrapper">
          <div className="container">
            <div className={`slide-text-content ${textAnimation ? 'animate-in' : 'animate-out'}`}>
              <div 
                className="slide-highlight"
                style={{ backgroundColor: currentSlideData?.primaryColor }}
              >
                {currentSlideData?.highlight}
              </div>
              <h1 
                className="slide-title"
                style={{ color: 'white' }}
              >
                {currentSlideData?.title}
              </h1>
              <p 
                className="slide-subtitle"
                style={{ color: 'rgba(255,255,255,0.95)' }}
              >
                {currentSlideData?.subtitle}
              </p>
              {/* FIXED: Bỏ onClick, chỉ hiển thị để xem */}
              <button 
                className="slide-cta-btn"
                style={{
                  background: `linear-gradient(45deg, ${currentSlideData?.primaryColor}, ${currentSlideData?.secondaryColor})`
                }}
              >
                Tìm ngay
              </button>
            </div>
          </div>
        </div>

        {/* **Search Form - Back to original positioning** */}
        <input
          className="search-by-category"
          placeholder="Tìm kiếm theo từ khóa..."
          name="keyword"
          value={filters.keyword}
          onChange={handleInputChange}
        />
        
        <div className="search-container-info">
          {/* 1. Location Selector */}
          <Box className="search-filter-box">
            <div className="filter-icon-container">
              <img src={locationIcon} alt="location" className="search-style-icon" />
            </div>
            <div className="filter-content">
              <div className="filter-label">Địa điểm</div>
              <LocationSelector
                filters={filters}
                setFilters={setFilters}
                onLocationChange={handleLocationChange}
              />
            </div>
          </Box>

          <Divider className="search-info-divider" orientation="vertical" flexItem />

          {/* 2. Category Selector */}
          <Box className="search-filter-box">
            <div className="filter-icon-container">
              <img src={categoryIcon} alt="category" className="search-style-icon" />
            </div>
            <div className="filter-content">
              <div className="filter-label">Danh mục</div>
              <div className="custom-dropdown" onClick={() => setIsDropdownCategoryOpen(!isDropdownCategoryOpen)}>
                <span className={`dropdown-display ${filters.category ? "selected" : ""}`}>
                  {filters.category || "Chọn danh mục"}
                </span>
                <i className={`fas fa-chevron-down dropdown-arrow ${isDropdownCategoryOpen ? 'open' : ''}`}></i>
              </div>
              {isDropdownCategoryOpen && (
                <ul className="custom-dropdown-menu">
                  {categories.map((cat) => (
                    <li
                      key={cat.value}
                      className={`dropdown-option ${filters.category === cat.value ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(cat.value)}
                    >
                      <span className="option-text">{cat.label}</span>
                      {filters.category === cat.value && (
                        <i className="fas fa-check option-check"></i>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Box>

          <Divider className="search-info-divider" orientation="vertical" flexItem />

          {/* 3. Transaction Type Selector */}
          <Box className="search-filter-box">
            <div className="filter-icon-container">
              <img src={categoryIcon} alt="transaction" className="search-style-icon" />
            </div>
            <div className="filter-content">
              <div className="filter-label">Loại giao dịch</div>
              <div className="custom-dropdown" onClick={() => setIsDropdownTransactionOpen(!isDropdownTransactionOpen)}>
                <span className={`dropdown-display ${filters.transactionType ? "selected" : ""}`}>
                  {filters.transactionType || "Cho thuê / Cần bán"}
                </span>
                <i className={`fas fa-chevron-down dropdown-arrow ${isDropdownTransactionOpen ? 'open' : ''}`}></i>
              </div>
              {isDropdownTransactionOpen && (
                <ul className="custom-dropdown-menu">
                  {transactionTypes.map((type) => (
                    <li
                      key={type.value}
                      className={`dropdown-option ${filters.transactionType === type.value ? 'active' : ''}`}
                      onClick={() => handleTransactionTypeChange(type.value)}
                    >
                      <span className="option-text">{type.label}</span>
                      {filters.transactionType === type.value && (
                        <i className="fas fa-check option-check"></i>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Box>

          <Divider className="search-info-divider" orientation="vertical" flexItem />

          {/* 4. Advanced Filter */}
          <Box className="search-filter-box">
            <div className="filter-icon-container">
              <img src={filterIcon} alt="filter" className="search-style-icon" />
            </div>
            <div className="filter-content">
              <div className="filter-label">Bộ lọc nâng cao</div>
              <div className="custom-dropdown" onClick={() => setIsDropdownFilterOpen(!isDropdownFilterOpen)}>
                <span className="dropdown-display">
                  Lọc theo giá và diện tích
                </span>
                <i className={`fas fa-chevron-down dropdown-arrow ${isDropdownFilterOpen ? 'open' : ''}`}></i>
              </div>
              {isDropdownFilterOpen && (
                <div className="advanced-filter-dropdown">
                  {/* Price Filter */}
                  <div className="filter-section">
                    <div className="filter-title">💰 Khoảng giá</div>
                    <div className="filter-inputs">
                      <div className="input-group">
                        <input
                          className="filter-input"
                          type="number"
                          name="minPrice"
                          placeholder="Giá tối thiểu"
                          value={filters.minPrice}
                          onChange={handleInputChange}
                        />
                        <span className="input-unit">VNĐ</span>
                      </div>
                      <span className="input-separator">→</span>
                      <div className="input-group">
                        <input
                          className="filter-input"
                          type="number"
                          name="maxPrice"
                          placeholder="Giá tối đa"
                          value={filters.maxPrice}
                          onChange={handleInputChange}
                        />
                        <span className="input-unit">VNĐ</span>
                      </div>
                    </div>
                    {(filters.minPrice || filters.maxPrice) && (
                      <div className="filter-preview">
                        {filters.minPrice && formatPrice(filters.minPrice)} 
                        {filters.minPrice && filters.maxPrice && " - "} 
                        {filters.maxPrice && formatPrice(filters.maxPrice)} VNĐ
                      </div>
                    )}
                  </div>

                  {/* Area Filter */}
                  <div className="filter-section">
                    <div className="filter-title">📐 Diện tích</div>
                    <div className="filter-inputs">
                      <div className="input-group">
                        <input
                          className="filter-input"
                          type="number"
                          name="minArea"
                          placeholder="Diện tích tối thiểu"
                          value={filters.minArea}
                          onChange={handleInputChange}
                        />
                        <span className="input-unit">m²</span>
                      </div>
                      <span className="input-separator">→</span>
                      <div className="input-group">
                        <input
                          className="filter-input"
                          type="number"
                          name="maxArea"
                          placeholder="Diện tích tối đa"
                          value={filters.maxArea}
                          onChange={handleInputChange}
                        />
                        <span className="input-unit">m²</span>
                      </div>
                    </div>
                    {(filters.minArea || filters.maxArea) && (
                      <div className="filter-preview">
                        {filters.minArea} 
                        {filters.minArea && filters.maxArea && " - "} 
                        {filters.maxArea} m²
                      </div>
                    )}
                  </div>

                  {/* Quick Filter Buttons */}
                  <div className="quick-filters">
                    <div className="quick-filter-title">Bộ lọc nhanh:</div>
                    <div className="quick-filter-buttons">
                      <button 
                        className="quick-btn"
                        onClick={() => setFilters({...filters, minPrice: "1000000", maxPrice: "5000000"})}
                      >
                        1-5 triệu
                      </button>
                      <button 
                        className="quick-btn"
                        onClick={() => setFilters({...filters, minPrice: "5000000", maxPrice: "10000000"})}
                      >
                        5-10 triệu
                      </button>
                      <button 
                        className="quick-btn"
                        onClick={() => setFilters({...filters, minArea: "20", maxArea: "50"})}
                      >
                        20-50 m²
                      </button>
                      <button 
                        className="quick-btn"
                        onClick={() => setFilters({...filters, minArea: "50", maxArea: "100"})}
                      >
                        50-100 m²
                      </button>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="filter-actions">
                    <button 
                      className="clear-filters-btn"
                      onClick={() => setFilters({
                        ...filters,
                        minPrice: "",
                        maxPrice: "",
                        minArea: "",
                        maxArea: ""
                      })}
                    >
                      🗑️ Xóa bộ lọc
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Box>

          <Divider className="search-info-divider" orientation="vertical" flexItem />

          {/* 5. Search Button */}
          <Box className="search-filter-box search-btn-container">
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={loading}
            >
              <img src={searchIcon} alt="search" className="style-icon-btn-search" />
              {loading ? "Đang tìm kiếm..." : "Tìm kiếm"}
            </button>
          </Box>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default SearchPosts;