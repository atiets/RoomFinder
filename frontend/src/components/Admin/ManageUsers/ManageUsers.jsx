import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { createAxios } from "../../../createInstance";
import { getAllUsers } from "../../../redux/apiRequest";
import { loginSuccess } from "../../../redux/authSlice";
import { setSelectedMenu } from "../../../redux/menuSlice";
import "./ManageUsers.css";

const ManageUsers = () => {
  document.title = "Quản lý người dùng";
  const user = useSelector((state) => state.auth.login?.currentUser);
  const userList = useSelector((state) => state.users.users?.allUsers);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const [loading, setLoading] = useState(false);

  // Create axiosJWT instance
  let axiosJWT = createAxios(user, dispatch, loginSuccess);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user?.accessToken) {
      getAllUsers(user.accessToken, dispatch, axiosJWT);
    }
  }, [user, navigate]);

  // Open confirmation dialog
  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  // Open profile modal
  const handleOpenProfile = (user) => {
    setSelectedUserProfile(user);
    setOpenProfile(true);
  };

  // Close confirmation dialog
  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  // Close profile modal
  const handleCloseProfile = () => {
    setOpenProfile(false);
    setSelectedUserProfile(null);
  };

  // Block/unblock user account
  const handleBlockUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await axiosJWT.put(
        `/v1/user/block/${selectedUser._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        },
      );

      if (response.status === 200) {
        toast.success(response.data.message);
        getAllUsers(user?.accessToken, dispatch, axiosJWT); // Refresh the user list
      }
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
      toast.error("Không thể cập nhật trạng thái tài khoản.");
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  // Navigate to user's posts
  const handleViewPosts = (userId) => {
    dispatch(setSelectedMenu("userPost"));
    navigate(`/user-posts/${userId}`);
  };

  // Filter out admin accounts
  const filteredUsers = userList?.filter((item) => !item.admin);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers?.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers?.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Function to get page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 5; // Max page buttons to show
    let startPage = Math.max(currentPage - Math.floor(maxPageNumbers / 2), 1);
    let endPage = startPage + maxPageNumbers - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxPageNumbers + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  return (
    <Box className="manage-users">
      <ToastContainer position="top-right" autoClose={5000} />
      <Box className="content">
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "#333333",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Quản Lý Người Dùng
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hành động</TableCell>
                <TableCell>Bài đăng</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentUsers?.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <p
                      className="user_name"
                      onClick={() => handleOpenProfile(user)}
                    >
                      {user.username}
                    </p>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.profile?.isBlocked ? "Đã khóa" : "Hoạt động"}
                  </TableCell>
                  <TableCell>
                    <Button
                      color={user.profile?.isBlocked ? "secondary" : "primary"}
                      onClick={() => handleOpenDialog(user)}
                    >
                      {user.profile?.isBlocked
                        ? "Mở khóa tài khoản"
                        : "Khóa tài khoản"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      color="secondary"
                      onClick={() => handleViewPosts(user._id)}
                    >
                      Xem tất cả bài đăng
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Xác Nhận</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.profile?.isBlocked
              ? `Bạn có chắc muốn mở khóa tài khoản của ${selectedUser?.username}?`
              : `Bạn có chắc muốn khóa tài khoản của ${selectedUser?.username}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Hủy
          </Button>
          <Button onClick={handleBlockUser} color="secondary">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog
        open={openProfile}
        onClose={handleCloseProfile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thông Tin Người Dùng</DialogTitle>
        <DialogContent>
          <div className="user-detail user-image">
            <img
              src={
                selectedUserProfile?.profile?.picture
                  ? selectedUserProfile?.profile?.picture
                  : require("../../../assets/images/user.png")
              }
              alt="Profile"
            />
          </div>
          <DialogContentText>
            <div className="user-information">
              {selectedUserProfile?.username && (
                <dl>
                  <dt>
                    <i className="fa-solid fa-user"></i> :
                  </dt>
                  <dd>{selectedUserProfile?.username}</dd>
                </dl>
              )}
              {selectedUserProfile?.email && (
                <dl>
                  <dt>
                    <i className="fa-solid fa-envelope"></i> :
                  </dt>
                  <dd>{selectedUserProfile?.email}</dd>
                </dl>
              )}
              {selectedUserProfile?.profile?.phone && (
                <dl>
                  <dt>
                    <i className="fa-solid fa-phone"></i> :
                  </dt>
                  <dd>
                    <a href={`tel:${selectedUserProfile?.profile?.phone}`}>
                      {selectedUserProfile?.profile?.phone}
                    </a>
                  </dd>
                </dl>
              )}
              {selectedUserProfile?.profile?.address && (
                <dl>
                  <dt>
                    <i className="fa-solid fa-location-dot"></i> :
                  </dt>
                  <dd>{selectedUserProfile?.profile?.address}</dd>
                </dl>
              )}
              {selectedUserProfile?.profile?.bio && (
                <dl>
                  <dt>
                    <i className="fa-solid fa-book-atlas"></i> :
                  </dt>
                  <dd>{selectedUserProfile?.profile?.bio}</dd>
                </dl>
              )}
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProfile} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      <div className="pagination">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          &laquo; Trước
        </button>
        {getPageNumbers().map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`pagination-button ${currentPage === number ? "active" : ""}`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Tiếp &raquo;
        </button>
      </div>
    </Box>
  );
};

export default ManageUsers;
