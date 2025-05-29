import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import RoomPost from "../Post/RoomPost";
import "./FavoritePosts.css";

const FavoritePosts = () => {
  document.title = "Danh sách yêu thích";
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.login.currentUser);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 2;
  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axiosJWT.get("/v1/posts/favorites", {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.accessToken) {
      fetchFavorites();
    }
  }, [user]);

  const handleTitleClick = (postId) => {
    navigate(`/posts/${postId}`);
  };

  const handleToggleFavorite = async (postId, isCurrentlyFavorite) => {
    try {
      const result = await Swal.fire({
        title:
          "Bạn có chắc chắn muốn xóa bài viết này khỏi danh sách yêu thích?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        // Xóa bài viết khỏi danh sách yêu thích nếu người dùng xác nhận
        await axiosJWT.delete(`/v1/posts/${postId}/favorite`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
        // Cập nhật danh sách yêu thích sau khi xóa
        setFavorites(favorites.filter((post) => post._id !== postId)); // Xóa bài viết khỏi danh sách
        Swal.fire(
          "Đã xóa!",
          "Bài viết đã được xóa khỏi danh sách yêu thích.",
          "success",
        );
      } else {
        Swal.fire("Đã hủy!", "Bài viết vẫn ở lại danh sách yêu thích.", "info");
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái yêu thích:", error);
      Swal.fire(
        "Lỗi!",
        "Có lỗi xảy ra khi xóa bài viết khỏi danh sách yêu thích.",
        "error",
      );
    }
  };

  // Sắp xếp bài viết yêu thích theo ngày tạo
  const sortedFavoritePosts = [...favorites].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // Tính toán phân trang
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentPosts = sortedFavoritePosts.slice(
    indexOfFirstNews,
    indexOfLastNews,
  );
  const totalPages = Math.ceil(sortedFavoritePosts.length / newsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Hàm để hiển thị các nút trang với giới hạn
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 5; // Số lượng nút trang tối đa hiển thị
    let startPage = Math.max(currentPage - Math.floor(maxPageNumbers / 2), 1);
    let endPage = startPage + maxPageNumbers - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxPageNumbers + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div className="favorite-posts">
      {loading ? (
        <p>Loading...</p>
      ) : favorites.length === 0 ? (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            textAlign: "center",
            fontSize: "18px",
            color: "#555",
            marginTop: "20px",
          }}
        >
          Không có bài viết yêu thích nào.
        </motion.p>
      ) : (
        <div className="favorites-list">
          {currentPosts.map((post) => (
            <RoomPost
              key={post._id}
              post={post}
              onTitleClick={handleTitleClick}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={true}
            />
          ))}
        </div>
      )}

      <div className="pagination">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          &laquo; Trước
        </button>
        {getPageNumbers().map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`pagination-button ${currentPage === number ? "active" : ""}`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Tiếp &raquo;
        </button>
      </div>
    </div>
  );
};

export default FavoritePosts;
