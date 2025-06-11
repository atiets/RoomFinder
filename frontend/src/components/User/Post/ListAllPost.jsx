import { Pagination } from "@mui/material";
import axios from "axios";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useFavoriteToggle } from "../../../redux/postAPI";
import RoomPost from "./RoomPost";
import "./RoomPost.css";

const ListAllPost = ({ posts, handleTitleClick }) => {
  const [favorites, setFavorites] = React.useState([]);
  const [sortOption, setSortOption] = React.useState("default");
  const [currentPage, setCurrentPage] = React.useState(1);
  const user = useSelector((state) => state.auth.login.currentUser);
  const navigate = useNavigate();
  const postsPerPage = 9;
  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });

  const { toggleFavorite } = useFavoriteToggle(user);

  React.useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axiosJWT.get("/v1/posts/favorites", {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        });
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error);
      }
    };

    if (user?.accessToken) {
      fetchFavorites();
    }
  }, [user]);

  const handleToggleFavorite = (id, isFavorite) => {
    if (!user) {
      Swal.fire({
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để thêm bài đăng vào danh sách yêu thích.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (!id) {
      console.error("ID của bài đăng không hợp lệ:", id);
      return;
    }

    toggleFavorite(id, isFavorite)
      .then(() => {
        setFavorites(
          isFavorite
            ? favorites.filter((fav) => fav._id !== id)
            : [...favorites, { _id: id }],
        );
      })
      .catch((error) =>
        console.error("Lỗi khi bật/tắt trạng thái yêu thích:", error),
      );
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  // ⭐ Enhanced sorting với VIP priority
  const sortedPosts = React.useMemo(() => {
    let sorted = [...posts];
    
    // ⭐ Luôn sort VIP lên đầu trước
    sorted.sort((a, b) => {
      // VIP posts luôn lên đầu
      if (a.isVip && !b.isVip) return -1;
      if (!a.isVip && b.isVip) return 1;
      
      // Nếu cùng loại (VIP hoặc thường), sort theo option
      switch (sortOption) {
        case "priceAsc":
          return (a.price || 0) - (b.price || 0);
        case "priceDesc":
          return (b.price || 0) - (a.price || 0);
        case "areaAsc":
          return (a.area || 0) - (b.area || 0);
        case "areaDesc":
          return (b.area || 0) - (a.area || 0);
        case "viewsDesc":
          return (b.views || 0) - (a.views || 0);
        default:
          // Default: mới nhất (có thể dùng createdAt nếu có)
          return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
      }
    });
    
    return sorted;
  }, [posts, sortOption]);

  const paginatedPosts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return sortedPosts.slice(startIndex, endIndex);
  }, [sortedPosts, currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // ⭐ Count VIP and normal posts
  const vipCount = posts.filter(post => post.isVip).length;
  const normalCount = posts.length - vipCount;

  return (
    <>
      {/* ⭐ Enhanced sort options với VIP info */}
      <div className="sort-options" style={{ 
        marginBottom: "20px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "10px",
        background: "#f8f9fa",
        borderRadius: "8px"
      }}>
        
        <select value={sortOption} onChange={handleSortChange} style={{
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          background: "white"
        }}>
          <option value="default">🌟 Mới nhất</option>
          <option value="priceAsc">💰 Giá thấp → cao</option>
          <option value="priceDesc">💰 Giá cao → thấp</option>
          <option value="areaAsc">📐 Diện tích nhỏ → lớn</option>
          <option value="areaDesc">📐 Diện tích lớn → nhỏ</option>
          <option value="viewsDesc">👁️ Lượt xem cao nhất</option>
        </select>
      </div>
      
      <div className="approved-posts-list">
        {paginatedPosts.map((post, index) => (
          <RoomPost
            key={post._id || index}
            post={post}
            onTitleClick={handleTitleClick}
            isFavorite={favorites.some((fav) => fav._id === post._id)}
            onToggleFavorite={() =>
              handleToggleFavorite(
                post._id,
                favorites.some((fav) => fav._id === post._id),
              )
            }
          />
        ))}
      </div>
      
      <div className="approved-post-list-container-pagination">
        <Pagination
          count={Math.ceil(sortedPosts.length / postsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default ListAllPost;