import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import iconChangePass from "../../../assets/images/iconChangePass.png";
import iconLogout from "../../../assets/images/iconLogout.png";
import { createAxios } from "../../../createInstance";
import { logout } from "../../../redux/apiRequest";
import { logoutSuccess } from "../../../redux/authSlice";
import { setSelectedMenu } from "../../../redux/menuSlice";
import "./AdminHeader.css";

const AdminHeader = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const dispatch = useDispatch();
  const accessToken = currentUser?.accessToken;
  const id = currentUser?._id;
  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });
  axiosJWT = createAxios(currentUser, dispatch, logoutSuccess);

  const handleLogout = () => {
    logout(dispatch, id, navigate, accessToken, axiosJWT);
  };

  return (
    <AppBar className="admin-header">
      <Toolbar>
        <Typography
          className="admin-header-title"
          onClick={() => dispatch(setSelectedMenu("dashboard"))}
          style={{ cursor: "pointer" }}
        >
          Phòng Trọ Xinh
        </Typography>
        <Box className="admin-header-buttons">
          <Button
            onClick={() => navigate("/chang-pass")}
            className="change-pass-button"
          >
            <img
              src={iconChangePass}
              alt="changePass"
              style={{ width: "20px", marginRight: "8px" }}
            />
            Đổi mật khẩu
          </Button>
          <Button onClick={handleLogout} className="logout-button">
            <img
              src={iconLogout}
              alt="Logout"
              style={{ width: "20px", marginRight: "8px" }}
            />
            Đăng Xuất
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
