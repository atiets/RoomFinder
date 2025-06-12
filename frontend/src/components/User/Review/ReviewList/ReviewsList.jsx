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
import "../ReviewForm/ReviewForm.css";

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
  service: "👥 Chủ nhà & Dịch vụ",
  security: "🔒 An ninh khu vực",
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
  const [editRating, setEditRating] = useState({
    quality: 0,
    location: 0,
    price: 0,
    service: 0,
    security: 0
  });
  const [editComments, setEditComments] = useState({
    best_part: "",
    worst_part: "",
    advice: "",
    additional_comment: ""
  });
  const [editReviewChecks, setEditReviewChecks] = useState({
    is_info_complete: false,
    is_image_accurate: false,
    is_host_responsive: false
  });
  const [editHoveredRating, setEditHoveredRating] = useState({});
  
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const id = currentUser?._id;
  const accessToken = currentUser?.accessToken;
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingsBreakdown, setRatingsBreakdown] = useState({});
  const [selectedRating, setSelectedRating] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Thêm vào đầu component ReviewsList - thay thế các state phức tạp
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Function đơn giản để xem ảnh
  const openImageViewer = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageViewerOpen(true);
  };

  // FIX: Tính đánh giá trung bình đúng
  const calculateAverageRating = (ratings) => {
    if (!ratings || typeof ratings !== 'object') return 0;

    const validRatings = Object.values(ratings).filter(value => 
      typeof value === 'number' && value > 0
    );
    
    if (validRatings.length === 0) return 0;

    const totalRating = validRatings.reduce((sum, value) => sum + value, 0);
    const averageRating = totalRating / validRatings.length;

    return Number(averageRating.toFixed(1));
  };

  // Thêm function để tính đánh giá trung bình cho form edit
  const calculateEditAverageRating = () => {
    const validRatings = Object.values(editRating).filter(value => 
      typeof value === 'number' && value > 0
    );
    
    if (validRatings.length === 0) return "0.0";
    
    const totalRating = validRatings.reduce((sum, value) => sum + value, 0);
    const averageRating = totalRating / validRatings.length;
    
    return averageRating.toFixed(1);
  };

  // Thêm function để hiển thị text đánh giá
  const getRatingText = (ratingValue) => {
    switch (ratingValue) {
      case 5: return "Tuyệt vời";
      case 4: return "Hài lòng";
      case 3: return "Bình thường";
      case 2: return "Không hài lòng";
      case 1: return "Tệ";
      default: return "";
    }
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

  // Thêm useEffect để auto-resize textarea trong form edit
  useEffect(() => {
    if (showForm) {
      const textareas = document.querySelectorAll(".addreview-comment-input");
      
      textareas.forEach((textarea) => {
        const adjustHeight = () => {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        };

        textarea.addEventListener("input", adjustHeight);
        adjustHeight(); // Chạy lần đầu để set height cho content có sẵn

        return () => {
          textarea.removeEventListener("input", adjustHeight);
        };
      });
    }
  }, [showForm, editComments]);

  // FIX: Tính toán overview đúng
  useEffect(() => {
    if (reviews.length > 0) {
      // Tính đánh giá trung bình cho tất cả reviews
      const allRatings = reviews.map(review => calculateAverageRating(review.rating));
      const totalRating = allRatings.reduce((sum, rating) => sum + rating, 0);
      const avgRating = totalRating / allRatings.length;
      
      setAverageRating(Number(avgRating.toFixed(1)));
      setTotalReviews(reviews.length);

      // Tạo breakdown theo rating trung bình của từng review
      const breakdown = reviews.reduce((acc, review) => {
        const reviewAvg = Math.round(calculateAverageRating(review.rating));
        acc[reviewAvg] = (acc[reviewAvg] || 0) + 1;
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

  // FIX: Filter theo đánh giá trung bình
  const filteredReviews = selectedRating
    ? reviews.filter((review) => 
        Math.round(calculateAverageRating(review.rating)) === selectedRating
      )
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

  // FIX: handleEdit với đúng cấu trúc dữ liệu
  const handleEdit = (review) => {
    setShowForm(true);
    setEditReviewId(review._id);
    setEditRating(review.rating || {
      quality: 0,
      location: 0,
      price: 0,
      service: 0,
      security: 0
    });
    setEditComments(review.comments || {
      best_part: "",
      worst_part: "",
      advice: "",
      additional_comment: ""
    });
    setEditReviewChecks(review.review_checks || {
      is_info_complete: false,
      is_image_accurate: false,
      is_host_responsive: false
    });
    setEditHoveredRating({});
  };

  const handleSubmit = async (reviewId) => {
    if (!accessToken) {
      console.error("Access token is missing or invalid");
      return;
    }

    const updatedData = { 
      rating: editRating, 
      comments: editComments,
      review_checks: editReviewChecks
    };
    
    try {
      await editReview(reviewId, updatedData, accessToken);
      dispatch(updateReview({ id: reviewId, updates: updatedData }));
      setShowForm(false);
      
      // Refresh data
      const reviewsData = await getReviewsByPostId(postId);
      dispatch(setReviews(reviewsData));
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

  // Kiểm tra quyền sở hữu review
  const isReviewOwner = (review) => {
    return currentUser && review.user_id?._id === currentUser._id;
  };

  return (
    <div className="review-wrapper">
      {/* Phần overview */}
      <div className="product-rating-overview">
        <div className="product-rating-overview__briefing">
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

        <div className="product-rating-overview__filters">
          <div
            className={`product-rating-overview__filter ${selectedRating === null ? "selected" : ""}`}
            onClick={() => setSelectedRating(null)}
          >
            Tất cả ({totalReviews.toLocaleString()})
          </div>
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className={`product-rating-overview__filter ${selectedRating === star ? "selected" : ""}`}
              onClick={() => setSelectedRating(star)}
            >
              {star} Sao ({ratingsBreakdown[star] || 0})
            </div>
          ))}
        </div>
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
              {/* Header với thông tin user và actions */}
              <div className="review-item-header">
                <div className="review-item-user-info">
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
                </div>

                {/* Buttons sửa và xóa */}
                {isReviewOwner(review) && (
                  <div className="review-item-actions">
                    <button
                      className="review-action-btn edit-btn"
                      onClick={() => handleEdit(review)}
                      title="Sửa đánh giá"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="review-action-btn delete-btn"
                      onClick={() => handleDelete(review._id)}
                      title="Xóa đánh giá"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>

              {/* Nội dung review */}
              <ReviewComments comments={review?.comments} COMMENT={COMMENT} />
              <ReviewChecks
                reviewChecks={review?.review_checks}
                REVIEW_CHECKS={REVIEW_CHECKS}
              />
              
              {/* SIMPLE: Media like Facebook comment */}
              {(review?.media?.images?.length > 0 || review?.media?.videos?.length > 0) && (
                <div className="review-media-simple">
                  {/* Hiển thị ảnh nhỏ */}
                  {review.media.images?.length > 0 && (
                    <div className="review-images-simple">
                      {review.media.images.map((image, index) => (
                        <div 
                          key={index} 
                          className="review-image-thumb"
                          onClick={() => openImageViewer(image)}
                        >
                          <img
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="review-thumb-img"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Hiển thị video nhỏ */}
                  {review.media.videos?.length > 0 && (
                    <div className="review-videos-simple">
                      {review.media.videos.map((video, index) => (
                        <div key={index} className="review-video-thumb">
                          <video
                            src={video}
                            className="review-thumb-video"
                            controls
                            preload="metadata"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Simple Image Viewer */}
          {imageViewerOpen && (
            <div className="simple-image-viewer" onClick={() => setImageViewerOpen(false)}>
              <div className="viewer-content" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="viewer-close" 
                  onClick={() => setImageViewerOpen(false)}
                >
                  ✕
                </button>
                <img src={selectedImage} alt="Review" className="viewer-image" />
              </div>
            </div>
          )}

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

      {/* Form edit với giao diện giống form create */}
      {showForm && (
        <div className="addreview-overlay">
          <div className="addreview-form-container">
            <button
              className="addreview-close-top"
              onClick={() => setShowForm(false)}
              aria-label="Close"
            >
              ❌
            </button>
            <h3>Chỉnh sửa Đánh Giá</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(editReviewId);
              }}
            >
              <div className="addreview-form-group">
                <label>Đánh giá:</label>
                <div className="addreview-criteria-group">
                  {[
                    "🏠 Chất lượng phòng",
                    " 📍 Vị trí & Khu vực xung quanh", 
                    "💰 Giá cả so với chất lượng",
                    "👥 Chủ nhà & Dịch vụ",
                    "🔒 An ninh khu vực",
                  ].map((category) => {
                    const ratingKey = category === "🏠 Chất lượng phòng" ? "quality" :
                                     category === " 📍 Vị trí & Khu vực xung quanh" ? "location" :
                                     category === "💰 Giá cả so với chất lượng" ? "price" :
                                     category === "👥 Chủ nhà & Dịch vụ" ? "service" : "security";
                    
                    return (
                      <div key={category} className="addreview-criteria">
                        <label>{category}:</label>
                        <div className="addreview-stars">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <svg
                              key={value}
                              onClick={() => setEditRating(prev => ({...prev, [ratingKey]: value}))}
                              onMouseEnter={() => setEditHoveredRating(prev => ({...prev, [ratingKey]: value}))}
                              onMouseLeave={() => setEditHoveredRating(prev => ({...prev, [ratingKey]: null}))}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill={
                                value <= (editHoveredRating[ratingKey] || editRating[ratingKey])
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
                        <div className="addreview-rating-text">
                          {getRatingText(editHoveredRating[ratingKey] || editRating[ratingKey])}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Đánh giá trung bình */}
                <div className="addreview-average">
                  <div className="addreview-average-text">
                    <p>Đánh giá trung bình: {calculateEditAverageRating()}</p>
                  </div>
                  <div className="addreview-average-stars">
                    {Array.from({ length: 5 }, (_, index) => {
                      const avgRating = parseFloat(calculateEditAverageRating());
                      const starPercentage =
                        index < Math.floor(avgRating)
                          ? 100
                          : index < avgRating
                            ? (avgRating % 1) * 100
                            : 0;

                      return (
                        <div className="addreview-star-wrapper" key={index}>
                          <div
                            className="addreview-star-lit"
                            style={{ width: `${starPercentage}%` }}
                          >
                            <svg
                              viewBox="0 0 15 15"
                              className="addreview-star-icon addreview-star-filled"
                            >
                              <polygon
                                points="7.5 .8 9.7 5.4 14.5 5.9 10.7 9.1 11.8 14.2 7.5 11.6 3.2 14.2 4.3 9.1 .5 5.9 5.3 5.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeMiterlimit="10"
                              />
                            </svg>
                          </div>
                          <svg
                            viewBox="0 0 15 15"
                            className="addreview-star-icon addreview-star-hollow"
                          >
                            <polygon
                              fill="none"
                              points="7.5 .8 9.7 5.4 14.5 5.9 10.7 9.1 11.8 14.2 7.5 11.6 3.2 14.2 4.3 9.1 .5 5.9 5.3 5.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeMiterlimit="10"
                            />
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="addreview-comment">
                <div className="addreview-comment-question">
                  <div className="addreview-comment-group">
                    <div className="addreview-comment-label">
                      Bạn thích điều gì nhất về phòng trọ này?
                    </div>
                    <textarea
                      className="addreview-comment-input"
                      rows="1"
                      placeholder="để lại đánh giá..."
                      value={editComments.best_part || ""}
                      onChange={(e) => setEditComments(prev => ({
                        ...prev,
                        best_part: e.target.value
                      }))}
                    />
                  </div>
                  <div className="addreview-comment-group">
                    <div className="addreview-comment-label">
                      Có điều gì bạn không hài lòng không?
                    </div>
                    <textarea
                      className="addreview-comment-input"
                      rows="1"
                      placeholder="để lại đánh giá..."
                      value={editComments.worst_part || ""}
                      onChange={(e) => setEditComments(prev => ({
                        ...prev,
                        worst_part: e.target.value
                      }))}
                    />
                  </div>
                  <div className="addreview-comment-group">
                    <div className="addreview-comment-label">
                      Bạn có lời khuyên nào cho người thuê sau?
                    </div>
                    <textarea
                      className="addreview-comment-input"
                      rows="1"
                      placeholder="để lại đánh giá..."
                      value={editComments.advice || ""}
                      onChange={(e) => setEditComments(prev => ({
                        ...prev,
                        advice: e.target.value
                      }))}
                    />
                  </div>
                </div>
                
                <div className="addreview-comment-share">
                  <div className="addreview-comment-group">
                    <div style={{ position: "relative" }}>
                      <textarea
                        className="addreview-comment-input"
                        rows="3"
                        placeholder="Hãy chia sẻ thêm ý kiến của bạn với những khách thuê nhà khác nhé."
                        value={editComments.additional_comment || ""}
                        onChange={(e) => setEditComments(prev => ({
                          ...prev,
                          additional_comment: e.target.value
                        }))}
                        style={{
                          minHeight: "100px",
                          color: "rgba(0, 0, 0, 0.87)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="addreview-comment-checkbox">
                  <hr className="divider" />
                  <div className="checkbox-group">
                    <div>
                      <Checkbox
                        checked={editReviewChecks.is_info_complete || false}
                        onChange={(e) => setEditReviewChecks(prev => ({
                          ...prev,
                          is_info_complete: e.target.checked
                        }))}
                        sx={{
                          color: "#f44336",
                          "&.Mui-checked": {
                            color: "#f44336",
                          },
                        }}
                      />
                      <span style={{ fontSize: "0.87rem" }}>
                        Bài đăng có đầy đủ thông tin không?
                      </span>
                    </div>
                    <div>
                      <Checkbox
                        checked={editReviewChecks.is_image_accurate || false}
                        onChange={(e) => setEditReviewChecks(prev => ({
                          ...prev,
                          is_image_accurate: e.target.checked
                        }))}
                        sx={{
                          color: "#f44336",
                          "&.Mui-checked": {
                            color: "#f44336",
                          },
                        }}
                      />
                      <span style={{ fontSize: "0.87rem" }}>
                        Hình ảnh có đúng thực tế không?
                      </span>
                    </div>
                    <div>
                      <Checkbox
                        checked={editReviewChecks.is_host_responsive || false}
                        onChange={(e) => setEditReviewChecks(prev => ({
                          ...prev,
                          is_host_responsive: e.target.checked
                        }))}
                        sx={{
                          color: "#f44336",
                          "&.Mui-checked": {
                            color: "#f44336",
                          },
                        }}
                      />
                      <span style={{ fontSize: "0.87rem" }}>
                        Chủ phòng có phản hồi nhanh chóng không?
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {error && <p style={{ color: "red" }}>{error}</p>}

              <div className="addreview-buttons">
                <button
                  type="submit"
                  disabled={loading}
                  className="addreview-submit-button"
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật đánh giá"}
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