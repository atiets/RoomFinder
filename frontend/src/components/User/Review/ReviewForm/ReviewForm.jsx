import { Typography } from "@mui/material";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { createReview } from "../../../../redux/postAPI";
import "./ReviewForm.css";

const ReviewForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postId, setPostId] = useState(id);
  const [rating, setRating] = useState(0); // Default rating
  const [hoveredRating, setHoveredRating] = useState(null); // Hover state
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const user_id = currentUser?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!postId || !user_id || !rating) {
      setError("Post ID, User ID, and Rating are required.");
      return;
    }

    setLoading(true);
    try {
      const reviewData = { rating, comment, user_id };
      await createReview(postId, reviewData, token);

      // Reset form fields
      setRating(0);
      setComment("");
      setShowForm(false);

      // Hiển thị thông báo thành công
      toast.success("Đánh giá thành công! Cảm ơn bạn.", {
        position: "top-right",
        autoClose: 2000, // Thời gian hiển thị thông báo
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClose: () => {
          window.location.reload();
        },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add review.");

      // Hiển thị thông báo lỗi
      toast.error("Đánh giá thất bại. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (index) => {
    setRating(index + 1);
  };

  const handleStarMouseEnter = (index) => {
    setHoveredRating(index + 1);
  };

  const handleStarMouseLeave = () => {
    setHoveredRating(null);
  };

  const handleAddReviewClick = () => {
    if (!currentUser) {
      Swal.fire({
        title: "Yêu cầu đăng nhập",
        text: "Bạn cần đăng nhập trước khi đánh giá.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Hủy",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }
    setShowForm(true);
  };

  return (
    <div className="addreview-review-header">
      <Typography className="add-review-post-title">
        Đánh giá & bình luận
      </Typography>
      <button onClick={handleAddReviewClick} className="addreview-button">
        Đánh giá ngay
      </button>
      {showForm && (
        <div className="addreview-overlay">
          <div className="addreview-form-container">
            <h3>Thêm Đánh Giá</h3>
            <form onSubmit={handleSubmit}>
              <div className="addreview-form-group">
                <label>Đánh giá:</label>
                <div className="addreview-stars">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      onClick={() => handleStarClick(index)}
                      onMouseEnter={() => handleStarMouseEnter(index)}
                      onMouseLeave={handleStarMouseLeave}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={
                        index < (hoveredRating || rating)
                          ? "#FFD700"
                          : "#E4E5E9"
                      }
                      width="36px"
                      height="36px"
                      className="addreview-star"
                      style={{ cursor: "pointer" }}
                    >
                      <path d="M12 .587l3.668 7.431 8.2 1.184-5.93 5.766 1.398 8.151L12 18.897l-7.336 3.872 1.398-8.151-5.93-5.766 8.2-1.184z" />
                    </svg>
                  ))}
                </div>
              </div>

              <div className="addreview-form-group">
                <label htmlFor="comment">Bình luận:</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Viết bình luận tại đây..."
                  className="addreview-textarea"
                ></textarea>
              </div>

              {error && <p style={{ color: "red" }}>{error}</p>}

              <div className="addreview-buttons">
                <button
                  type="submit"
                  disabled={loading}
                  className="addreview-submit-button"
                >
                  {loading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="addreview-close-button"
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ReviewForm;
