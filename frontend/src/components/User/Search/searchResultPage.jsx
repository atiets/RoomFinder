import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useFavoriteToggle } from "../../../redux/postAPI";
import { viewPost } from "../../../redux/chatApi";
import RoomPost from "../Post/RoomPost";
import "./searchResultPage.css";

const SearchResultsPage = () => {
  document.title = "Kết quả tìm kiếm";
  const location = useLocation();
  const navigate = useNavigate();
  const { results, filters } = location.state || { results: [], filters: {} };
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 9;
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const user = useSelector((state) => state.auth.login.currentUser);
  const userId = user?._id;
  const token = user?.accessToken;
  
  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });

  const { toggleFavorite } = useFavoriteToggle(user);

  // ⭐ Enhanced sorting với VIP priority
  const sortedResults = useMemo(() => {
    let sorted = [...results];
    
    // Luôn sort VIP lên đầu trước
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
          // Default: mới nhất
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
    
    return sorted;
  }, [results, sortOption]);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await axiosJWT.get("/v1/posts/favorites", {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        });
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.accessToken) {
      fetchFavorites();
    }
  }, [user]);

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

  const handleToggleFavorite = (id, isFavorite) => {
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

    if (!id) {
      console.error("Invalid post ID:", id);
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
      .catch((error) => console.error("Error toggling favorite:", error));
  };

  // Pagination logic
  const indexOfLastPost = currentPage * newsPerPage;
  const indexOfFirstPost = indexOfLastPost - newsPerPage;
  const currentPosts = sortedResults.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(sortedResults.length / newsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Display page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 5;
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

  // ⭐ Count VIP and normal posts
  const vipCount = results.filter(post => post.isVip).length;
  const normalCount = results.length - vipCount;

  return (
    <div className="search-results-page">
      {/* ⭐ Header - Centered */}
      <div className="search-results-header">
        <h2 className="search-results-title">KẾT QUẢ TÌM KIẾM</h2>
        <div className="search-results-count">
          📊 Tìm thấy <strong>{results.length}</strong> kết quả
        </div>
      </div>

      {/* ⭐ Sort Option - Simple and Centered */}
      {results.length > 0 && (
        <div className="search-sort-container">
          <label htmlFor="sort-select" className="sort-label">Sắp xếp:</label>
          <select 
            id="sort-select"
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className="sort-select"
          >
            <option value="default">🌟 Mới nhất</option>
            <option value="priceAsc">💰 Giá thấp → cao</option>
            <option value="priceDesc">💰 Giá cao → thấp</option>
            <option value="areaAsc">📐 Diện tích nhỏ → lớn</option>
            <option value="areaDesc">📐 Diện tích lớn → nhỏ</option>
            <option value="viewsDesc">👁️ Lượt xem cao nhất</option>
          </select>
        </div>
      )}

      {/* ⭐ Content Area */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải kết quả...</p>
        </div>
      ) : currentPosts.length > 0 ? (
        <div className="search-results-content">
          <div className="search-results-grid">
            {currentPosts.map((post) => (
              <RoomPost
                key={post._id}
                post={post}
                onTitleClick={() => handleTitleClick(post._id)}
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
        </div>
      ) : (
        <div className="no-results-container">
          <div className="no-results-content">
            <h3>😔 Không tìm thấy kết quả phù hợp</h3>
            <p>Không tìm thấy bài đăng nào phù hợp với tiêu chí tìm kiếm.</p>
            <p>Hãy thử điều chỉnh bộ lọc tìm kiếm.</p>
          </div>
        </div>
      )}

      {/* ⭐ Pagination - Centered */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              ‹ Trước
            </button>

            {getPageNumbers().map((number) => (
              <button
                key={number}
                className={`pagination-button ${currentPage === number ? "active" : ""}`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}

            <button
              className="pagination-button"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              Sau ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;