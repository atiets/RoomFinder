import React, { useEffect, useState } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { editReview } from "../../../../redux/postAPI";
import "./EditReviewForm.css";

const EditReviewForm = ({ 
  review, 
  onClose, 
  onSuccess, 
  accessToken 
}) => {
  // FIX: Di chuyển tất cả hooks lên đầu - TRƯỚC mọi early returns
  
  // Rating states - với default values an toàn
  const [quality, setQuality] = useState(0);
  const [location, setLocation] = useState(0);
  const [price, setPrice] = useState(0);
  const [service, setService] = useState(0);
  const [security, setSecurity] = useState(0);
  
  // Comment states - với default values an toàn
  const [bestPart, setBestPart] = useState("");
  const [worstPart, setWorstPart] = useState("");
  const [advice, setAdvice] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  
  // Review checks states - với default values an toàn
  const [isInfoComplete, setIsInfoComplete] = useState(false);
  const [isImageAccurate, setIsImageAccurate] = useState(false);
  const [isHostResponsive, setIsHostResponsive] = useState(false);
  const [isIntroduce, setIsIntroduce] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Categories matching create form - EXACT SAME
  const categories = [
    "🏠 Chất lượng phòng",
    " 📍 Vị trí & Khu vực xung quanh",
    "💰 Giá cả so với chất lượng",
    "👥 Chủ nhà & Dịch vụ",
    "🔒 An ninh khu vực",
  ];
  
  // FIX: Khởi tạo rating state với defensive programming
  const [rating, setRating] = useState(() => {
    return categories.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {});
  });
  
  const [hoveredRating, setHoveredRating] = useState({});

  // FIX: Load existing data với null checks - HOOKS PHẢI Ở ĐẦU
  useEffect(() => {
    if (!review) return;

    try {
      // Load ratings với null checks
      const reviewRating = review.rating || {};
      setQuality(reviewRating.quality || 0);
      setLocation(reviewRating.location || 0);
      setPrice(reviewRating.price || 0);
      setService(reviewRating.service || 0);
      setSecurity(reviewRating.security || 0);
      
      // Update rating object với null checks
      setRating({
        "🏠 Chất lượng phòng": reviewRating.quality || 0,
        " 📍 Vị trí & Khu vực xung quanh": reviewRating.location || 0,
        "💰 Giá cả so với chất lượng": reviewRating.price || 0,
        "👥 Chủ nhà & Dịch vụ": reviewRating.service || 0,
        "🔒 An ninh khu vực": reviewRating.security || 0,
      });
      
      // Load comments với null checks
      const reviewComments = review.comments || {};
      setBestPart(reviewComments.best_part || "");
      setWorstPart(reviewComments.worst_part || "");
      setAdvice(reviewComments.advice || "");
      setAdditionalComment(reviewComments.additional_comment || "");
      
      // Load review checks với null checks
      const reviewChecks = review.review_checks || {};
      setIsInfoComplete(reviewChecks.is_info_complete || false);
      setIsImageAccurate(reviewChecks.is_image_accurate || false);
      setIsHostResponsive(reviewChecks.is_host_responsive || false);
      setIsIntroduce(reviewChecks.is_introduce || false);
    } catch (error) {
      console.error("Error loading review data:", error);
      // Set default values if there's an error
      setQuality(0);
      setLocation(0);
      setPrice(0);
      setService(0);
      setSecurity(0);
    }
  }, [review]);

  // Auto-resize textarea
  useEffect(() => {
    const textareas = document.querySelectorAll(".editreview-comment-input");
    
    const adjustHeight = (textarea) => {
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    textareas.forEach((textarea) => {
      const handleInput = () => adjustHeight(textarea);
      if (textarea) {
        textarea.addEventListener("input", handleInput);
        adjustHeight(textarea);
      }
    });

    // Cleanup
    return () => {
      textareas.forEach((textarea) => {
        if (textarea) {
          textarea.removeEventListener("input", () => adjustHeight(textarea));
        }
      });
    };
  }, []);

  // FIX: Early return SAU khi đã gọi tất cả hooks
  if (!review) {
    return (
      <div className="editreview-overlay">
        <div className="editreview-form-container">
          <div style={{ padding: "20px", textAlign: "center" }}>
            <p>Không tìm thấy dữ liệu đánh giá để chỉnh sửa.</p>
            <button
              type="button"
              onClick={onClose}
              className="editreview-close-button"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FIX: Safe rating change handler
  const handleRatingChange = (category, value) => {
    if (!category || typeof value !== 'number') return;

    setRating((prevRatings) => ({
      ...prevRatings,
      [category]: value,
    }));

    // Update individual rating states
    switch (category) {
      case "🏠 Chất lượng phòng":
        setQuality(value);
        break;
      case " 📍 Vị trí & Khu vực xung quanh":
        setLocation(value);
        break;
      case "💰 Giá cả so với chất lượng":
        setPrice(value);
        break;
      case "👥 Chủ nhà & Dịch vụ":
        setService(value);
        break;
      case "🔒 An ninh khu vực":
        setSecurity(value);
        break;
      default:
        break;
    }
  };

  const handleStarMouseEnter = (category, value) => {
    if (!category || typeof value !== 'number') return;
    
    setHoveredRating((prevHovered) => ({
      ...prevHovered,
      [category]: value,
    }));
  };

  const handleStarMouseLeave = (category) => {
    if (!category) return;
    
    setHoveredRating((prevHovered) => ({
      ...prevHovered,
      [category]: null,
    }));
  };

  // FIX: Safe calculate average rating
  const calculateAverageRating = () => {
    try {
      const ratings = [quality, location, price, service, security];
      const validRatings = ratings.filter(value => 
        typeof value === 'number' && value > 0 && value <= 5
      );

      if (validRatings.length === 0) {
        return 0;
      }

      const totalRating = validRatings.reduce((sum, value) => sum + value, 0);
      const avgRating = totalRating / validRatings.length;

      return Number(avgRating.toFixed(1));
    } catch (error) {
      console.error("Error calculating average rating:", error);
      return 0;
    }
  };

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

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "#4CAF50";
    if (rating >= 3.5) return "#FF9800";
    if (rating >= 2.5) return "#FFC107";
    if (rating >= 1.5) return "#FF5722";
    return "#9E9E9E";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if ([quality, location, price, service, security].some(rating => 
      typeof rating !== 'number' || rating <= 0 || rating > 5
    )) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu đánh giá",
        text: "Vui lòng chọn đầy đủ 5 tiêu chí đánh giá.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const reviewData = {
        rating: { 
          quality: Number(quality), 
          location: Number(location), 
          price: Number(price), 
          service: Number(service), 
          security: Number(security) 
        },
        comments: {
          best_part: bestPart?.trim() || "",
          worst_part: worstPart?.trim() || "",
          advice: advice?.trim() || "",
          additional_comment: additionalComment?.trim() || "",
        },
        review_checks: {
          is_info_complete: Boolean(isInfoComplete),
          is_image_accurate: Boolean(isImageAccurate),
          is_host_responsive: Boolean(isHostResponsive),
          is_introduce: Boolean(isIntroduce),
        },
      };

      await editReview(review._id, reviewData, accessToken);
      
      toast.success("Cập nhật đánh giá thành công! Cảm ơn bạn.", {
        position: "top-right",
        autoClose: 2000,
      });

      if (typeof onSuccess === 'function') {
        onSuccess();
      }
      
      if (typeof onClose === 'function') {
        onClose();
      }
      
    } catch (err) {
      console.error("Edit review error:", err);
      const errorMessage = err.response?.data?.message || "Không thể cập nhật đánh giá.";
      setError(errorMessage);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const averageRating = calculateAverageRating();

  return (
    <div className="editreview-overlay">
      <div className="editreview-form-container">
        <button
          className="editreview-close-top"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ❌
        </button>
        
        <h3>Chỉnh sửa Đánh Giá</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="editreview-form-group">
            <label>Đánh giá:</label>
            <div className="editreview-criteria-group">
              {categories.map((category) => (
                <div key={category} className="editreview-criteria">
                  <label>{category}:</label>
                  <div className="editreview-stars">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <svg
                        key={value}
                        onClick={() => handleRatingChange(category, value)}
                        onMouseEnter={() => handleStarMouseEnter(category, value)}
                        onMouseLeave={() => handleStarMouseLeave(category)}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={
                          value <= (hoveredRating[category] || rating[category] || 0)
                            ? "#FFD700"
                            : "#E4E5E9"
                        }
                        width="32px"
                        height="32px"
                        className="editreview-star"
                        style={{ cursor: "pointer" }}
                      >
                        <path d="M12 .587l3.668 7.431 8.2 1.184-5.93 5.766 1.398 8.151L12 18.897l-7.336 3.872 1.398-8.151-5.93-5.766 8.2-1.184z" />
                      </svg>
                    ))}
                  </div>
                  <div className="editreview-rating-text">
                    {getRatingText(hoveredRating[category] || rating[category] || 0)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="editreview-average">
              <div className="editreview-average-text">
                <p>Đánh giá trung bình: </p>
                <span style={{ 
                  color: getRatingColor(averageRating),
                  marginLeft: '8px',
                  fontWeight: 'bold'
                }}>
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <div className="editreview-average-stars">
                {Array.from({ length: 5 }, (_, index) => {
                  const starPercentage =
                    index < Math.floor(averageRating)
                      ? 100
                      : index < averageRating
                        ? (averageRating % 1) * 100
                        : 0;

                  return (
                    <div className="editreview-star-wrapper" key={index}>
                      <div
                        className="editreview-star-lit"
                        style={{ width: `${starPercentage}%` }}
                      >
                        <svg
                          viewBox="0 0 15 15"
                          className="editreview-star-icon editreview-star-filled"
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
                        className="editreview-star-icon editreview-star-hollow"
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
          
          <div className="editreview-comment">
            <div className="editreview-comment-question">
              <div className="editreview-comment-group">
                <div className="editreview-comment-label" style={{ fontWeight: "normal" }}>
                  Bạn thích điều gì nhất về phòng trọ này?
                </div>
                <textarea
                  className="editreview-comment-input"
                  rows="1"
                  placeholder="để lại đánh giá..."
                  value={bestPart}
                  onChange={(e) => setBestPart(e.target.value || "")}
                />
              </div>
              
              <div className="editreview-comment-group">
                <div className="editreview-comment-label" style={{ fontWeight: "normal" }}>
                  Có điều gì bạn không hài lòng không?
                </div>
                <textarea
                  className="editreview-comment-input"
                  rows="1"
                  placeholder="để lại đánh giá..."
                  value={worstPart}
                  onChange={(e) => setWorstPart(e.target.value || "")}
                />
              </div>
              
              <div className="editreview-comment-group">
                <div className="editreview-comment-label" style={{ fontWeight: "normal" }}>
                  Bạn có lời khuyên nào cho người thuê sau?
                </div>
                <textarea
                  className="editreview-comment-input"
                  rows="1"
                  placeholder="để lại đánh giá..."
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value || "")}
                />
              </div>
            </div>
            
            <div className="editreview-comment-share">
              <div className="editreview-comment-group">
                <div style={{ position: "relative" }}>
                  <textarea
                    className="editreview-comment-input"
                    rows="3"
                    placeholder="Hãy chia sẻ thêm ý kiến của bạn với những khách thuê nhà khác nhé."
                    value={additionalComment}
                    onChange={(e) => setAdditionalComment(e.target.value || "")}
                    style={{
                      minHeight: "100px",
                      color: "rgba(0, 0, 0, 0.87)",
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="editreview-comment-checkbox">
              <hr className="divider" />
              <div className="checkbox-group">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(isInfoComplete)}
                      onChange={(e) => setIsInfoComplete(e.target.checked)}
                      sx={{
                        color: "#f44336",
                        "&.Mui-checked": {
                          color: "#f44336",
                        },
                      }}
                    />
                  }
                  label={
                    <p style={{ fontSize: "0.87rem", textAlign: "left", margin: 0 }}>
                      Bài đăng có đầy đủ thông tin không?
                    </p>
                  }
                  sx={{ ml: 0 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(isImageAccurate)}
                      onChange={(e) => setIsImageAccurate(e.target.checked)}
                      sx={{
                        color: "#f44336",
                        "&.Mui-checked": {
                          color: "#f44336",
                        },
                      }}
                    />
                  }
                  label={
                    <p style={{ fontSize: "0.87rem", textAlign: "left", margin: 0 }}>
                      Hình ảnh có đúng thực tế không?
                    </p>
                  }
                  sx={{ ml: 0 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(isHostResponsive)}
                      onChange={(e) => setIsHostResponsive(e.target.checked)}
                      sx={{
                        color: "#f44336",
                        "&.Mui-checked": {
                          color: "#f44336",
                        },
                      }}
                    />
                  }
                  label={
                    <p style={{ fontSize: "0.87rem", textAlign: "left", margin: 0 }}>
                      Chủ phòng có phản hồi nhanh chóng không?
                    </p>
                  }
                  sx={{ ml: 0 }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ color: "red", margin: "10px 0", padding: "10px", backgroundColor: "#ffebee", borderRadius: "4px" }}>
              {error}
            </div>
          )}

          <div style={{ textAlign: "left", marginTop: "30px", marginLeft: "30px" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(isIntroduce)}
                  onChange={(e) => setIsIntroduce(e.target.checked)}
                  sx={{
                    color: "#f44336",
                    "&.Mui-checked": {
                      color: "#f44336",
                    },
                  }}
                />
              }
              label="Có giới thiệu phòng này cho người khác không?"
              sx={{ ml: 0 }}
            />
          </div>
          
          <div className="editreview-buttons">
            <button
              type="submit"
              disabled={loading}
              className="editreview-submit-button"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật đánh giá"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="editreview-close-button"
            >
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReviewForm;