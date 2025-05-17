import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MapView from "./Map";
import tick from "../../../assets/images/tick.gif";
import {
  searchPosts,
  getDistrictCoordinatesByCity,
} from "../../../redux/postAPI";
import "./Compare.css";

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const staticErrorMessage = "Có lỗi xảy ra!";

  if (hasError) {
    return <div>{staticErrorMessage}</div>;
  }

  return children;
};

const centerVN = { lat: 14.0583, lng: 108.2772 };

const CompareArea = () => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [mapCenter, setMapCenter] = useState(centerVN);
  const [mapZoom, setMapZoom] = useState(6);
  const [posts, setPosts] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districtCoordinatesData, setDistrictCoordinatesData] = useState({});
  const [districts, setDistricts] = useState([]);
  const [selectedPriceInfo, setSelectedPriceInfo] = useState(null);

  const navigate = useNavigate();

  // ✅ Lấy dữ liệu tọa độ từ API khi component mount
  useEffect(() => {
    const fetchDistrictCoordinates = async () => {
      try {
        const data = await getDistrictCoordinatesByCity();
        console.log("✅ Dữ liệu lấy từ API:", data);
        setDistrictCoordinatesData(data);

        const allProvinces = Object.keys(data);
        console.log("🌍 Danh sách tỉnh thành:", allProvinces);
        setProvinces(allProvinces);
      } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err);
      }
    };

    fetchDistrictCoordinates();
  }, []);

  // ✅ Khi chọn tỉnh, cập nhật danh sách quận
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

  const handleProvinceChange = async (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedAreas([]);
    setMapCenter(centerVN);
    setMapZoom(6);

    try {
      const result = await searchPosts({ province });
      setPosts(result);
    } catch (err) {
      console.error("Lỗi khi lấy bài đăng:", err);
    }
  };

  // Xử lý khi chọn quận/huyện
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

      // Lấy thông tin giá cho quận/huyện được chọn
      setSelectedPriceInfo({
        commonPrice: districtObj.coordinates.commonPrice,
        priceFluctuation: districtObj.coordinates.priceFluctuation,
      });
    }
  };

  useEffect(() => {
    const fetchDistrictCoordinates = async () => {
      try {
        console.log("🚀 Gọi API lấy districtCoordinates...");
        const data = await getDistrictCoordinatesByCity();
        console.log("✅ Dữ liệu lấy từ API:", data);
        setDistrictCoordinatesData(data);

        const allProvinces = Object.keys(data);
        console.log("🌍 Danh sách tỉnh thành:", allProvinces);
        setProvinces(allProvinces);
      } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err);
      }
    };

    fetchDistrictCoordinates();
  }, []);

  return (
    <div className="compare-wrapper">
      <div className="compare-left">
        <h2 className="compare-title">So sánh giá phòng trọ</h2>
        <p className="compare-subtitle">
          Cập nhật dữ liệu giá mới nhất tháng 04/2025 tại các thành phố lớn
        </p>

        <div className="select-section">
          <label htmlFor="province-select" className="select-label">
            Chọn tỉnh/thành phố:
          </label>
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

        {/* ✅ Danh sách quận */}
        {districts.length > 0 && (
          <div className="district-buttons">
            {districts.map((districtObj) => {
              const areaKey = `${selectedProvince} - ${districtObj.district}`;
              return (
                <button
                  key={districtObj.district}
                  className={`district-btn ${
                    selectedAreas.includes(areaKey) ? "selected" : ""
                  }`}
                  onClick={() => handleToggleArea(districtObj)}
                >
                  {districtObj.district}
                </button>
              );
            })}
          </div>
        )}

        {selectedDistrict && (
          <div style={{ marginTop: "20px" }}>
            <button
              className="btn-compare"
              onClick={() => {
                navigate("/compare-chart", {
                  state: {
                    selectedProvince,
                    selectedDistrict,
                    selectedAreas,
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
            100 triệu tin đăng BĐS
          </p>
          <p>
            <img src={tick} alt="tick" className="compare-icon" /> Giá giao dịch
            thực tế
          </p>
          <p>
            <img src={tick} alt="tick" className="compare-icon" /> Chi tiết đến
            quận, phường, đường
          </p>
          <p>
            <img src={tick} alt="tick" className="compare-icon" /> Cập nhật hằng
            tháng
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
                  info: selectedDistrict,
                  priceInfo: selectedPriceInfo,
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
