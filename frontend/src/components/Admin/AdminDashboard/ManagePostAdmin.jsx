import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Button,
  Menu,
  MenuItem,
  Pagination,
  TextField,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  approvePost,
  getAllPosts,
  hiddePost,
  rejectPost,
  updateDefaultDaysToShow,
  visiblePost,
} from "../../../redux/postAPI";
import "./ManagePostAdmin.css";
import RoomPostManage from "./RoomPostManage";

const ManagePostAdmin = () => {
  document.title = "Quản lý bài đăng";
  const [filter, setFilter] = useState("Tất cả");

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElUpdateDate, setAnchorElUpdateDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [openUpdateDate, setOpenUpdateDate] = useState(false);

  const [allPosts, setAllPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const [filterText, setFilterText] = useState("Lọc bài viết");
  const [days, setDays] = useState();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchKeyword);

  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchKeyword]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleOpenUpdateDate = (event) => {
    setAnchorElUpdateDate(event.currentTarget);
    setOpenUpdateDate(true);
  };

  const handleCloseUpdateDate = (event) => {
    setOpenUpdateDate(false);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const handleTitleClick = (id) => {
    navigate(`/posts/${id}`);
  };

  const handleUpdateDays = async () => {
    try {
      setLoading(true);
      const response = await updateDefaultDaysToShow(days, token);
      toast.success("Cập nhật số ngày hiển thị mặc định thành công!");
      setOpenUpdateDate(false);
    } catch (error) {
      toast.error("Cập nhật số ngày hiển thị mặc định thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const statusVisibilityMap = {
    "Tất cả": { status: "", visibility: "" },
    "Chờ duyệt": { status: "pending", visibility: "hidden" },
    "Đang hiển thị": { status: "approved", visibility: "visible" },
    "Đã từ chối": { status: "rejected", visibility: "hidden" },
    "Đã ẩn": { status: "approved", visibility: "hidden" },
    "Bài đăng chỉnh sửa": { status: "update", visibility: "hidden" },
    "🌟 Chỉ tin VIP": { status: "", visibility: "", onlyVip: true },
  };

  const fetchFilteredPosts = async () => {
    const { status, visibility, onlyVip } = statusVisibilityMap[filter] || {};

    console.log(`🔍 Filter selected: "${filter}"`);
    console.log(`📋 Filter config:`, { status, visibility, onlyVip });

    try {
      setLoading(true);
      const postsPerPage = onlyVip ? 100 : 5;
      const pageToFetch = onlyVip ? 1 : currentPage;

      const data = await getAllPosts(
        token,
        pageToFetch,
        postsPerPage,
        status,
        visibility
      );

      // const data = await getAllPosts(token, currentPage, 5, status, visibility, debouncedSearch);
      if (Array.isArray(data.posts)) {
        let formattedPosts = data.posts.map((post) => ({
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
          typePrice: post.typePrice,
          area: post.area || 0,
          status: post.status || "pending",
          visibility: post.visibility || "hidden",
          isVip: post.isVip || false,
          views: post.views || 0,
          createdAt: post.createdAt,
          images: post.images ? post.images.slice(0, 2) : [],
        }));

        if (onlyVip) {
          const beforeFilter = formattedPosts.length;
          formattedPosts = formattedPosts.filter((post) => post.isVip === true);
          console.log(
            `🌟 VIP Filter: ${beforeFilter} posts -> ${formattedPosts.length} VIP posts`
          );
        }

        if (searchTerm) {
          formattedPosts = formattedPosts.filter(
            (post) =>
              post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              post.contactInfo.username
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              post.contactInfo.phoneNumber.includes(searchTerm)
          );
        }

        const sortedPosts = formattedPosts.sort((a, b) => {
          if (a.isVip && !b.isVip) return -1;
          if (!a.isVip && b.isVip) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        if (onlyVip) {
          const postsPerPageVip = 5;
          const totalVipPosts = sortedPosts.length;
          const newTotalPages = Math.ceil(totalVipPosts / postsPerPageVip) || 1;

          const startIndex = (currentPage - 1) * postsPerPageVip;
          const endIndex = startIndex + postsPerPageVip;
          const paginatedVipPosts = sortedPosts.slice(startIndex, endIndex);

          setAllPosts(paginatedVipPosts);
          setTotalPages(newTotalPages);

          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(1);
            return;
          }

          console.log(
            `📊 VIP Pagination: ${totalVipPosts} total VIP posts, ${newTotalPages} pages, showing page ${currentPage}`
          );
          console.log(`📋 Current page posts:`, paginatedVipPosts.length);
        } else {
          setAllPosts(sortedPosts);
          setCurrentPage(data.currentPage || 1);
          setTotalPages(data.totalPages || 1);
        }

        const vipCount = sortedPosts.filter((p) => p.isVip).length;
        console.log(
          `📊 Final result - Filter "${filter}": ${sortedPosts.length} posts, ${vipCount} VIP`
        );
      } else {
        console.error("Dữ liệu trả về không phải là mảng.");
        setAllPosts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu từ API:", error);
      setAllPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredPosts();
  }, [filter, currentPage, searchTerm]);

  const handleFilterChange = (event) => {
    const newFilter = event.target.innerText;
    console.log(`🎯 Filter clicked: "${newFilter}"`);
    setFilter(newFilter);
    setFilterText(newFilter);
    setCurrentPage(1);
    handleClose();
  };

  const handleApprove = async (postId) => {
    try {
      setLoading(true);
      await approvePost(token, postId);
      toast.success("Duyệt bài viết thành công!");
      fetchFilteredPosts();
    } catch (error) {
      toast.error("Lỗi khi duyệt bài viết!");
      console.error("Lỗi khi duyệt bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (postId) => {
    try {
      setLoading(true);
      await rejectPost(token, postId);
      toast.success("Từ chối bài viết thành công!");
      fetchFilteredPosts();
    } catch (error) {
      toast.error("Lỗi khi từ chối bài viết!");
      console.error("Lỗi khi từ chối bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHidden = async (postId) => {
    try {
      setLoading(true);
      await hiddePost(token, postId);
      toast.success("Ẩn bài viết thành công!");
      fetchFilteredPosts();
    } catch (error) {
      toast.error("Lỗi khi ẩn bài viết!");
      console.error("Lỗi khi ẩn bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisible = async (postId) => {
    try {
      setLoading(true);
      await visiblePost(token, postId);
      toast.success("Hiện bài viết thành công!");
      fetchFilteredPosts();
    } catch (error) {
      toast.error("Lỗi khi hiện bài viết!");
      console.error("Lỗi khi hiện lại bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  const vipCount = allPosts.filter((post) => post.isVip).length;

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="all-posts-list">
      <ToastContainer position="top-right" autoClose={5000} />

      <Box className="admin-manage-header" sx={{ marginBottom: 2 }}>
        <div className="admin-manage-title">
          <h2>Quản lý bài đăng</h2>
          <div className="admin-manage-stats">
            <Chip
              label={`📊 ${allPosts.length} bài`}
              size="small"
              variant="outlined"
            />
            {vipCount > 0 && (
              <Chip
                icon={<TrendingUpIcon />}
                label={`${vipCount} VIP`}
                size="small"
                className="admin-vip-chip-header"
                sx={{
                  background: "linear-gradient(45deg, #FFD700, #FFA500)",
                  color: "white",
                  fontWeight: "bold",
                  marginLeft: 1,
                }}
              />
            )}
          </div>
        </div>
      </Box>

      <div className="manage-post-admin-actions">
        <div className="manage-post-admin-container-filter"></div>

        <Button
          startIcon={<FilterAltOutlinedIcon />}
          className="manage-post-admin-btn-filter"
          onClick={handleClick}
        >
          {filterText}
        </Button>

        <Button
          className="manage-post-admin-btn-update-date"
          onClick={handleOpenUpdateDate}
        >
          Cập nhật số ngày hiển thị bài đăng
        </Button>

        <Menu
          className="manage-post-admin-menu-update-date"
          anchorEl={anchorElUpdateDate}
          open={openUpdateDate}
          onClose={handleCloseUpdateDate}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem
            sx={{
              "&:hover": {
                backgroundColor: "transparent",
              },
              "&:focus": {
                backgroundColor: "transparent",
              },
              "&.Mui-selected": {
                backgroundColor: "transparent",
              },
            }}
          >
            <TextField
              label="Số ngày"
              variant="outlined"
              size="small"
              fullWidth
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Nhập số ngày..."
            />
          </MenuItem>
          <MenuItem
            sx={{
              display: "flex",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "transparent",
              },
              "&:focus": {
                backgroundColor: "transparent",
              },
              "&.Mui-selected": {
                backgroundColor: "transparent",
              },
            }}
          >
            <Button
              className="manage-post-admin-btn-change-date"
              onClick={handleUpdateDays}
              disabled={!days || days <= 0}
            >
              Xác nhận
            </Button>
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={handleFilterChange}>Tất cả</MenuItem>
          <MenuItem onClick={handleFilterChange}>Chờ duyệt</MenuItem>
          <MenuItem onClick={handleFilterChange}>Đang hiển thị</MenuItem>
          <MenuItem onClick={handleFilterChange}>Đã từ chối</MenuItem>
          <MenuItem onClick={handleFilterChange}>Đã ẩn</MenuItem>
          <MenuItem onClick={handleFilterChange}>Bài đăng chỉnh sửa</MenuItem>
          <MenuItem
            onClick={handleFilterChange}
            className="vip-filter-item"
            sx={{
              backgroundColor: "#333333 !important",
              color: "#FFD700 !important",
              fontWeight: "bold !important",
              borderRadius: "4px",
              margin: "2px 4px",
              "&:hover": {
                backgroundColor: "#444444 !important",
                color: "#FFA500 !important",
              },
            }}
          >
            🌟 Chỉ tin VIP
          </MenuItem>
        </Menu>

        <TextField
          label="Tìm kiếm theo tên, tác giả, SĐT..."
          variant="outlined"
          size="small"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          sx={{ width: "300px", marginLeft: "20px" }}
        />
      </div>

      {filter !== "Tất cả" && (
        <Box
          sx={{
            padding: 1,
            marginBottom: 1,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="textSecondary">
            Đang hiển thị: <strong>{filter}</strong>
            {filter === "🌟 Chỉ tin VIP" && ` (${vipCount} tin VIP)`}
          </Typography>

          {totalPages > 1 && (
            <Typography variant="body2" color="textSecondary">
              Trang {currentPage}/{totalPages}
            </Typography>
          )}
        </Box>
      )}

      {/* ⭐ Posts List */}
      {allPosts.length > 0 ? (
        allPosts.map((post, index) => (
          <RoomPostManage
            key={post.id}
            post={post}
            onTitleClick={handleTitleClick}
            onApprove={handleApprove}
            onReject={handleReject}
            onHide={handleHidden}
            onVisible={handleVisible}
          />
        ))
      ) : (
        <div className="container-nocontent">
          <Typography
            variant="h6"
            sx={{ textAlign: "center", padding: 4, color: "#666" }}
          >
            {filter === "🌟 Chỉ tin VIP"
              ? "🌟 Không có tin VIP nào"
              : searchTerm
                ? `🔍 Không tìm thấy kết quả cho "${searchTerm}"`
                : "📝 Chưa có tin đăng nào"}
          </Typography>
        </div>
      )}

      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 2,
            gap: 2,
          }}
        >
          <Pagination
            className="manage-post-admin-pagination"
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

          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ whiteSpace: "nowrap" }}
          >
            Hiển thị {allPosts.length} tin trên trang {currentPage}
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default ManagePostAdmin;
