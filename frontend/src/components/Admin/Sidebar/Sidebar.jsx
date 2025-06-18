import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ setSelectedMenu }) => {
  const [selectedMenu, setSelectedMenuState] = useState("dashboard");
  const [showNewsOptions, setShowNewsOptions] = useState(false);

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setSelectedMenuState(menu);
    setShowNewsOptions(false); // Đóng submenu khi chọn menu khác
  };

  const handleNewsClick = () => {
    setShowNewsOptions(!showNewsOptions);
    // Chỉ set selectedMenu thành "news" nếu chưa có submenu nào được chọn
    if (!showNewsOptions) {
      setSelectedMenu("news");
      setSelectedMenuState("news");
    }
  };

  const handleSubMenuClick = (menu) => {
    setSelectedMenu(menu);
    setSelectedMenuState(menu);
  };

  // Helper function để check nếu news menu hoặc submenu đang active
  const isNewsMenuActive = () => {
    return selectedMenu === "news" || selectedMenu === "newsList" || selectedMenu === "addNews";
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
            className={selectedMenu === "thread" ? "active" : ""}
            onClick={() => handleMenuClick("thread")}
          >
            🧵 Quản lý bài viết ở diễn đàn
          </li>
          <li
            className={selectedMenu === "report" ? "active" : ""}
            onClick={() => handleMenuClick("report")}
          >
            📢 Khiếu nại, phản hồi
          </li>
          <li
            className={isNewsMenuActive() ? "active" : ""} // Cải thiện logic active
            onClick={handleNewsClick}
          >
            <span>📜 Quản lý tin tức</span>
            {showNewsOptions ? (
              <ExpandLess className="MuiSvgIcon-root" />
            ) : (
              <ExpandMore className="MuiSvgIcon-root" />
            )}
          </li>
          
          {/* XÓA DÒNG <li> RỖNG Ở ĐÂY */}
          
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