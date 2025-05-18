import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "./Map";
import tick from "../../../assets/images/tick.gif";
import { getDistrictCoordinatesByCity } from "../../../redux/postAPI";
import "./Compare.css";
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

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const staticErrorMessage = "Có lỗi xảy ra!";

  if (hasError) {
    return <div className="error-message">{staticErrorMessage}</div>;
  }

  return children;
};

const centerVN = { lat: 14.0583, lng: 108.2772 };

const categories = [
  { id: "Căn hộ/chung cư", name: "Căn hộ", icon: <FaBuilding /> },
  { id: "Nhà ở", name: "Nhà ở", icon: <FaHome /> },
  { id: "Đất", name: "Đất", icon: <FaMapMarkedAlt /> },
  {
    id: "Văn phòng, mặt bằng kinh doanh",
    name: "Văn phòng",
    icon: <FaStore />,
  },
  { id: "phòng trọ", name: "Phòng trọ", icon: <FaBed /> },
];

const transactionTypes = [
  { id: "Cho thuê", name: "Cho thuê", icon: <FaSignature /> },
  { id: "Cần bán", name: "Cần bán", icon: <FaMoneyBillWave /> },
];

const CompareArea = () => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [mapCenter, setMapCenter] = useState(centerVN);
  const [mapZoom, setMapZoom] = useState(6);
  const [posts, setPosts] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districtCoordinatesData, setDistrictCoordinatesData] = useState({});
  const [districts, setDistricts] = useState([]);
  const [selectedPriceInfo, setSelectedPriceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Kiểm tra xem đã chọn đủ thông tin chưa
  const isAllSelected =
    selectedCategory &&
    selectedTransaction &&
    selectedProvince &&
    selectedDistrict;

  // API calls and data fetching...
  useEffect(() => {
    const fetchDistrictCoordinates = async () => {
      setIsLoading(true);
      try {
        const data = await getDistrictCoordinatesByCity();
        setDistrictCoordinatesData(data);
        const allProvinces = Object.keys(data);
        setProvinces(allProvinces);
      } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistrictCoordinates();
  }, []);

  // Handlers...
  const handleProvinceChange = async (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedAreas([]);
    setMapCenter(centerVN);
    setMapZoom(6);
    setSelectedPriceInfo(null);
  };

  const handleToggleArea = (districtObj) => {
    const districtName = districtObj.district;
    const areaKey = `${selectedProvince} - ${districtName}`;

    if (selectedAreas.includes(areaKey)) {
      setSelectedAreas([]);
      setSelectedDistrict(null);
      setMapCenter(centerVN);
      setMapZoom(6);
      setSelectedPriceInfo(null);
    } else {
      setSelectedAreas([areaKey]);
      setSelectedDistrict(districtName);
      setMapCenter({
        lat: districtObj.coordinates.lat,
        lng: districtObj.coordinates.lng,
      });
      setMapZoom(13);

      if (
        selectedCategory &&
        selectedTransaction &&
        districtObj.coordinates.byCategoryAndTransaction &&
        districtObj.coordinates.byCategoryAndTransaction[selectedCategory] &&
        districtObj.coordinates.byCategoryAndTransaction[selectedCategory][
          selectedTransaction
        ]
      ) {
        const priceData =
          districtObj.coordinates.byCategoryAndTransaction[selectedCategory][
            selectedTransaction
          ];
        setSelectedPriceInfo({
          commonPrice: priceData.commonPrice,
          priceFluctuation: priceData.priceFluctuation,
          count: priceData.count,
        });
      } else {
        setSelectedPriceInfo(null);
      }
    }
  };

  // Category and transaction selection handlers...
  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setSelectedPriceInfo(null);
    setSelectedDistrict(null);
    setSelectedAreas([]);
  };

  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(
      transaction === selectedTransaction ? null : transaction
    );
    setSelectedPriceInfo(null);
    setSelectedDistrict(null);
    setSelectedAreas([]);
  };

  // Update districts when province changes
  useEffect(() => {
    if (!selectedProvince || !districtCoordinatesData) {
      setDistricts([]);
      return;
    }

    const provinceDistricts = districtCoordinatesData[selectedProvince];
    if (provinceDistricts) {
      const formattedDistricts = Object.entries(provinceDistricts).map(
        ([district, coordinates]) => ({
          district,
          coordinates,
        })
      );
      setDistricts(formattedDistricts);
    } else {
      setDistricts([]);
    }
  }, [selectedProvince, districtCoordinatesData]);

  return (
    <div className="compare-wrapper">
      <div className="compare-left">
        <h2 className="compare-title">So sánh giá bất động sản</h2>
        <p className="compare-subtitle">
          Cập nhật dữ liệu giá mới nhất tháng 05/2025
        </p>

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
            disabled={isLoading}
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
                const areaKey = `${selectedProvince} - ${districtObj.district}`;
                const hasData =
                  selectedCategory &&
                  selectedTransaction &&
                  districtObj.coordinates.byCategoryAndTransaction &&
                  districtObj.coordinates.byCategoryAndTransaction[
                    selectedCategory
                  ] &&
                  districtObj.coordinates.byCategoryAndTransaction[
                    selectedCategory
                  ][selectedTransaction];

                return (
                  <button
                    key={districtObj.district}
                    className={`district-btn ${selectedAreas.includes(areaKey) ? "selected" : ""} 
                              ${hasData ? "" : "no-data"}`}
                    onClick={() => handleToggleArea(districtObj)}
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

        {/* Hiển thị nút khi đã chọn đủ thông tin */}
        {isAllSelected && selectedPriceInfo && (
          <div className="action-section">
            <button
              className="btn-compare"
              onClick={() => {
                navigate("/compare-chart", {
                  state: {
                    selectedProvince,
                    selectedDistrict,
                    selectedCategory,
                    selectedTransaction,
                    selectedPriceInfo,
                  },
                });
              }}
            >
              Xem giá ngay
            </button>
          </div>
        )}

        <div className="compare-info">
          <p>
            <img src={tick} alt="tick" className="compare-icon" /> Dữ liệu từ
            100 triệu tin đăng
          </p>
          <p>
            <img src={tick} alt="tick" className="compare-icon" /> Giá giao dịch
            thực tế
          </p>
          <p>
            <img src={tick} alt="tick" className="compare-icon" /> Chi tiết đến
            từng quận/phường
          </p>
          <p>
            <img src={tick} alt="tick" className="compare-icon" /> Cập nhật dữ
            liệu hằng tháng
          </p>
        </div>
      </div>

      <div className="compare-right">
        <MapView
          selectedArea={
            selectedDistrict
              ? {
                  coords: [mapCenter.lat, mapCenter.lng],
                  zoomLevel: mapZoom,
                  info: `${selectedDistrict} - ${selectedProvince}`,
                  priceInfo: selectedPriceInfo,
                  category: selectedCategory,
                  transaction: selectedTransaction,
                }
              : {
                  coords: [centerVN.lat, centerVN.lng],
                  zoomLevel: 6,
                  info: null,
                }
          }
        />
      </div>
    </div>
  );
};

const CompareAreaWithErrorBoundary = () => (
  <ErrorBoundary>
    <CompareArea />
  </ErrorBoundary>
);

export default CompareAreaWithErrorBoundary;