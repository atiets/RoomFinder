import { Typography, Checkbox, FormControlLabel } from "@mui/material";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { createReview } from "../../../../redux/postAPI";
import "./ReviewForm.css";

const ReviewForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postId, setPostId] = useState(id);
  const [quality, setQuality] = useState(0);
  const [location, setLocation] = useState(0);
  const [price, setPrice] = useState(0);
  const [service, setService] = useState(0);
  const [security, setSecurity] = useState(0);
  const [bestPart, setBestPart] = useState("");
  const [worstPart, setWorstPart] = useState("");
  const [advice, setAdvice] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const [isInfoComplete, setIsInfoComplete] = useState(false);
  const [isImageAccurate, setIsImageAccurate] = useState(false);
  const [isHostResponsive, setIsHostResponsive] = useState(false);
  const [isIntroduce, setIsIntroduce] = useState(false);
  const categories = [
    "🏠 Chất lượng phòng",
    " 📍 Vị trí & Khu vực xung quanh",
    "💰 Giá cả so với chất lượng",
    "👥 Chủ nhà & Dịch vụ",
    "🔒 An ninh khu vực",
  ];
  const [rating, setRating] = useState(
    categories.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {})
  );
  const [hoveredRating, setHoveredRating] = useState({});
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]); // Lưu danh sách ảnh/video đã chọn

  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const user_id = currentUser?._id;
  const MAX_IMAGES = 5;
  const MAX_VIDEO = 1;
  const imageCount = mediaFiles.filter((m) =>
    m.type.startsWith("image")
  ).length;
  const videoCount = mediaFiles.filter((m) =>
    m.type.startsWith("video")
  ).length;

  useEffect(() => {
    const textareas = document.querySelectorAll(".addreview-comment-input");

    textareas.forEach((textarea) => {
      const adjustHeight = () => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      };

      textarea.addEventListener("input", adjustHeight);

      adjustHeight();

      return () => {
        textarea.removeEventListener("input", adjustHeight);
      };
    });
  }, []);


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      quality === 0 ||
      location === 0 ||
      price === 0 ||
      service === 0 ||
      security === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu đánh giá",
        text: "Vui lòng chọn đầy đủ 5 tiêu chí đánh giá (chất lượng, vị trí, giá cả, phục vụ, an ninh).",
        confirmButtonText: "OK",
      });
      return;
    }
  
    const averageRating = calculateAverageRating();
  
    const reviewData = {
      rating: {
        quality: quality,
        location: location,
        price: price,
        service: service,
        security: security,
        averageRating: averageRating
      },
      comments: {
        best_part: bestPart || "",
        worst_part: worstPart || "",
        advice: advice || "",
        additional_comment: additionalComment || ""
      },
      review_checks: {
        is_info_complete: isInfoComplete,
        is_image_accurate: isImageAccurate,
        is_host_responsive: isHostResponsive,
        is_introduce: isIntroduce
      },
      media: {
        images: media?.images || [], 
        video: media?.video || "" 
      }
    };    
  
    // // Ảnh và video (media)
    // if (media?.images?.length > 0) {
    //   media.images.forEach((image) => {
    //     formData.append("media", image); // Nếu là File
    //   });
    // }
  
    // if (media?.video) {
    //   formData.append("media", media.video); // Nếu là File
    // }
  
    try {
      setLoading(true);
  
      // Gửi dữ liệu tới API
      await createReview(postId, reviewData, token);
  
      toast.success("Đánh giá thành công! Cảm ơn bạn.", {
        position: "top-right",
        autoClose: 2000, 
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClose: () => {
          window.location.reload();
        },
      });
  
      // Reset form
      setRating({
        quality: 0,
        location: 0,
        price: 0,
        service: 0,
        security: 0,
      });
      setComment({
        best_part: "",
        worst_part: "",
        advice: "",
        additional_comment: "",
      });
      setIsInfoComplete(false);
      setIsImageAccurate(false);
      setIsHostResponsive(false);
      setIsIntroduce(false);
      setMedia(null);
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể gửi đánh giá.");
      toast.error("Đánh giá thất bại. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };  

  // const handleStarClick = (index) => {
  //   setRating(index + 1);
  // };

  const handleRatingChange = (category, value) => {
    setRating((prevRatings) => ({
      ...prevRatings,
      [category]: value,
    }));
  
    if (category === "🏠 Chất lượng phòng") {
      setQuality(value);
    } else if (category === " 📍 Vị trí & Khu vực xung quanh") {
      setLocation(value);
    } else if (category === "💰 Giá cả so với chất lượng") {
      setPrice(value);
    } else if (category === "👥 Chủ nhà & Dịch vụ") {
      setService(value);
    } else if (category === "🔒 An ninh khu vực") {
      setSecurity(value);
    }
  };  

  const handleStarMouseEnter = (category, value) => {
    setHoveredRating((prevHovered) => ({
      ...prevHovered,
      [category]: value,
    }));
  };

  const handleStarMouseLeave = (category) => {
    setHoveredRating((prevHovered) => ({
      ...prevHovered,
      [category]: null,
    }));
  };

  const calculateAverageRating = () => {
    // Lọc các tiêu chí đã được đánh giá (không phải 0)
    const ratedCategories = Object.entries(rating).filter(
      ([categories, value]) => value > 0
    );

    // Nếu không có tiêu chí nào được đánh giá, trả về 0
    if (ratedCategories.length === 0) {
      return 0;
    }

    const totalRating = ratedCategories.reduce(
      (sum, [_, value]) => sum + value,
      0
    );
    const totalCount = ratedCategories.length;

    return (totalRating / totalCount).toFixed(1);
  };

  const getRatingText = (ratingValue) => {
    switch (ratingValue) {
      case 5:
        return "Tuyệt vời";
      case 4:
        return "Hài lòng";
      case 3:
        return "Bình thường";
      case 2:
        return "Không hài lòng";
      case 1:
        return "Tệ";
      default:
        return "";
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    let newMedia = [...mediaFiles];

    files.forEach((file) => {
      if (
        file.type.startsWith("image") &&
        newMedia.filter((m) => m.type.startsWith("image")).length < MAX_IMAGES
      ) {
        newMedia.push(file);
      } else if (
        file.type.startsWith("video") &&
        newMedia.filter((m) => m.type.startsWith("video")).length < MAX_VIDEO
      ) {
        newMedia.push(file);
      }
    });

    setMediaFiles(newMedia);
  };

  const handleRemove = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
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

  const averageRating = calculateAverageRating();

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
          <button
    className="addreview-close-top"
    onClick={() => setShowForm(false)}
    aria-label="Close"
  >
    ❌
  </button>
            <h3>Thêm Đánh Giá</h3>
            <form onSubmit={handleSubmit}>
              <div className="addreview-form-group">
                <label>Đánh giá:</label>
                <div className="addreview-criteria-group">
                  {[
                    "🏠 Chất lượng phòng",
                    " 📍 Vị trí & Khu vực xung quanh",
                    "💰 Giá cả so với chất lượng",
                    "👥 Chủ nhà & Dịch vụ",
                    "🔒 An ninh khu vực",
                  ].map((category) => (
                    <div key={category} className="addreview-criteria">
                      <label>{category}:</label>
                      <div className="addreview-stars">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <svg
                            key={value}
                            onClick={() => handleRatingChange(category, value)}
                            onMouseEnter={() =>
                              handleStarMouseEnter(category, value)
                            }
                            onMouseLeave={() => handleStarMouseLeave(category)}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={
                              value <=
                              (hoveredRating[category] || rating[category])
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
                        {getRatingText(
                          hoveredRating[category] || rating[category]
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="addreview-average">
                  <div className="addreview-average-text">
                    <p>Đánh giá trung bình: {Number(averageRating).toFixed(1)}</p>
                  </div>
                  <div className="addreview-average-stars">
                    {Array.from({ length: 5 }, (_, index) => {
                      const starPercentage =
                        index < Math.floor(averageRating)
                          ? 100
                          : index < averageRating
                            ? (averageRating % 1) * 100
                            : 0;

                      return (
                        <div className="addreview-star-wrapper" key={index}>
                          {/* Phần sao được tô màu */}
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
                              ></polygon>
                            </svg>
                          </div>
                          {/* Phần sao rỗng */}
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
                            ></polygon>
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
                    <div
                      className="addreview-comment-label"
                      style={{ fontWeight: "normal" }}
                    >
                      Bạn thích điều gì nhất về phòng trọ này?
                    </div>
                    <textarea
                      className="addreview-comment-input"
                      rows="1"
                      placeholder="để lại đánh giá..."
                      onChange={(e) => setBestPart(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="addreview-comment-group">
                    <div
                      className="addreview-comment-label"
                      style={{ fontWeight: "normal" }}
                    >
                      Có điều gì bạn không hài lòng không?
                    </div>
                    <textarea
                      className="addreview-comment-input"
                      rows="1"
                      placeholder="để lại đánh giá..."
                      onChange={(e) => setWorstPart(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="addreview-comment-group">
                    <div
                      className="addreview-comment-label"
                      style={{ fontWeight: "normal" }}
                    >
                      Bạn có lời khuyên nào cho người thuê sau?
                    </div>
                    <textarea
                      className="addreview-comment-input"
                      rows="1"
                      placeholder="để lại đánh giá..."
                      onChange={(e) => setAdvice(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="addreview-comment-share">
                  <div className="addreview-comment-group">
                    <div style={{ position: "relative" }}>
                      <textarea
                        className="addreview-comment-input"
                        rows="3"
                        placeholder="Hãy chia sẻ thêm ý kiến của bạn với những khách thuê nhà khác nhé."
                        onChange={(e) => setAdditionalComment(e.target.value)}
                        style={{
                          minHeight: "100px",
                          color: "rgba(0, 0, 0, 0.87)",
                        }}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="addreview-comment-checkbox">
                  <div className="addreview-comment-checkbox">
                    <hr className="divider" />
                    <div className="checkbox-group">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isInfoComplete}
                            onChange={() => setIsInfoComplete(!isInfoComplete)}
                            sx={{
                              color: "#f44336",
                              "&.Mui-checked": {
                                color: "#f44336",
                              },
                            }}
                          />
                        }
                        label={
                          <p style={{ fontSize: "0.87rem", textAlign: "left" }}>
                            Bài đăng có đầy đủ thông tin không?
                          </p>
                        }
                        sx={{ ml: 0 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isImageAccurate}
                            onChange={() => setIsImageAccurate(!isImageAccurate)}
                            sx={{
                              color: "#f44336",
                              "&.Mui-checked": {
                                color: "#f44336",
                              },
                            }}
                          />
                        }
                        label={
                          <p style={{ fontSize: "0.87rem", textAlign: "left" }}>
                            Hình ảnh có đúng thực tế không?
                          </p>
                        }
                        sx={{ ml: 0 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isHostResponsive}
                            onChange={() => setIsHostResponsive(!isHostResponsive)}
                            sx={{
                              color: "#f44336",
                              "&.Mui-checked": {
                                color: "#f44336",
                              },
                            }}
                          />
                        }
                        label={
                          <p style={{ fontSize: "0.87rem", textAlign: "left" }}>
                            Chủ phòng có phản hồi nhanh chóng không?
                          </p>
                        }
                        sx={{ ml: 0 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="media-preview-container">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="media-preview">
                    {file.type.startsWith("image") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="media-preview-image"
                      />
                    ) : (
                      <video controls className="preview-video">
  <source src={URL.createObjectURL(file)} type={file.type} />
  Trình duyệt không hỗ trợ video.
</video>
                    )}
                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(index)}
                    >
                      ❌
                    </button>
                  </div>
                ))}

                {/* Nút tải lên ảnh */}
                {imageCount < MAX_IMAGES && (
                  <label className="upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      multiple
                    />
                    📷 <br /> {MAX_IMAGES - imageCount}/{MAX_IMAGES}
                  </label>
                )}

                {/* Nút tải lên video */}
                {videoCount < MAX_VIDEO && (
                  <label className="upload-box">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                    />
                    🎥 <br /> {MAX_VIDEO - videoCount}/{MAX_VIDEO}
                  </label>
                )}
              </div>

              {error && <p style={{ color: "red" }}>{error}</p>}

              <div style={{ textAlign: "left", marginTop: "30px" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isIntroduce}
                      onChange={() => setIsIntroduce(!isIntroduce)}
                      sx={{
                        color: "#f44336",
                        "&.Mui-checked": {
                          color: "#f44336",
                        },
                      }}
                    />
                  }
                  label="Có giới thiệu phòng này cho người khác không?"
                  sx={{ ml: 0 }} // Loại bỏ margin-left mặc định
                />
              </div>
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
