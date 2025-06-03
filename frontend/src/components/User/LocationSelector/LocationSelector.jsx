// components/LocationSelector/LocationSelector.js
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./LocationSelector.css";

const LocationSelector = ({ filters, setFilters, onLocationChange }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch provinces khi component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(
          "https://provinces.open-api.vn/api/?depth=3"
        );
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };

    fetchProvinces();
  }, []);

  // Auto-adjust dropdown position
  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      const dropdown = dropdownRef.current;
      const rect = dropdown.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Nếu dropdown bị tràn ra ngoài bên phải
      if (rect.right > viewportWidth) {
        dropdown.classList.add('adjust-right');
      } else {
        dropdown.classList.remove('adjust-right');
      }
    }
  }, [isDropdownOpen]);

  // Reset districts khi province thay đổi
  useEffect(() => {
    if (selectedProvince) {
      setDistricts(selectedProvince.districts || []);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setWards([]);
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setWards([]);
    }
  }, [selectedProvince]);

  // Reset wards khi district thay đổi
  useEffect(() => {
    if (selectedDistrict) {
      setWards(selectedDistrict.wards || []);
      setSelectedWard(null);
    } else {
      setWards([]);
      setSelectedWard(null);
    }
  }, [selectedDistrict]);

  const handleProvinceSelect = (province) => {
    setSelectedProvince(province);
    const newFilters = {
      ...filters,
      province: province ? province.name : "",
      district: "",
      ward: "",
    };
    setFilters(newFilters);
    if (onLocationChange) {
      onLocationChange(newFilters);
    }
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    const newFilters = {
      ...filters,
      district: district ? district.name : "",
      ward: "",
    };
    setFilters(newFilters);
    if (onLocationChange) {
      onLocationChange(newFilters);
    }
  };

  const handleWardSelect = (ward) => {
    setSelectedWard(ward);
    const newFilters = {
      ...filters,
      ward: ward ? ward.name : "",
    };
    setFilters(newFilters);
    if (onLocationChange) {
      onLocationChange(newFilters);
    }
    setIsDropdownOpen(false);
  };

  const handleClearLocation = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    const newFilters = {
      ...filters,
      province: "",
      district: "",
      ward: "",
    };
    setFilters(newFilters);
    if (onLocationChange) {
      onLocationChange(newFilters);
    }
    setIsDropdownOpen(false);
  };

  const getDisplayText = () => {
    if (selectedWard) {
      return `${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;
    } else if (selectedDistrict) {
      return `${selectedDistrict.name}, ${selectedProvince.name}`;
    } else if (selectedProvince) {
      return selectedProvince.name;
    }
    return "Chọn địa điểm";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="location-selector" ref={dropdownRef}>
      <div className="location-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <span 
          className={`location-text ${getDisplayText() !== 'Chọn địa điểm' ? 'active' : ''}`}
          title={getDisplayText()} /* Tooltip hiển thị full text */
        >
          {getDisplayText()}
        </span>
        <i className={`fas fa-chevron-down location-icon ${isDropdownOpen ? 'open' : ''}`}></i>
      </div>

      {isDropdownOpen && (
        <div className="location-dropdown-menu">
          {/* Header với nút clear */}
          <div className="location-header">
            <span className="location-title">Chọn địa điểm</span>
            <button 
              className="location-clear-btn"
              onClick={handleClearLocation}
            >
              Xóa tất cả
            </button>
          </div>

          <div className="location-content">
            {/* Cột Tỉnh/Thành phố */}
            <div className="location-column">
              <div className="location-column-header">Tỉnh/Thành phố</div>
              <div className="location-list">
                <div
                  className={`location-item ${!selectedProvince ? 'active' : ''}`}
                  onClick={() => handleProvinceSelect(null)}
                >
                  Tất cả tỉnh thành
                </div>
                {provinces.map((province) => (
                  <div
                    key={province.code}
                    className={`location-item ${
                      selectedProvince?.code === province.code ? 'active' : ''
                    }`}
                    onClick={() => handleProvinceSelect(province)}
                  >
                    {province.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Cột Quận/Huyện */}
            {selectedProvince && (
              <div className="location-column">
                <div className="location-column-header">Quận/Huyện</div>
                <div className="location-list">
                  <div
                    className={`location-item ${!selectedDistrict ? 'active' : ''}`}
                    onClick={() => handleDistrictSelect(null)}
                  >
                    Tất cả quận/huyện
                  </div>
                  {districts.map((district) => (
                    <div
                      key={district.code}
                      className={`location-item ${
                        selectedDistrict?.code === district.code ? 'active' : ''
                      }`}
                      onClick={() => handleDistrictSelect(district)}
                    >
                      {district.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cột Phường/Xã */}
            {selectedDistrict && (
              <div className="location-column">
                <div className="location-column-header">Phường/Xã</div>
                <div className="location-list">
                  <div
                    className={`location-item ${!selectedWard ? 'active' : ''}`}
                    onClick={() => handleWardSelect(null)}
                  >
                    Tất cả phường/xã
                  </div>
                  {wards.map((ward) => (
                    <div
                      key={ward.code}
                      className={`location-item ${
                        selectedWard?.code === ward.code ? 'active' : ''
                      }`}
                      onClick={() => handleWardSelect(ward)}
                    >
                      {ward.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;