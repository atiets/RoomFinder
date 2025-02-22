import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateUserProfile } from "../../../redux/apiRequest";
import "./EditProfile.css";

const EditProfile = ({ user }) => {
  document.title = "Chỉnh sửa thông tin cá nhân";
  const [picture, setAvatar] = useState(user?.profile?.picture || "");
  const [open, setOpen] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [address, setAddress] = useState(user?.profile?.address || "");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [username, setUsername] = useState(user?.username || "");
  const [phone, setPhone] = useState(user?.profile?.phone || "");
  const [bio, setBio] = useState(user?.profile?.bio || "");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const SelectWithLabel = ({ label, options, value, onChange }) => {
    return (
      <FormControl fullWidth variant="outlined">
        <InputLabel>{label}</InputLabel>
        <Select
          value={value || ""}
          onChange={(event) => {
            const selected = options.find(
              (option) => option.code === event.target.value,
            );
            onChange(selected);
          }}
          label={label}
          size="small"
        >
          {options.map((option) => (
            <MenuItem key={option.code} value={option.code}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };
  // Mở modal
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Gọi API để lấy danh sách địa chỉ
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://provinces.open-api.vn/api/?depth=3",
        );
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  const handleProvinceChange = (newValue) => {
    setSelectedProvince(newValue);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts(newValue ? newValue.districts || [] : []);
    setWards([]);
  };

  const handleDistrictChange = (newValue) => {
    setSelectedDistrict(newValue);
    setSelectedWard(null);
    setWards(newValue ? newValue.wards || [] : []);
  };

  const handleWardChange = (newValue) => {
    setSelectedWard(newValue);
  };

  const handleSelectAddress = () => {
    const fullAddress = `${selectedProvince?.name || ""}, ${selectedDistrict?.name || ""}, ${selectedWard?.name || ""}, ${address}`;

    setSelectedAddress(fullAddress);
    setAddress(fullAddress);
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

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Chọn Địa chỉ</DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              gap: "25px",
              flexDirection: "column",
              flexGrow: 1,
              width: 400,
              borderRadius: "15px",
            }}
          >
            <div style={{ flex: 1 }}>
              <SelectWithLabel
                label="Chọn Tỉnh/Thành phố"
                options={provinces}
                value={selectedProvince ? selectedProvince.code : null}
                onChange={handleProvinceChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <SelectWithLabel
                label="Chọn Quận/Huyện"
                options={districts}
                value={selectedDistrict ? selectedDistrict.code : null}
                onChange={handleDistrictChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <SelectWithLabel
                label="Chọn Phường/Xã"
                options={wards}
                value={selectedWard ? selectedWard.code : null}
                onChange={handleWardChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <TextField
                size="small"
                label="Địa chỉ cụ thể"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, tên đường"
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSelectAddress}
            className="update-profile-confirm-btn"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

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
