import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VerifiedIcon from "@mui/icons-material/Verified";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
} from "@mui/material";
import "./RoomPost.css";

const RoomPost = ({ post, onTitleClick, onToggleFavorite, isFavorite }) => {
  const handleFavoriteClick = (e) => {
    console.log("onToggleFavorite in RoomPost:", onToggleFavorite);
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(post._id, !isFavorite);
    } else {
      console.error("onToggleFavorite không được cung cấp!");
    }
  };

  const formatPriceToText = (price) => {
    if (typeof price !== "number" || isNaN(price)) {
      return "Liên hệ";
    }

    if (price >= 1_000_000_000) {
      const billions = (price / 1_000_000_000).toFixed(1);
      return `${billions} tỷ`;
    }

    if (price >= 1_000_000) {
      const millions = (price / 1_000_000).toFixed(1);
      return `${millions} triệu`;
    }

    if (price >= 1_000) {
      const thousands = Math.floor(price / 1_000);
      return `${thousands}k`;
    }

    return `${price.toLocaleString()}`;
  };

  // ⭐ Check if post is VIP
  const isVip = post.isVip === true;

  // ⭐ Debug log để kiểm tra data
  console.log("Post data:", post);

  return (
    <Card className={`room-post-card ${isVip ? 'verified-post-card' : 'normal-post-card'}`}>
      <Box className="room-post-images">
        {post.images && post.images.length > 0 && (
          <CardMedia
            component="img"
            image={post.images[0]}
            alt="Room image"
            className="room-post-image"
          />
        )}
        
        {/* ⭐ Price Badge - Top Right Corner */}
        <div className={`price-badge ${isVip ? 'verified-price-badge' : 'normal-price-badge'}`}>
          {post.price !== undefined
            ? formatPriceToText(post.price)
            : "Liên hệ"}
          <span className="price-unit">VNĐ</span>
        </div>

        {/* ⭐ VIP Badge - Top Left */}
        {isVip && (
          <div className="verified-badge-container">
            <Chip 
              icon={<StarIcon />}
              label="Tin uy tín" 
              size="small"
              className="verified-chip-enhanced"
            />
          </div>
        )}

        {/* ⭐ Favorite Icon - Top right of image */}
        <Box className="favorite-icon" onClick={handleFavoriteClick}>
          {isFavorite ? (
            <FavoriteIcon color="error" className="favorite-icon-filled" />
          ) : (
            <FavoriteBorderIcon className="favorite-icon-border" />
          )}
        </Box>
      </Box>
      
      <CardContent className="room-post-content">
        {/* ⭐ Row 1: Title + Area */}
        <div className="title-area-row">
          <Typography
            variant="h6"
            className={`room-post-title ${isVip ? 'verified-title' : 'normal-title'}`}
            onClick={() => onTitleClick(post._id)}
          >
            {isVip && <VerifiedIcon className="title-verified-icon" />}
            {post.title || "Không có tiêu đề"}
          </Typography>
          
          <Typography variant="body2" className={`room-post-area ${isVip ? 'verified-area-text' : 'normal-area-text'}`}>
            {post.area 
              ? `${post.area}${post.typeArea || 'm²'}`
              : "Chưa có diện tích"
            }
          </Typography>
        </div>
        
        {/* ⭐ Row 2: Location */}
        <div className="location-row">
          <Typography variant="body2" className="room-post-location">
            {post.address?.district && post.address?.province 
              ? `${post.address.district}, ${post.address.province}`
              : "Chưa có địa chỉ"
            }
          </Typography>
        </div>
        
        {/* ⭐ Row 3: VIP Features (only if VIP) */}
        {isVip && (
          <div className="features-row">
            <Box className="verified-features-compact">
              <div className="verified-feature-item">
                <TrendingUpIcon className="verified-icon-small" />
                <Typography variant="caption" className="verified-feature-text">
                  Tin được xác thực
                </Typography>
              </div>
              <div className="verified-feature-item">
                <VerifiedIcon className="verified-icon-small" />
                <Typography variant="caption" className="verified-feature-text">
                  Độ tin cậy cao
                </Typography>
              </div>
            </Box>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomPost;