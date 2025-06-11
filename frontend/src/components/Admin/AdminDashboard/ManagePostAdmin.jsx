import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import {
  Button,
  Menu,
  MenuItem,
  Pagination,
  TextField,
  Typography,
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
      toast.error("Cập nhật số ngày hiển thị mặc định thất bai!");
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
  };

  const fetchFilteredPosts = async () => {
    const { status, visibility } = statusVisibilityMap[filter] || {};
    try {
      setLoading(true);
      const data = await getAllPosts(token, currentPage, 5, status, visibility, debouncedSearch);

      if (Array.isArray(data.posts)) {
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
          price: post.price,
          area: post.area,
          typeArea: post.typeArea,
          status: post.status,
          visibility: post.visibility,
          images: post.images ? post.images.slice(0, 2) : [],
        }));

        setAllPosts(formattedPosts);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } else {
        console.error("Dữ liệu trả về không phải là mảng.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu từ API:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchFilteredPosts();
  }, [filter, currentPage, debouncedSearch]);

  const handleFilterChange = (event) => {
    setFilter(event.target.innerText);
    setFilterText(event.target.innerText);
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
      console.error("Lỗi khi từ chối bài viết:", error);
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
      console.error("Lỗi khi hiện lại bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="all-posts-list">
      <ToastContainer position="top-right" autoClose={5000} />
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
              value={days}
              onChange={(e) => setDays(e.target.value)}
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
        </Menu>
        <TextField
          label="Search by title, author, or phone number"
          variant="outlined"
          size="small"
          sx={{ width: "300px", marginLeft: "20px" }}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>
      {allPosts.length > 0 ? (
        allPosts.map((post, index) => (
          <RoomPostManage
            key={index}
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
          <Typography>Chưa có tin đăng nào</Typography>
        </div>
      )}
      <Pagination
        className="manage-post-admin-pagination"
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        size="medium"
        siblingCount={1}
        boundaryCount={1}
      />
    </div>
  );
};

export default ManagePostAdmin;
