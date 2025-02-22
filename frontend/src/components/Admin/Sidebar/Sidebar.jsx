import { ExpandLess, ExpandMore } from "@mui/icons-material"; // Import các icon từ MUI
import React, { useState } from "react";
import "./Sidebar.css"; // Đảm bảo rằng bạn đã tạo file CSS

const Sidebar = ({ setSelectedMenu }) => {
  const [selectedMenu, setSelectedMenuState] = useState("dashboard"); // State để lưu trữ mục menu hiện tại
  const [showNewsOptions, setShowNewsOptions] = useState(false);

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setSelectedMenuState(menu);
    setShowNewsOptions(false); // Đóng submenu khi chọn menu khác
  };

  const handleNewsClick = () => {
    setShowNewsOptions(!showNewsOptions);
    setSelectedMenuState("news");
  };

  const handleSubMenuClick = (menu) => {
    setSelectedMenu(menu);
    setSelectedMenuState(menu);
  };

  return (
    <div className="home-admin-sidebar">
      <nav className="home-admin-nav-menu">
        <ul>
          <li
            className={selectedMenu === "dashboard" ? "active" : ""}
            onClick={() => handleMenuClick("dashboard")}
          >
            📊 Thống kê
          </li>
          <li
            className={selectedMenu === "manageUser" ? "active" : ""}
            onClick={() => handleMenuClick("manageUser")}
          >
            👩‍💼 Quản lý người dùng
          </li>
          <li
            className={selectedMenu === "managePost" ? "active" : ""}
            onClick={() => handleMenuClick("managePost")}
          >
            🏡 Quản lý bài đăng
          </li>
          <li
            className={selectedMenu === "news" ? "active" : ""}
            onClick={handleNewsClick}
          >
            <span>📜 Quản lý tin tức</span>
            {showNewsOptions ? (
              <ExpandLess className="MuiSvgIcon-root" />
            ) : (
              <ExpandMore className="MuiSvgIcon-root" />
            )}
          </li>
          {showNewsOptions && (
            <ul className="submenu">
              <li
                className={selectedMenu === "newsList" ? "active" : ""}
                onClick={() => handleSubMenuClick("newsList")}
              >
                📰 Danh sách tin tức
              </li>
              <li
                className={selectedMenu === "addNews" ? "active" : ""}
                onClick={() => handleSubMenuClick("addNews")}
              >
                ✍️ Thêm tin tức
              </li>
            </ul>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
