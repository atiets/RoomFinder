import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import "./RoomPost.css";

const RoomPost = ({ post, onTitleClick, onToggleFavorite, isFavorite }) => {
  const handleFavoriteClick = () => {
    console.log("onToggleFavorite in RoomPost:", onToggleFavorite);

    if (onToggleFavorite) {
      onToggleFavorite(post._id, !isFavorite);
    } else {
      console.error("onToggleFavorite không được cung cấp!");
    }
  };

  const formatPriceToText = (price) => {
    if (typeof price !== "number" || isNaN(price)) {
      return "Giá không hợp lệ";
    }

    if (price >= 1_000_000_000) {
      const billions = Math.floor(price / 1_000_000_000);
      return `${billions} Tỷ VNĐ`;
    }

    if (price >= 1_000_000) {
      const millions = Math.floor(price / 1_000_000);
      const rest = Math.floor((price % 1_000_000) / 1_000);
      return rest > 0
        ? `${millions} triệu ${rest} nghìn VND`
        : `${millions} triệu VND`;
    }

    return `${price.toLocaleString()} VND`;
  };

  return (
    <Card className="room-post-card">
      <Box className="room-post-images">
        {post.images && post.images.length > 0 && (
          <CardMedia
            component="img"
            image={post.images[0]}
            alt="Room image"
            className="room-post-image"
          />
        )}
        <Button className="room-post-price" variant="contained" color="primary">
          {post.price !== undefined
            ? formatPriceToText(post.price)
            : "Không có giá"}
        </Button>
      </Box>
      <CardContent className="room-post-content">
        <Box>
          <Typography
            variant="h6"
            className="room-post-title"
            onClick={() => onTitleClick(post._id)}
          >
            {post.title}
          </Typography>
          <Typography variant="body2" className="room-post-location">
            {post.address.district}, {post.address.province}
          </Typography>
        </Box>
        <Box>
          <Button className="post-area" variant="outlined">
            {post.area}{post.typeArea}
          </Button>
        </Box>
      </CardContent>
      <Box className="favorite-icon" onClick={handleFavoriteClick}>
        {isFavorite ? (
          <FavoriteIcon color="error" className="favorite-icon-filled" />
        ) : (
          <FavoriteBorderIcon className="favorite-icon-border" />
        )}
      </Box>
    </Card>
  );
};

export default RoomPost;
