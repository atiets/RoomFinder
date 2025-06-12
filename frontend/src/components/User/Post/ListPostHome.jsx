import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import Swal from "sweetalert2";
import arrowsIcon from "../../../assets/images/arrowIcon.png";
import { viewPost } from "../../../redux/chatApi";
import { useFavoriteToggle } from "../../../redux/postAPI";
import "./ListPostHome.css";
import RoomPost from "./RoomPost";

const ListPostHome = ({ post = [], title, favorite }) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [refreshUI, setRefreshUI] = useState(0); // Thêm state để force re-render UI
  const user = useSelector((state) => state.auth.login.currentUser);
  const userId = user?._id;
  const token = user?.accessToken;
  
  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API || "http://localhost:8000",
  });

  // Hàm kiểm tra bài đăng có trong danh sách yêu thích không
  const isPostFavorited = (postItem) => {
    if (!favorites || !favorites.length) return false;
    
    return favorites.some(fav => {
      if (typeof fav === 'string') {
        // Nếu fav là chuỗi ID
        return fav === postItem.id || fav === postItem._id;
      } else {
        // Nếu fav là object
        return fav.id === postItem.id || fav._id === postItem._id || fav === postItem.id;
      }
    });
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axiosJWT.get("/v1/posts/favorites", {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
        console.log("Dữ liệu yêu thích từ API:", response.data.favorites);
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error);
      }
    };

    if (user?.accessToken) {
      fetchFavorites();
    }
  }, [user, refreshUI]); // Thêm refreshUI để trigger fetch lại dữ liệu

  const handleTitleClick = async (id) => {
    if (!id) {
      console.error("ID bài đăng không hợp lệ");
      return;
    }
    try {
      await viewPost(id, userId, token);
      navigate(`/posts/${id}`);
    } catch (error) {
      console.error("Lỗi khi gọi API xem bài đăng:", error);
      navigate(`/posts/${id}`);
    }
  };

  const handleToggleFavorite = async (postId, isFavorite) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để thêm bài đăng vào danh sách yêu thích.",
        confirmButtonText: "Đăng nhập",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    try {
      console.log(`Đang ${isFavorite ? 'xóa khỏi' : 'thêm vào'} yêu thích:`, postId);
      
      const baseUrl = process.env.REACT_APP_BASE_URL_API || "http://localhost:8000";
      const url = `${baseUrl}/v1/posts/${postId}/favorite`;
      
      let response;
      if (isFavorite) {
        // Xóa khỏi danh sách yêu thích
        response = await axiosJWT.delete(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Thêm vào danh sách yêu thích
        response = await axiosJWT.post(url, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Cập nhật danh sách yêu thích từ phản hồi API
      if (response.data.favorites) {
        console.log("Danh sách yêu thích mới:", response.data.favorites);
        setFavorites(response.data.favorites);
        setRefreshUI(prev => prev + 1); // Force re-render
      }
    } catch (error) {
      console.error("Lỗi khi bật/tắt yêu thích:", error);
      if (error.response) {
        console.error("Server status:", error.response.status);
        console.error("Server data:", error.response.data);
      }
    }
  };

  // Sort posts với VIP lên đầu
  const sortedPosts = React.useMemo(() => {
    if (!Array.isArray(post)) return [];
    
    return [...post].sort((a, b) => {
      // VIP posts lên đầu
      if (a.isVip && !b.isVip) return -1;
      if (!a.isVip && b.isVip) return 1;
      
      // Cùng loại thì sort theo thời gian
      return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
    });
  }, [post]);

  const sliderSettings = {
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  const isPostArray = Array.isArray(post);
  
  // Count VIP posts for display
  const vipCount = sortedPosts.filter(p => p.isVip).length;

  return (
    <div className="approved-posts-slider">
      <div className="approved-post-in-home-title">
        {title}
        {vipCount > 0 && (
          <span className="vip-indicator">
            🌟 {vipCount} tin VIP
          </span>
        )}
      </div>
      
      {isPostArray ? (
        <Slider {...sliderSettings}>
          {sortedPosts.slice(0, 5).map((postItem, index) => (
            <div key={postItem.id || postItem._id || index} className="approved-posts-item">
              <RoomPost
                post={postItem}
                onTitleClick={() => handleTitleClick(postItem.id || postItem._id)}
                isFavorite={isPostFavorited(postItem)}
                onToggleFavorite={() => handleToggleFavorite(postItem.id || postItem._id, isPostFavorited(postItem))}
              />
              {index === Math.min(sortedPosts.length, 5) - 1 && (
                <button
                  className="see-more-button"
                  onClick={() => {
                    if (title === "Mua bán bất động sản") {
                      navigate("/CanBan");
                    } else if (title === "Cho thuê bất động sản") {
                      navigate("/ChoThue");
                    }
                  }}
                >
                  Xem thêm
                  <img
                    src={arrowsIcon}
                    alt="arrows"
                    className="style-icon-btn-see-more"
                  />
                </button>
              )}
            </div>
          ))}
        </Slider>
      ) : (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default ListPostHome;