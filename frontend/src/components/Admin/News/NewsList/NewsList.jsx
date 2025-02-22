import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./NewsList.css";

const NewsList = () => {
  document.title = "Danh sách tin tức";
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedNews, setSelectedNews] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;
  let axiosJWT = axios.create({
    baseURL: "https://befindrentalrooms-production.up.railway.app",
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

  const handleNewsClick = (news) => {
    console.log("News clicked:", news);
    navigate(`/manage-news/${news._id}`);
    setSelectedNews(news);
  };

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
    <div className="news-list-admin-container">
      <h2 className="news-list-title">Tin Tức Mới Nhất</h2>
      <ul className="news-list">
        {currentNews.map((news) => (
          <li
            key={news.id}
            className="news-item"
            onClick={() => handleNewsClick(news)}
          >
            <Link to={`/manage-news/${news._id}`} className="news-link">
              {news.imageUrl && (
                <img
                  src={`https://befindrentalrooms-production.up.railway.app${news.imageUrl || "/placeholder.jpg"}`}
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

export default NewsList;
