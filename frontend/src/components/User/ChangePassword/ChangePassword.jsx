import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { changePassword } from "../../../redux/apiRequest";
import "./ChangePassword.css";
import { useSelector } from "react-redux";

const ChangePassword = () => {
  document.title = "Đổi mật khẩu";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const accessToken = currentUser?.accessToken;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    const passwordData = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    await changePassword(passwordData, accessToken, null, setMessage);

    // Reset form nếu thành công
    if (message === "Mật khẩu đã được thay đổi thành công!") {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <Box className="change-password-container">
      <form onSubmit={handleSubmit} className="change-password-form">
        <Typography variant="h5" className="change-password-title">
          Đổi Mật Khẩu
        </Typography>

        <div className="input-container">
          <TextField
            label="Mật khẩu hiện tại"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            className="form-field"
            required
            size="small"
          />
          <span
            className="toggle-password"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <div className="input-container">
          <TextField
            label="Mật khẩu mới"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            className="form-field"
            required
            size="small"
          />
          <span
            className="toggle-password"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <div className="input-container">
          <TextField
            label="Xác nhận mật khẩu mới"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            className="form-field"
            required
            size="small"
          />
          <span
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {message && (
          <Typography
            className={
              message.includes("thành công")
                ? "success-message"
                : "error-message"
            }
          >
            {message}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          className="submit-button"
        >
          Cập nhật
        </Button>
      </form>
    </Box>
  );
};

export default ChangePassword;
