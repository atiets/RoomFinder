import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import React from "react";
import "./RoomPostUser.css";

const RoomPostUser = ({ post, onTitleClick }) => {
  return (
    <Card className="room-post-card">
      <Box className="room-post-images">
        {/* Chỉ hiển thị ảnh đầu tiên */}
        {post.images[0] && (
          <CardMedia
            component="img"
            image={post.images[0]}
            alt="Room image"
            className="room-post-image"
          />
        )}
        <button className="room-post-price">
          {post.rentalPrice}
          {post.typePrice === "1"
            ? " Triệu/Tháng"
            : post.typePrice === "2"
              ? " Triệu/m²/tháng"
              : ""}
        </button>
      </Box>
      <CardContent className="room-post-content">
        <Box>
          <Typography
            className="room-post-title"
            onClick={() => onTitleClick(post.id)}
          >
            {post.title}
          </Typography>
          <Typography variant="body2" className="room-post-location">
            {post.address.district}, {post.address.province}
          </Typography>
        </Box>
        <Box>
          <Button className="post-area">{post.area}m²</Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomPostUser;
