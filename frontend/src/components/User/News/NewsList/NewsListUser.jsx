import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./NewsListUser.css";

const NewsListUser = () => {
  document.title = "Danh sách tin tức";
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;
  const baseURL = "https://befindrentalrooms-production.up.railway.app";
  let axiosJWT = axios.create({
    baseURL,
  });

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosJWT.get("/v1/news");
        setNewsList(response.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải tin tức.");
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  if (error) return <p>{error}</p>;

  // Sort news by newest first
  const sortedNewsList = [...newsList].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // Pagination logic
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = sortedNewsList.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(sortedNewsList.length / newsPerPage);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Function to display page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 5; // Maximum number of page buttons to show
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
    <div className="news-list-container">
      <div className="news-title-iclude">
        <h2 className="news-list-title">Tin tức thị trường mới nhất và chia sẻ kinh nghiệm tìm trọ</h2>
      </div>
      <ul className="news-list">
        {currentNews.map((news) => (
          <li key={news._id} className="news-item">
            <Link to={`/news/${news._id}`} className="news-link">
              {news.imageUrl && (
                <img
                  src={`${baseURL}${news.imageUrl || "/placeholder.jpg"}`}
                  alt={news.title}
                  className="news-image"
                />
              )}
              <div className="news-content">
                <h3>{news.title}</h3>
                <p className="news-description">{news.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
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

export default NewsListUser;
