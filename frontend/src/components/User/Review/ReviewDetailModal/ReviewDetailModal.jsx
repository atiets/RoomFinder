import React from "react";
import "./ReviewDetailModal.css";

const ReviewDetailModal = ({ review, onClose }) => {
  if (!review) return null;

  const RATING = {
    quality: "🏠 Chất lượng phòng",
    location: "📍 Vị trí & Khu vực xung quanh",
    price: "💰 Giá cả so với chất lượng",
    security: "👥 Chủ nhà & Dịch vụ",
    service: "🔒 An ninh khu vực",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Chi tiết đánh giá</h3>

        {Object.entries(review?.rating || {}).map(([key, value]) =>
          value ? (
            <div key={key} className="rating-item">
              <p className="rating-label">{RATING[key]}:</p>
              <div className="star-rating">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    className={`star ${index < value ? "filled" : ""}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          ) : null
        )}

        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailModal;