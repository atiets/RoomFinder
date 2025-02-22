import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./NewsDetailUser.css";

const NewsDetailUser = () => {
  document.title = "Chi tiết tin tức";
  const { id } = useParams(); // Lấy id từ URL
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const axiosJWT = axios.create({
    baseURL: "http://localhost:8000",
  });

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const response = await axiosJWT.get(`/v1/news/${id}`);
        setNews(response.data);
        setLoading(false);

        if(!localStorage.getItem(`viewed_${id}`)) {
          const timer = setTimeout( async() => {
            try {
              const updateResponseData = await axiosJWT.get(`/v1/news/${id}`);
              setNews(updateResponseData.data);
              localStorage.setItem(`viewed_${id}`, "true");
            } catch (err) {
              console.log("Lỗi cập nhật lượt xem", err);
            }
          }, 5000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        setError("Không thể tải chi tiết tin tức.");
        setLoading(false);
      }
    };
    fetchNewsDetail();
  }, [id]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  if (error) return <p>{error}</p>;

  const formattedDate = new Date(news.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  console.log("views", news.views);

  return (
    <div className="news-detail-page">
      <div className="news-detail-content">
        <div className="news-content">
          <h2 className="news-title">{news.title}</h2>
          <div className="news-meta">
            <span className="news-views">Số người ghé thăm: {news.views}</span>
            <span className="news-author">{news.author}</span>
            <span className="news-date">, {formattedDate}</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: news.content }} />
        </div>
      </div>
    </div>
  );
};

export default NewsDetailUser;
