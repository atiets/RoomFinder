import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
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
  return (
    <Card className="room-post-card">
      <Box className="room-post-images">
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
        {post.status === "pending" && (
          <Box className="manage-post-admin-btn-container">
            <Button
              className="manage-post-admin-btn-approved"
              onClick={() => onApprove(post.id)}
            >
              Duyệt
            </Button>
            <Button
              className="manage-post-admin-btn-rejected"
              onClick={() => onReject(post.id)}
            >
              Từ chối
            </Button>
          </Box>
        )}
        {post.status === "approved" && post.visibility === "visible" && (
          <Box className="manage-post-admin-btn-container">
            <Button
              className="manage-post-admin-btn-hide"
              onClick={() => onHide(post.id)}
            >
              Ẩn
            </Button>
          </Box>
        )}
        {post.status === "approved" && post.visibility === "hidden" && (
          <Box className="manage-post-admin-btn-container">
            <Button
              className="manage-post-admin-btn-hide"
              onClick={() => onVisible(post.id)}
            >
              Hiện bài đăng
            </Button>
          </Box>
        )}
        {post.status === "update" && (
          <Box className="manage-post-admin-btn-container">
            <Button
              className="manage-post-admin-btn-approved"
              onClick={() => onApprove(post.id)}
            >
              Duyệt
            </Button>
            <Button
              className="manage-post-admin-btn-rejected"
              onClick={() => onReject(post.id)}
            >
              Từ chối
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomPostManage;
