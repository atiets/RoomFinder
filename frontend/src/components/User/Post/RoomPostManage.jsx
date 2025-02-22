import ModeEditIcon from "@mui/icons-material/ModeEdit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import "./RoomPostManage.css"; // Import CSS tùy chỉnh

const RoomPostManage = ({
  post,
  onTitleClick,
  onEditPost,
  onHidePost,
  onDeletePost,
  onVisiblePost,
}) => {
  const [menuVisible, setMenuVisible] = useState(null);

  const toggleMenu = (event) => {
    setMenuVisible(menuVisible ? null : event.currentTarget);
  };

  console.log("Post data in room manage.:", post);

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
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {post.visibility === "visible" && post.status === "approved" && (
            <>
              <Typography className="room-post-manage-date-visible">
                Bài đăng sẽ ẩn sau: {post.daysRemaining} ngày,{" "}
                {post.hoursRemaining} giờ
              </Typography>
            </>
          )}
          <Button className="post-area">{post.area}m²</Button>
          <Button
            className="room-post-more"
            title="Click vào đây để update hoặc ẩn bài viết"
            onClick={toggleMenu}
          >
            <MoreVertIcon />
          </Button>
          <Menu
            anchorEl={menuVisible}
            open={Boolean(menuVisible)}
            onClose={() => setMenuVisible(null)}
            className="custom-menu-container"
          >
            {post.visibility === "visible" && post.status === "approved" && (
              <>
                <MenuItem
                  className="custom-menu-item"
                  onClick={() => onEditPost(post.id)}
                >
                  <ModeEditIcon /> Chỉnh sửa bài viết
                </MenuItem>
                <MenuItem
                  className="custom-menu-item"
                  onClick={() => onHidePost(post.id)}
                >
                  <VisibilityOffIcon /> Ẩn bài viết
                </MenuItem>
              </>
            )}

            {post.status === "pending" && post.visibility === "hidden" && (
              <MenuItem
                className="custom-menu-item"
                onClick={() => onDeletePost(post.id)}
              >
                Xóa yêu cầu đăng bài
              </MenuItem>
            )}

            {post.status === "update" && post.visibility === "hidden" && (
              <MenuItem
                className="custom-menu-item"
                onClick={() => onDeletePost(post.id)}
              >
                Xóa yêu cầu chỉnh sửa bài đăng
              </MenuItem>
            )}
            {post.visibility === "hidden" && post.status === "approved" && (
              <MenuItem
                className="custom-menu-item"
                onClick={() => onVisiblePost(post.id)}
              >
                <VisibilityIcon /> Hiển thị lại bài viết
              </MenuItem>
            )}
          </Menu>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomPostManage;
