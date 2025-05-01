import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "./Map";
import { FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import tick from "../../../assets//images/tick.gif";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { searchPosts, getApprovedPosts } from "../../../redux/postAPI";
import "./Compare.css";

const centerVN = { lat: 14.0583, lng: 108.2772 }; // Tâm Việt Nam

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const staticErrorMessage = "Có lỗi xảy ra!";

  const componentDidCatch = (error, info) => {
    setHasError(true);
    console.error("Lỗi bị bắt:", error, info);
  };

  if (hasError) {
    return <div>{staticErrorMessage}</div>;
  }

  return children;
};

const CompareArea = () => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [mapCenter, setMapCenter] = useState(centerVN);
  const [mapZoom, setMapZoom] = useState(6);
  const [posts, setPosts] = useState([]); 
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const [provinces, setProvinces] = useState([]);

  //lấy danh sách tỉnh
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getApprovedPosts();
        const posts = data?.posts || [];

        const provincesRaw = posts.map((post) => post.address?.province);
        const uniqueProvinces = [...new Set(provincesRaw.filter(Boolean))];

        console.log("✅ Các tỉnh/thành phố lấy được:", uniqueProvinces);

        setProvinces(uniqueProvinces);
      } catch (err) {
        console.error("❌ Lỗi khi gọi getApprovedPosts:", err);
      }
    };

    fetchProvinces();
  }, []);

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProvince) return;

      try {
        const result = await searchPosts({ province: selectedProvince }, token);
        setPosts(result); // Lưu dữ liệu vào state
        console.log("Bài đăng theo tỉnh:", result);
      } catch (error) {
        console.error("Không thể lấy bài đăng theo tỉnh:", error);
      }
    };

    fetchData();
  }, [selectedProvince, token]);

  // const handleToggleArea = (district) => {
  //   const areaName = `${selectedProvince} - ${district}`;
    
  //   // Nếu đã chọn quận này, thì bỏ chọn (deselect)
  //   if (selectedAreas.includes(areaName)) {
  //     setSelectedAreas([]); // Bỏ chọn tất cả
  //     setSelectedDistrict(null); // Bỏ thông tin quận
  //   } else {
  //     // Nếu chưa chọn quận này, thì chọn quận mới và bỏ chọn quận cũ
  //     setSelectedAreas([areaName]); // Chỉ lưu 1 quận duy nhất
  //     const districtPos = area[selectedProvince]?.districts[district];
  //     if (districtPos) {
  //       setMapCenter(districtPos);
  //       setMapZoom(13);
  //       setSelectedDistrict(districtPos); // Lưu thông tin quận đã chọn
  //     }
  //   }
  // };  

  // const handleViewPrice = () => {
  //   if (selectedAreas.length > 0) {
  //     navigate("/compare-chart", {
  //       state: { selectedAreas, area },
  //     });
  //   } else {
  //     Swal.fire({
  //       title: "Chưa chọn khu vực",
  //       text: "Vui lòng chọn ít nhất một khu vực để xem biểu đồ.",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonText: "Chọn khu vực",
  //       cancelButtonText: "Hủy",
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //       }
  //     });
  //   }
  // };

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

        {/* {selectedProvince && area[selectedProvince] && area[selectedProvince].districts && (
          <div className="district-buttons">
            {Object.keys(area[selectedProvince].districts).map((district) => {
              const areaKey = `${selectedProvince} - ${district}`;
              return (
                <button
                  key={district}
                  className={`district-btn ${selectedAreas.includes(areaKey) ? "selected" : ""}`}
                  onClick={() => handleToggleArea(district)}
                >
                  {district}
                </button>
              );
            })}
          </div>
        )} */}

        {/* <button className="view-price-btn" onClick={handleViewPrice}>
          Xem giá ngay
        </button> */}

        <div className="compare-info">
  <p>
    <img src={tick} alt="tick" className="compare-icon" />
    Dữ liệu từ 100 triệu tin đăng BĐS
  </p>
  <p>
    <img src={tick} alt="tick" className="compare-icon" />
    Giá giao dịch thực tế
  </p>
  <p>
    <img src={tick} alt="tick" className="compare-icon" />
    Chi tiết đến quận, phường, đường
  </p>
  <p>
    <img src={tick} alt="tick" className="compare-icon" />
    Cập nhật hằng tháng
  </p>
</div>

{posts.length > 0 && (
        <div className="post-list">
          <h3>Bài đăng ở tỉnh: {selectedProvince}</h3>
          <ul>
            {posts.map((post) => (
              <li key={post._id}>
                <strong>{post.title}</strong> – {post.address?.district}, {post.address?.province}
              </li>
            ))}
          </ul>
        </div>
      )}


      </div>

      <div className="compare-right">
        <MapView
          selectedArea={{
            coords: [mapCenter.lat, mapCenter.lng], 
            zoomLevel: mapZoom,
            info: selectedDistrict
          }}
        />
      </div>
    </div>
  );
};

const CompareAreaWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <CompareArea />
    </ErrorBoundary>
  );
};

export default CompareAreaWithErrorBoundary;