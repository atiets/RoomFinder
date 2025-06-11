import { Pagination, Typography, Box, Chip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllPosts } from "../../../redux/postAPI";
import "./ManagePosts.css";
import RoomPostManage from "./RoomPostManage";

const ManagePosts = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;

  const navigate = useNavigate();

  const handleTitleClick = (id) => {
    navigate(`/posts/${id}`);
  };

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const data = await getAllPosts(token, currentPage, 5);
        if (Array.isArray(data.posts)) {
          // ⭐ Enhanced data mapping với VIP support
          const formattedPosts = data.posts.map((post) => ({
            id: post._id,
            address: {
              province: post.address?.province || "",
              district: post.address?.district || "",
            },
            title: post.title || "",
            content: post.content || "",
            contactInfo: {
              username: post.contactInfo?.username || "",
              phoneNumber: post.contactInfo?.phoneNumber || "",
            },
            price: post.price || post.rentalPrice || 0,
            rentalPrice: post.rentalPrice || post.price || 0,
            area: post.area || 0,
            status: post.status || "pending",
            visibility: post.visibility || "hidden",
            isVip: post.isVip || false, // ⭐ VIP field
            views: post.views || 0,
            createdAt: post.createdAt,
            images: post.images ? post.images.slice(0, 2) : [],
          }));

          // ⭐ Sort với VIP priority cho admin
          const sortedPosts = formattedPosts.sort((a, b) => {
            // VIP posts lên đầu
            if (a.isVip && !b.isVip) return -1;
            if (!a.isVip && b.isVip) return 1;
            
            // Cùng loại thì sort theo thời gian tạo
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

          setAllPosts(sortedPosts);
          setTotalItems(data.totalItems);
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);

          // ⭐ Debug VIP posts
          const vipCount = sortedPosts.filter(p => p.isVip).length;
          console.log(`📊 Admin Posts: ${sortedPosts.length} total, ${vipCount} VIP`);
        } else {
          console.error("Dữ liệu trả về không phải là mảng.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ API:", error);
      }
    };

    fetchAllPosts();
  }, [token, currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // ⭐ Count statistics
  const vipCount = allPosts.filter(post => post.isVip).length;
  const normalCount = allPosts.length - vipCount;

  return (
    <div className="admin-posts-container">
      {/* ⭐ Admin Header với VIP stats */}
      <Box className="admin-posts-header">
        <div className="admin-posts-title">
          <h2>Quản lý tất cả bài đăng</h2>
          <div className="admin-posts-stats">
            <Chip 
              label={`📊 Tổng: ${allPosts.length}`}
              size="small"
              variant="outlined"
              className="admin-stat-chip"
            />
            {vipCount > 0 && (
              <Chip 
                icon={<TrendingUpIcon />}
                label={`VIP: ${vipCount}`}
                size="small"
                className="admin-vip-stat-chip"
              />
            )}
            <Chip 
              label={`Thường: ${normalCount}`}
              size="small"
              variant="outlined"
              className="admin-normal-stat-chip"
            />
          </div>
        </div>
      </Box>

      {/* ⭐ Posts List */}
      <div className="admin-posts-list">
        {allPosts.length > 0 ? (
          allPosts.map((post, index) => (
            <RoomPostManage
              key={post.id}
              post={post}
              onTitleClick={handleTitleClick}
            />
          ))
        ) : (
          <div className="admin-no-content">
            <Typography>Chưa có tin đăng nào</Typography>
          </div>
        )}
      </div>

      {/* ⭐ Pagination */}
      <div className="admin-pagination-wrapper">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size="medium"
          siblingCount={1}
          boundaryCount={1}
          showFirstButton
          showLastButton
        />
      </div>
    </div>
  );
};

export default ManagePosts;