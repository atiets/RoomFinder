import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import React from "react";
import "./RoomPostManage.css";

const RoomPostManage = ({
  post,
  onTitleClick,
  onApprove,
  onReject,
  onHide,
  onVisible,
}) => {
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    
    if (price >= 1_000_000_000) {
      return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
    }
    if (price >= 1_000_000) {
      return `${(price / 1_000_000).toFixed(1)} triệu`;
    }
    return `${Math.floor(price / 1000)}k`;
  };

  const isVip = post.isVip === true;

  // const formatPriceToText = (price) => {
  //   if (typeof price !== "number" || isNaN(price)) {
  //     return "Giá không hợp lệ";
  //   }

  //   if (price >= 1_000_000_000) {
  //     const billions = Math.floor(price / 1_000_000_000);
  //     return `${billions} Tỷ VNĐ`;
  //   }

  //   if (price >= 1_000_000) {
  //     const millions = Math.floor(price / 1_000_000);
  //     const rest = Math.floor((price % 1_000_000) / 1_000);
  //     return rest > 0
  //       ? `${millions} triệu ${rest} nghìn VND`
  //       : `${millions} triệu VND`;
  //   }

  //   return `${price.toLocaleString()} VND`;
  // };

  return (
    <Card className={`admin-post-card ${isVip ? 'admin-vip-post' : 'admin-normal-post'}`}>
      {/* ⭐ Enhanced VIP Badge */}
      {isVip && (
        <div className="admin-vip-badge-container">
          <Chip 
            icon={<StarIcon />}
            label="VIP" 
            size="small"
            className="admin-vip-chip-enhanced"
          />
          <div className="admin-vip-glow"></div>
        </div>
      )}

      <Box className="admin-post-layout">
        {/* ⭐ Image Section với VIP indicator */}
        <Box className="admin-post-image-section">
          {post.images && post.images[0] && (
            <CardMedia
              component="img"
              image={post.images[0]}
              alt="Hình ảnh bất động sản"
              className="admin-post-image"
            />
          )}
          
          {/* ⭐ VIP overlay trên image */}
          {isVip && (
            <div className="admin-vip-overlay">
              <VerifiedIcon className="admin-vip-overlay-icon" />
            </div>
          )}
          
          {/* ⭐ Price Tag */}
          <div className={`admin-price-tag ${isVip ? 'admin-vip-price' : 'admin-normal-price'}`}>
            {formatPrice(post.price || post.rentalPrice)} VNĐ
          </div>
        </Box>

        {/* ⭐ Content Section */}
        <CardContent className="admin-post-content">
          <Box className="admin-post-info">
            {/* ⭐ Title với VIP prefix */}
            <Typography
              className={`admin-post-title ${isVip ? 'admin-vip-title' : 'admin-normal-title'}`}
              onClick={() => onTitleClick(post.id)}
            >
              {isVip && <StarIcon className="admin-title-vip-icon" />}
              {post.title}
            </Typography>
            
            {/* ⭐ Location */}
            <Typography variant="body2" className="admin-post-location">
              📍 {post.address?.district}, {post.address?.province}
            </Typography>

            {/* ⭐ Meta Info với VIP status */}
            <Box className="admin-post-meta">
              <span className="admin-area-info">
                📐 {post.area}m²
              </span>
              
              {/* ⭐ VIP Status Badge */}
              {isVip && (
                <span className="admin-vip-status-badge">
                  <TrendingUpIcon className="admin-vip-status-icon" />
                  VIP
                </span>
              )}
              
              <span className={`admin-status-chip ${post.status}`}>
                {post.status === 'pending' && '⏳ Chờ duyệt'}
                {post.status === 'approved' && '✅ Đã duyệt'}
                {post.status === 'rejected' && '❌ Từ chối'}
                {post.status === 'update' && '🔄 Chỉnh sửa'}
              </span>

              <span className={`admin-visibility-chip ${post.visibility}`}>
                {post.visibility === 'visible' && '👁️ Hiển thị'}
                {post.visibility === 'hidden' && '🙈 Ẩn'}
              </span>
            </Box>

            {/* ⭐ Contact Info */}
            <Box className="admin-contact-info">
              <span className="admin-contact-item">
                👤 {post.contactInfo?.username}
              </span>
              <span className="admin-contact-item">
                📞 {post.contactInfo?.phoneNumber}
              </span>
              {/* ⭐ Views count */}
              {post.views > 0 && (
                <span className="admin-contact-item admin-views-info">
                  👁️ {post.views} lượt xem
                </span>
              )}
            </Box>
          </Box>

          {/* ⭐ Action Buttons */}
          <Box className="admin-action-buttons">
            {post.status === "pending" && (
              <>
                <Button
                  className={`admin-btn-approve ${isVip ? 'admin-btn-vip' : ''}`}
                  onClick={() => onApprove(post.id)}
                  size="small"
                >
                  ✅ Duyệt {isVip && 'VIP'}
                </Button>
                <Button
                  className="admin-btn-reject"
                  onClick={() => onReject(post.id)}
                  size="small"
                >
                  ❌ Từ chối
                </Button>
              </>
            )}

            {post.status === "approved" && post.visibility === "visible" && (
              <Button
                className="admin-btn-hide"
                onClick={() => onHide(post.id)}
                size="small"
              >
                🙈 Ẩn bài đăng {isVip && 'VIP'}
              </Button>
            )}

            {post.status === "approved" && post.visibility === "hidden" && (
              <Button
                className="admin-btn-show"
                onClick={() => onVisible(post.id)}
                size="small"
              >
                👁️ Hiện bài đăng {isVip && 'VIP'}
              </Button>
            )}

            {post.status === "update" && (
              <>
                <Button
                  className={`admin-btn-approve ${isVip ? 'admin-btn-vip' : ''}`}
                  onClick={() => onApprove(post.id)}
                  size="small"
                >
                  ✅ Duyệt chỉnh sửa {isVip && 'VIP'}
                </Button>
                <Button
                  className="admin-btn-reject"
                  onClick={() => onReject(post.id)}
                  size="small"
                >
                  ❌ Từ chối chỉnh sửa
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default RoomPostManage;