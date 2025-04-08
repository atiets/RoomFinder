import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Checkbox } from "@mui/material";
import ReviewDetailModal from "../ReviewDetailModal/ReviewDetailModal";
import ReviewComments from "../ReviewComments/ReviewComments";
import ReviewChecks from "../ReviewChecks/ReviewChecks";

import {
  deleteReview as deleteReviewAPI,
  editReview,
  getReviewsByPostId,
} from "../../../../redux/postAPI";
import {
  deleteReview,
  setReviews,
  updateReview,
} from "../../../../redux/reviewSlice";
import "./ReviewsList.css";
const COMMENT = {
  best_part: "Điều thích nhất về phòng",
  worst_part: "Điều không hài lòng",
  advice: "Lời khuyên cho người thuê sau",
  additional_comment: "Ý kiến bổ sung",
};
const RATING = {
  quality: "🏠 Chất lượng phòng",
  location: " 📍 Vị trí & Khu vực xung quanh",
  price: "💰 Giá cả so với chất lượng",
  security: "👥 Chủ nhà & Dịch vụ",
  service: "🔒 An ninh khu vực",
};
const REVIEW_CHECKS = {
  is_info_complete: "Bài đăng đầy đủ thông tin không?",
  is_image_accurate: "Hình ảnh có đúng thực tế không?",
  is_host_responsive: "Chủ phòng có phản hồi nhanh không?",
};

const ReviewsList = ({ postId, userId }) => {
  const dispatch = useDispatch();
  const {
    reviews = [],
    loading,
    error,
  } = useSelector((state) => state.reviews);
  const [currentPage, setCurrentPage] = useState(0);
  const [reviewsPerPage] = useState(5);
  const [sortOrder, setSortOrder] = useState("desc");
  const [showForm, setShowForm] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [rating, setRating] = useState(0);
  const [eachAverageRating, setEachAverageRating] = useState(0);
  const [comment, setComment] = useState("");
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const id = currentUser?._id;
  const accessToken = currentUser?.accessToken;
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingsBreakdown, setRatingsBreakdown] = useState({});
  const [selectedRating, setSelectedRating] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const calculateAverageRating = (ratings) => {
    // Check if review.rating is available, if not, return 0
    // console.log("Ratings:", ratings);
    if (!ratings) return 0;

    // Calculate the total rating by summing up the individual category ratings
    const totalRating = Object.values(ratings).reduce(
      (sum, value) => sum + value,
      0
    );

    // Calculate the average rating by dividing the total by the number of categories
    const averageRating = totalRating / Object.keys(ratings).length;

    // Return the average, rounded to 1 decimal place
    return averageRating.toFixed(1);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      if (!postId) {
        console.error("postId không hợp lệ hoặc không tồn tại.");
        return;
      }

      try {
        const reviewsData = await getReviewsByPostId(postId);
        dispatch(setReviews(reviewsData));

        console.log("Đánh giá đã được tải thành công:", reviewsData);
      } catch (error) {
        console.error("Lỗi khi tải bài đánh giá:", error);
      }
    };

    fetchReviews();
  }, [dispatch, postId]);

  useEffect(() => {
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, review) => sum + review.rating, 0);
      setAverageRating((total / reviews.length).toFixed(1));
      setTotalReviews(reviews.length);

      const breakdown = reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {});
      setRatingsBreakdown(breakdown);
    } else {
      setAverageRating(0);
      setTotalReviews(0);
      setRatingsBreakdown({});
    }
  }, [reviews]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? "filled" : ""}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    setCurrentPage(0);
  };

  const filteredReviews = selectedRating
    ? reviews.filter((review) => review.rating === selectedRating)
    : reviews;

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const offset = currentPage * reviewsPerPage;
  const currentReviews = sortedReviews.slice(offset, offset + reviewsPerPage);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  if (error) return <p>Error: {error.message || "Không thể tải đánh giá."}</p>;

  const handleEdit = (review) => {
    setShowForm(true);
    setEditReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleSubmit = async (reviewId) => {
    // e.preventDefault();

    if (!accessToken) {
      console.error("Access token is missing or invalid");
      return;
    }

    const updatedData = { rating, comment };
    try {
      await editReview(reviewId, updatedData, accessToken);
      dispatch(updateReview(reviewId));
      setShowForm(false);
      window.location.reload();
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa đánh giá:", error);
    }
  };

  const handleDelete = (reviewId) => {
    Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa đánh giá này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteReviewAPI(reviewId, accessToken)
          .then(() => {
            dispatch(deleteReview(reviewId));
            Swal.fire({
              title: "Đã xóa!",
              text: "Đánh giá đã được xóa thành công.",
              icon: "success",
              confirmButtonText: "OK",
            });
          })
          .catch((error) => {
            console.error("Lỗi khi xóa đánh giá:", error);
            Swal.fire({
              title: "Lỗi",
              text: "Đã xảy ra lỗi khi xóa đánh giá. Vui lòng thử lại.",
              icon: "error",
              confirmButtonText: "OK",
            });
          });
      }
    });
  };

  return (
    <div className="review-wrapper">
      {/* Phần mới thêm vào */}
      <div className="product-rating-overview">
        {/* <h2>Đánh Giá Sản Phẩm</h2> */}
        <div className="product-rating-overview__briefing">
          {/* Điểm trung bình */}
          <div className="product-rating-overview__score-wrapper">
            <span className="product-rating-overview__rating-score">
              {averageRating}
            </span>
            <span className="product-rating-overview__rating-score-out-of">
              {" "}
              trên 5{" "}
            </span>
          </div>
          <div className="shopee-rating-stars product-rating-overview__stars">
            <div className="shopee-rating-stars__stars">
              {Array.from({ length: 5 }, (_, index) => {
                const starPercentage =
                  index < Math.floor(averageRating)
                    ? 100
                    : index < averageRating
                      ? (averageRating % 1) * 100
                      : 0;

                return (
                  <div
                    className="shopee-rating-stars__star-wrapper"
                    key={index}
                  >
                    <div
                      className="shopee-rating-stars__lit"
                      style={{ width: `${starPercentage}%` }}
                    >
                      <svg
                        enableBackground="new 0 0 15 15"
                        viewBox="0 0 15 15"
                        x="0"
                        y="0"
                        className="shopee-svg-icon shopee-rating-stars__primary-star icon-rating-solid"
                      >
                        <polygon
                          points="7.5 .8 9.7 5.4 14.5 5.9 10.7 9.1 11.8 14.2 7.5 11.6 3.2 14.2 4.3 9.1 .5 5.9 5.3 5.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeMiterlimit="10"
                        ></polygon>
                      </svg>
                    </div>
                    <svg
                      enableBackground="new 0 0 15 15"
                      viewBox="0 0 15 15"
                      x="0"
                      y="0"
                      className="shopee-svg-icon shopee-rating-stars__hollow-star icon-rating"
                    >
                      <polygon
                        fill="none"
                        points="7.5 .8 9.7 5.4 14.5 5.9 10.7 9.1 11.8 14.2 7.5 11.6 3.2 14.2 4.3 9.1 .5 5.9 5.3 5.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeMiterlimit="10"
                      ></polygon>
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bộ lọc theo sao */}
        <div className="product-rating-overview__filters">
          <div
            className={`product-rating-overview__filter ${selectedRating === null ? "selected" : ""}`}
            onClick={() => setSelectedRating(null)} // Lọc lại tất cả
          >
            Tất cả ({totalReviews.toLocaleString()})
          </div>
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className={`product-rating-overview__filter ${selectedRating === star ? "selected" : ""}`}
              onClick={() => setSelectedRating(star)} // Lọc theo sao
            >
              {star} Sao ({ratingsBreakdown[star] || 0})
            </div>
          ))}
        </div>
      </div>

      {/* Phần cũ */}
      <div className="filter-buttons">
        <button
          className={sortOrder === "desc" ? "active" : ""}
          onClick={() => handleSortOrderChange("desc")}
        >
          Mới tới cũ
        </button>
        <button
          className={sortOrder === "asc" ? "active" : ""}
          onClick={() => handleSortOrderChange("asc")}
        >
          Cũ tới mới
        </button>
      </div>

      {reviews.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            border: "1px dashed #ccc",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
          }}
        >
          <img
            src="https://i.pinimg.com/originals/b0/7c/0f/b07c0fc116d1868db07a8bbc2d79aab9.gif"
            alt="No reviews"
            style={{ marginBottom: "10px", width: "300px", opacity: 0.7 }}
          />
          <p
            style={{
              color: "#555",
              fontSize: "16px",
              fontWeight: "500",
              marginBottom: "8px",
            }}
          >
            Chưa có đánh giá
          </p>
          <p style={{ color: "#777", fontSize: "14px" }}>
            Hãy là người đầu tiên để lại đánh giá và chia sẻ suy nghĩ của bạn!
          </p>
        </div>
      ) : (
        <>
          {currentReviews.map((review) => (
            <div key={review._id} className="review-item">
              <p>
                <span className="review-item_name">
                  {review.user_id?.username}
                </span>
                <br />
                <span className="stars">
                  {renderStars(calculateAverageRating(review.rating))}{" "}
                  <span
                    className="rating_detail"
                    onClick={() => {
                      setSelectedReview(review);
                      setOpenModal(true);
                    }}
                    style={{ cursor: "pointer", color: "red" }}
                  >
                    Chi tiết
                  </span>
                </span>

                <span className="review-item_time">
                  {new Date(review.createdAt).toLocaleString()}
                </span>
              </p>

              <ReviewComments comments={review?.comments} COMMENT={COMMENT} />
              <ReviewChecks
                reviewChecks={review?.review_checks}
                REVIEW_CHECKS={REVIEW_CHECKS}
              />
            </div>
          ))}

          {/* Pagination */}
          <ReactPaginate
            previousLabel={"Trước"}
            nextLabel={"Tiếp theo"}
            breakLabel={"..."}
            pageCount={Math.ceil(filteredReviews.length / reviewsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
          />
        </>
      )}

      {openModal && selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setOpenModal(false)}
        />
      )}

      {showForm && (
        <div className="addreview-overlay">
          <div className="addreview-form-container">
            <h3>Chỉnh sửa Đánh Giá</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(editReviewId);
              }}
            >
              <div className="addreview-form-group">
                <label>Đánh giá:</label>
                <div className="addreview-stars">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      onClick={() => setRating(index + 1)}
                      onMouseEnter={() => setRating(index + 1)}
                      onMouseLeave={() => setRating(rating)}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={index < rating ? "#FFD700" : "#E4E5E9"}
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
                  {loading ? "Đang gửi..." : "Cập nhật đánh giá"}
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
    </div>
  );
};

export default ReviewsList;
