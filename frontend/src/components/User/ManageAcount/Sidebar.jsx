import userpic from "../../../assets/images/user.png";
import "./Sidebar.css";

const Sidebar = ({ user, setSelectedMenu }) => {
  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="sidebar-manage-user">
      <div className="user-info">
        <img
          src={user.profile?.picture || userpic}
          alt="User Avatar"
          className="avatar"
        />
        <div className="user-details">
          <h3 className="user-name">{user.username || "Tên người dùng"}</h3>
          <p className="user-phone">
            {user.profile?.phone || "Số điện thoại người dùng"}
          </p>
        </div>
      </div>
      <nav className="nav-menu">
        <ul>
          <li onClick={() => setSelectedMenu("postList")}>
            🏡 Danh sách tin đăng
          </li>
          <li onClick={() => setSelectedMenu("manageAccount")}>
            ✏️ Chỉnh sửa thông tin cá nhân
          </li>
          <li onClick={() => setSelectedMenu("changePass")}>
            🔒 Đổi mật khẩu
          </li>
          <li onClick={() => setSelectedMenu("favoritePosts")}>
            ❤️ Danh sách yêu thích
          </li>
          <li onClick={() => setSelectedMenu("forumPosts")}>
            🕒 Bài viết trên diễn đàn
          </li>
          <li onClick={() => setSelectedMenu("viewedPosts")}>
            🕒 Bài đăng đã xem
          </li>
          <li onClick={() => setSelectedMenu("transactionHistory")}>
            💳 Lịch sử giao dịch
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;