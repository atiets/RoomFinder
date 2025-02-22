import { Box, Divider } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import categoryIcon from "../../../assets/images/categoryIcon.png";
import filterIcon from "../../../assets/images/filterIcon.png";
import locationIcon from "../../../assets/images/locationIcon.png";
import searchIcon from "../../../assets/images/searchIcon.png";
import slide1 from "../../../assets/images/slide1.jpg";
import slide2 from "../../../assets/images/slide2.jpg";
import slide3 from "../../../assets/images/slide3.jpg";
import { searchPosts } from "../../../redux/postAPI";
import { setError, setLoading, setPosts } from "../../../redux/postSlice";
import "./searchPosts.css";

const SearchPosts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, loading, error } = useSelector((state) => state.posts);
  const [provinces, setProvinces] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isDropdowncategoryOpen, setIsDropdowncategoryOpen] = useState(false);
  const [isDropdowncostOpen, setIsDropdowncostgoryOpen] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleToggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleToggleDropdownCategory = () => {
    setIsDropdowncategoryOpen((prev) => !prev);
  };

  const handleToggleDropdownCost = () => {
    setIsDropdowncostgoryOpen((prev) => !prev);
  };

  const [filters, setFilters] = useState({
    keyword: "",
    province: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
  });

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(
          "https://provinces.open-api.vn/api/?depth=3",
        );
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };

    fetchProvinces();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "minPrice" || name === "maxPrice") {
      console.log(`${name}:`, value);
    }
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
    setIsDropdowncategoryOpen(false);
  };

  const handleProvinceChange = (provinceName) => {
    setFilters({
      ...filters,
      province: provinceName, // Nếu là "" thì không lọc theo tỉnh
    });
    setDropdownOpen(false);
  };

  const convertValue = (value) => {
    if (!value) return "";
    const converted = parseFloat(value.replace(/[^\d.-]/g, ""));
    return isNaN(converted) ? "" : converted;
  };

  const handleSearch = async () => {
    dispatch(setLoading(true));
    setSearchPerformed(true);
    try {
      const token = localStorage.getItem("token");

      // Chuẩn bị các bộ lọc, đảm bảo các trường trống không được bao gồm
      const preparedFilters = {
        ...filters,
        minPrice: convertValue(filters.minPrice),
        maxPrice: convertValue(filters.maxPrice),
        minArea: convertValue(filters.minArea),
        maxArea: convertValue(filters.maxArea),
      };

      // Loại bỏ các giá trị trống trước khi gửi yêu cầu
      const filtersWithoutEmptyValues = Object.fromEntries(
        Object.entries(preparedFilters).filter(([key, value]) => value !== ""),
      );

      console.log("Bộ lọc đã chuẩn bị:", filtersWithoutEmptyValues);

      const results = await searchPosts(filtersWithoutEmptyValues, token);
      dispatch(setPosts(results));
      navigate("/search", {
        state: { results, filters: filtersWithoutEmptyValues },
      });
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/posts/${postId}`);
  };

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
  };

  return (
    <div className="search-posts">
      <div className="home-container-slide-picture">
        <Slider {...settings}>
          <div>
            <img src={slide1} alt="Room 1" />
          </div>
          <div>
            <img src={slide2} alt="Room 2" />
          </div>
          <div>
            <img src={slide3} alt="Room 3" />
          </div>
        </Slider>
        <input
          className="search-by-category"
          placeholder="Tìm kiếm..."
          name="keyword"
          fullWidth
          value={filters.keyword}
          onChange={handleInputChange}
        />
        <div className="search-container-info">
          <Box className="contianer-location1">
            <div className="container-icon">
              <img
                src={locationIcon}
                alt="icon"
                className="search-style-icon"
              />
            </div>
            <div className="container-dropdown-title">
              <div className="container-box-title">Địa điểm</div>
              <div className="dropdown" onClick={handleToggleDropdown}>
                <span
                  className={`dropdown-text ${filters.province ? "active" : ""}`}
                >
                  {filters.province || "Chọn địa điểm"}
                </span>
                <i className="fas fa-chevron-down dropdown-icon"></i>
              </div>
              {isDropdownOpen && (
                <ul className="dropdown-menu">
                  {/* Mục "Tất cả các tỉnh" */}
                  <li
                    className="dropdown-menu-item"
                    onClick={() => handleProvinceChange("")} // "" đại diện cho tất cả các tỉnh
                  >
                    Tất cả các tỉnh
                  </li>
                  {/* Các tỉnh cụ thể */}
                  {provinces.map((province) => (
                    <li
                      key={province.code}
                      className="dropdown-menu-item"
                      onClick={() => handleProvinceChange(province.name)}
                    >
                      {province.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Box>
          <Divider
            className="search-info-divider"
            orientation="vertical"
            flexItem
          />
          <Box className="contianer-location1">
            <div className="container-icon">
              {" "}
              <img
                src={categoryIcon}
                alt="categoryicon"
                className="search-style-icon"
              />
            </div>
            <div className="container-dropdown-title">
              <div className="container-box-title">Danh mục</div>
              <div className="dropdown" onClick={handleToggleDropdownCategory}>
                <span
                  className={`dropdown-text ${filters.province ? "active" : ""}`}
                >
                  {filters.category || "Chọn danh mục"}
                </span>
                <i className="fas fa-chevron-down dropdown-icon"></i>
              </div>
              {isDropdowncategoryOpen && (
                <ul className="dropdown-menu">
                  <li
                    className="dropdown-menu-item"
                    data-id="0"
                    onClick={() => handleCategoryChange("")}
                  >
                    Tất cả danh mục
                  </li>
                  <li
                    className="dropdown-menu-item"
                    data-id="1"
                    onClick={() => handleCategoryChange("Nhà trọ, phòng trọ")}
                  >
                    Nhà trọ, phòng trọ
                  </li>
                  <li
                    className="dropdown-menu-item"
                    data-id="2"
                    onClick={() => handleCategoryChange("Nhà nguyên căn")}
                  >
                    Nhà nguyên căn
                  </li>
                  <li
                    className="dropdown-menu-item"
                    data-id="3"
                    onClick={() => handleCategoryChange("Cho thuê căn hộ")}
                  >
                    Cho thuê căn hộ
                  </li>
                  <li
                    className="dropdown-menu-item"
                    data-id="4"
                    onClick={() => handleCategoryChange("Cho thuê căn hộ mini")}
                  >
                    Cho thuê căn hộ mini
                  </li>
                  <li
                    className="dropdown-menu-item"
                    data-id="5"
                    onClick={() =>
                      handleCategoryChange("Cho thuê căn hộ dịch vụ")
                    }
                  >
                    Cho thuê căn hộ dịch vụ
                  </li>
                  <li
                    className="dropdown-menu-item"
                    data-id="6"
                    onClick={() =>
                      handleCategoryChange("Cho thuê mặt bằng, văn phòng")
                    }
                  >
                    Cho thuê mặt bằng, văn phòng
                  </li>
                </ul>
              )}
              <input
                type="hidden"
                name="add_ids_ba_category"
                value={filters.category}
              />
            </div>
          </Box>
          <Divider
            className="search-info-divider"
            orientation="vertical"
            flexItem
          />
          <Box className="contianer-location">
            <div className="container-icon">
              <img src={filterIcon} alt="icon" className="search-style-icon" />
            </div>
            <div className="container-dropdown-title">
              <div className="container-box-title">Địa điểm</div>
              <div
                className="dropdown-filter"
                onClick={handleToggleDropdownCost}
              >
                <span
                  className={`dropdown-text ${filters.province ? "active" : ""}`}
                >
                  Lọc theo giá và diện tích
                </span>
                <i className="fas fa-chevron-down dropdown-icon"></i>
              </div>
              {isDropdowncostOpen && (
                <ul className="dropdown-menu">
                  <div className="price-range">
                    <div className="dropdown-menu-item">
                      <div className="title-field">Giá</div>
                      <div className="price-range-inputs">
                        <input
                          className="search-range-input"
                          type="number"
                          name="minPrice"
                          placeholder="Giá tối thiểu"
                          value={filters.minPrice}
                          onChange={handleInputChange}
                        />
                        <span>-</span>
                        <input
                          className="search-range-input"
                          type="number"
                          name="maxPrice"
                          placeholder="Giá tối đa"
                          value={filters.maxPrice}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="area-range">
                    <div className="dropdown-menu-item">
                      <div className="title-field">Diện tích</div>
                      <div className="range-slider-container">
                        <input
                          type="range"
                          name="minArea"
                          min="0"
                          max="500"
                          step="1"
                          value={filters.minArea}
                          onChange={handleInputChange}
                          className="min-range"
                        />
                        <span className="search-value-area">
                          Diện tích tối thiểu: {filters.minArea} m²
                        </span>
                        <input
                          type="range"
                          name="maxArea"
                          min="0"
                          max="1000"
                          step="1"
                          value={filters.maxArea}
                          onChange={handleInputChange}
                          className="max-range"
                        />
                        <span className="search-value-area">
                          Diện tích tối đa: {filters.maxArea} m²
                        </span>
                      </div>
                    </div>
                  </div>
                </ul>
              )}
            </div>
          </Box>
          <Divider
            className="search-info-divider"
            orientation="vertical"
            flexItem
          />
          <Box className="contianer-location">
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={loading}
            >
              <img
                src={searchIcon}
                alt="searchIcon"
                className="style-icon-btn-search"
              ></img>
              {loading ? "Đang tìm kiếm..." : "Tìm kiếm"}
            </button>
          </Box>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {/*{searchPerformed && (
        <div>
          <div className='search-container-result-count'>
            {posts.length > 0 && (
              <p className='search-result-count'>Tìm thấy {posts.length} bài đăng</p>
            )}
          </div>
          <div className="post-list">
            {posts.length > 0 ? (
              posts.map((post) => (
                <RoomPost key={post.id} post={post} onTitleClick={(postId) => console.log(postId)} />
              ))
            ) : (
              <p className='search-no-result'>Không tìm thấy bài đăng nào.</p>
            )}
          </div>
        </div>
      )}*/}
    </div>
  );
};

export default SearchPosts;
