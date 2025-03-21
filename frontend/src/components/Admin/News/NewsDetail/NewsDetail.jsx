import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { setSelectedMenu } from "../../../../redux/menuSlice";
import "./NewsDetail.css";

const NewsDetail = () => {
  document.title = "Chi tiết tin tức";
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });

  const handleEdit = () => {
    navigate(`/manage-news/edit/${id}`);
  };

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const response = await axiosJWT.get(`/v1/news/${id}`);
        setNews(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu tin tức:", err);
        setError("Không thể tải chi tiết tin tức.");
        setLoading(false);
      }
    };
    if (id) fetchNewsDetail();
  }, [id]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  if (error) return <p>{error}</p>;
  if (!news) return <p>Không tìm thấy tin tức.</p>;

  const handleDelete = async (newsId) => {
    try {
      const result = await Swal.fire({
        title: "Bạn có chắc chắn muốn xóa tin tức này không?",
        text: "Hành động này không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        // Tiến hành xóa tin tức nếu người dùng xác nhận
        await axiosJWT.delete(`/v1/news/${newsId}`);
        navigate("/admin-dashboard");
        dispatch(setSelectedMenu("newsList"));
        toast.success("Xóa tin tức thành công!");
      } else {
        toast.info("Đã hủy xóa tin tức.");
      }
    } catch (err) {
      console.error("Lỗi khi xóa tin tức:", err);
      toast.error("Không thể xóa tin tức.");
    }
  };

  const formattedDate = new Date(news.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="news-detail-page">
      <ToastContainer position="top-right" autoClose={5000} />{" "}
      {/* Only one ToastContainer */}
      {/* Main Content */}
      <div className="news-detail-content">
        <div className="button-group">
          <button onClick={handleBack} className="back-button">
            ← Quay lại
          </button>
          <div className="action-buttons">
            <button onClick={handleEdit} className="edit-button">
              Sửa
            </button>
            <button onClick={() => handleDelete(id)} className="delete-button">
              Xóa
            </button>
          </div>
        </div>
        <div className="news-content">
          <h2 className="news-title">{news.title}</h2>
          <div className="news-meta">
            <span className="news-author">{news.author}</span>
            <span className="news-date">, {formattedDate}</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: news.content }} />
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
