import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import {
  Box,
  Button,
  IconButton,
  TextField
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateUserProfile } from "../../../redux/apiRequest";
import AddressModal from "../ModalAddress";
import "./EditProfile.css";

const EditProfile = ({ user }) => {
  document.title = "Chỉnh sửa thông tin cá nhân";
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const address = currentUser?.profile?.address || "";  

  const [picture, setAvatar] = useState(user?.profile?.picture || "");
  const [open, setOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [username, setUsername] = useState(user?.username || "");
  const [phone, setPhone] = useState(user?.profile?.phone || "");
  const [bio, setBio] = useState(user?.profile?.bio || "");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar({ file, preview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append("name", username);
    formData.append("phone", phone);
    formData.append("address", selectedAddress);
    formData.append("bio", bio);
    if (picture) {
      formData.append("picture", picture.file);
    }

    console.log("Form Data:", formData);
    try {
      setLoading(true);
      await updateUserProfile(user._id, formData, user.accessToken, dispatch);
      toast.success("Cập nhật hồ sơ thành công!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      // Xử lý lỗi và thông báo thất bại
      const errorMessage =
        error.response?.data?.message ||
        "Đã xảy ra lỗi trong quá trình cập nhật hồ sơ.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
    <div className="container-edit-profile">
      <div className="user-info" style={{ position: "relative" }}>
        {picture ? (
          <img
            src={picture.preview || picture || null}
            alt="User Avatar"
            className="avatar"
            style={{ width: 100, height: 100, borderRadius: "50%" }}
          />
        ) : (
          <AccountCircleIcon className="avatar" style={{ fontSize: 100 }} />
        )}

        <label
          htmlFor="avatar-upload"
          style={{ position: "absolute", top: "65px", right: "200px" }}
        >
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
          <IconButton
            component="span"
            style={{ backgroundColor: "white", borderRadius: "50%" }}
          >
            <AddAPhotoOutlinedIcon style={{ fontSize: 25 }} />
          </IconButton>
        </label>

        <div className="user-details">
          <h3 className="user-name">{user?.username || "Unknown User"}</h3>
          <p className="user-phone">
            {user?.profile?.phone || "No phone number"}
          </p>
        </div>
      </div>

      <Box className="name-phone">
        <TextField
          label="Họ tên"
          size="small"
          fullWidth
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Thêm số điện thoại"
          size="small"
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="number"
        />
      </Box>

      <TextField
        label="Địa chỉ"
        size="small"
        fullWidth
        onClick={handleClickOpen}
        value={selectedAddress || address}
      />

      <AddressModal
        open={open}
        onClose={handleClose}
        onConfirm={(data) => {
          setSelectedAddress(data.fullAddress);
        }}
      />

      <textarea
        placeholder="Viết vài dòng giới thiệu bản thân"
        className="bio-textarea"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <Button
        className="update-profile-confirm-btn"
        onClick={handleUpdateProfile}
      >
        Cập nhật hồ sơ
      </Button>
      <ToastContainer />
    </div>
  );
};

export default EditProfile;
