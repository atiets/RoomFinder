import { Pagination } from "@mui/material";
import React from "react";
import RoomPost from "./RoomPost";
import "./RoomPost.css";
import { useFavoriteToggle } from "../../../redux/postAPI";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ListAllPost = ({ posts, handleTitleClick }) => {
  const [favorites, setFavorites] = React.useState([]);
  const [sortOption, setSortOption] = React.useState("default");
  const [currentPage, setCurrentPage] = React.useState(1);
  const user = useSelector((state) => state.auth.login.currentUser);
  const navigate = useNavigate();
  const postsPerPage = 9;
  let axiosJWT = axios.create({
    baseURL: "https://befindrentalrooms-production.up.railway.app",
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
      // Hiển thị thông báo và chuyển hướng
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

  const sortedPosts = React.useMemo(() => {
    let sorted = [...posts];
    switch (sortOption) {
      case "priceAsc":
        sorted.sort((a, b) => a.rentalPrice - b.rentalPrice);
        break;
      case "priceDesc":
        sorted.sort((a, b) => b.rentalPrice - a.rentalPrice);
        break;
      case "areaAsc":
        sorted.sort((a, b) => a.area - b.area);
        break;
      case "areaDesc":
        sorted.sort((a, b) => b.area - a.area);
        break;
      default:
        break;
    }
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

  return (
    <>
      <div className="sort-options" style={{ marginBottom: "20px" }}>
        <select value={sortOption} onChange={handleSortChange}>
          <option value="default">Mặc định</option>
          <option value="priceAsc">Giá thuê (Tăng dần)</option>
          <option value="priceDesc">Giá thuê (Giảm dần)</option>
          <option value="areaAsc">Diện tích (Tăng dần)</option>
          <option value="areaDesc">Diện tích (Giảm dần)</option>
        </select>
      </div>
      <div className="approved-posts-list">
        {paginatedPosts.map((post, index) => (
          <RoomPost
            key={index}
            post={post}
            onTitleClick={handleTitleClick}
            isFavorite={favorites.some((fav) => fav._id === post._id)} // Dùng đúng trường ID
            onToggleFavorite={() =>
              handleToggleFavorite(
                post._id, // Sử dụng đúng trường ID (_id từ API)
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
