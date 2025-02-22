import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import RoomPost from "../Post/RoomPost";
import "./searchResultPage.css";
import { useFavoriteToggle } from "../../../redux/postAPI";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const SearchResultsPage = () => {
  document.title = "Kết quả tìm kiếm";
  const location = useLocation();
  const { results, filters } = location.state || { results: [], filters: {} };
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 9;
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const user = useSelector((state) => state.auth.login.currentUser);
  let axiosJWT = axios.create({
    baseURL: "https://befindrentalrooms-production.up.railway.app",
  });

  const { toggleFavorite } = useFavoriteToggle(user);

  const sortedResults = [...results].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

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
          Navigate("/login");
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
    const maxPageNumbers = 5; // Max number of page buttons
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
    <div className="search-results-page">
      <h2 className="search-results-page__title">Kết Quả Tìm Kiếm</h2>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : currentPosts.length > 0 ? (
        <div className="search-results-page__post-list">
          {currentPosts.map((post) => (
            <RoomPost
              key={post.id}
              post={post}
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
      ) : (
        <p className="search-results-page__no-result">
          Không tìm thấy bài đăng nào.
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination__button"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {getPageNumbers().map((number) => (
            <button
              key={number}
              className={`pagination__button ${currentPage === number ? "active" : ""}`}
              onClick={() => paginate(number)}
            >
              {number}
            </button>
          ))}

          <button
            className="pagination__button"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
