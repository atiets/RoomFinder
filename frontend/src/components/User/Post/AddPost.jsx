import PhotoCamera from "@mui/icons-material/PhotoCamera";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import Quill from "quill";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createPost } from "../../../redux/postAPI";
import "./AddPost.css";

const SelectWithLabel = ({ label, options, value, onChange }) => {
  document.title = "Thêm bài đăng mới";
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

const AddPost = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const accessToken = currentUser?.accessToken;
  const user = currentUser?._id;
  const [phone, setPhone] = useState("");
  const [rentalPrice, setRentalPrice] = useState("");
  const [area, setArea] = useState("");
  const formattedArea = `${area}`;
  const [areaError, setAreaError] = useState("");
  const [rentalTarget, setRentalTarget] = useState("");
  const [maxOccupants, setMaxOccupants] = useState("");
  const [maxOccupantsError, setMaxOccupantsError] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const fullAddress = `${address} ${selectedWard ? selectedWard.name : ""} ${selectedDistrict ? selectedDistrict.name : ""} ${selectedProvince ? selectedProvince.name : ""}`;
  const [propertyType, setpropertyType] = useState("");
  const [errorRental, setErrorRental] = useState("");
  const navigate = useNavigate();
  const [errorTitle, setErrorTitle] = useState("");
  const [errorContent, setErrorContent] = useState("");
  const [errorPhone, setErrorPhone] = useState("");
  const [typePrice, setTypePrice] = useState("1");
  const [errorNull, setErrorNull] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePhone = (value) => {
    const phoneRegex = /^0[0-9]{8,10}$/;
    if (!phoneRegex.test(value)) {
      return "Số điện thoại phải bắt đầu bằng 0 và có độ dài từ 9 đến 11 chữ số.";
    }
    return "";
  };

  const handleChangePhone = (e) => {
    const value = e.target.value;
    setPhone(value);
    const errorMessage = validatePhone(value);
    setErrorPhone(errorMessage);
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    if (value.length < 400) {
      setContent(value);
      setErrorContent("");
    } else {
      setErrorContent("Mô tả không được vượt quá 400 ký tự");
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length < 50) {
      setTitle(value);
      setErrorTitle("");
    } else {
      setErrorTitle("Tiêu đề không được vượt quá 50 ký tự");
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    if (value.length >= 20) {
      setError("Địa chỉ không được quá 20 ký tự");
    } else {
      setError("");
    }
  };

  const handleMaxOccupantsChange = (e) => {
    const value = e.target.value;
    const regex = /^[0-9]*$/;

    if (value === "" || regex.test(value)) {
      setMaxOccupants(value);
      setMaxOccupantsError("");
    } else {
      setMaxOccupantsError("Số lượng tối đa phải là số nguyên không âm");
    }
  };
  const handleRentalPriceChange = (e) => {
    const value = e.target.value;
    const regex = /^[0-9]*\.?[0-9]*$/;

    if (value === "" || regex.test(value)) {
      setRentalPrice(value);
      setErrorRental("");
    } else {
      setErrorRental("Giá cho thuê phải là số thực không âm");
    }
  };

  const handleAreaChange = (e) => {
    const value = e.target.value;
    const regex = /^[0-9]*\.?[0-9]*$/;

    if (value === "" || regex.test(value)) {
      setArea(value);
      setAreaError("");
    } else {
      setAreaError("Diện tích phải là số thực không âm");
    }
  };

  const handleCurrencyChange = (e) => {
    setTypePrice(e.target.value);
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    if (selectedImages.length + files.length <= 8) {
      Promise.all(
        files.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({ file, preview: reader.result });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }),
      )
        .then((newImages) => {
          setSelectedImages((prevImages) => [...prevImages, ...newImages]);
        })
        .catch((error) => {
          console.error("Error reading file:", error);
          alert("Có lỗi khi tải ảnh lên.");
        });
    } else {
      alert("Bạn chỉ có thể tải lên tối đa 8 hình ảnh.");
    }
  };

  const quillRef = React.useRef(null);

  React.useEffect(() => {
    const quill = new Quill(quillRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, false] }],
          ["bold", "italic", "underline"],
          ["image", "video"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ font: [] }, { size: ["small", "medium", "large", "huge"] }],
          [{ align: [] }],
          [{ color: [] }, { background: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          ["link", "blockquote", "code-block"],
          ["clean"],
        ],
      },
    });

    quill.on("text-change", () => {
      setContent(quill.root.innerHTML);
    });
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(
          "https://provinces.open-api.vn/api/?depth=3",
        );
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      !address ||
      !selectedProvince ||
      !selectedWard ||
      !propertyType ||
      !title ||
      !content ||
      !phone ||
      !rentalPrice ||
      !formattedArea
    ) {
      setErrorNull("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    const formData = new FormData();
    formData.append(
      "address",
      JSON.stringify({
        exactaddress: address,
        province: selectedProvince ? selectedProvince.name : "",
        district: selectedDistrict ? selectedDistrict.name : "",
        ward: selectedWard ? selectedWard.name : "",
      }),
    );
    formData.append("category", propertyType);
    formData.append("title", title);
    formData.append("content", content);
    formData.append(
      "contactInfo",
      JSON.stringify({
        user: user,
        username: currentUser?.username,
        phoneNumber: phone,
      }),
    );
    formData.append("rentalPrice", rentalPrice);
    formData.append("typePrice", typePrice);
    formData.append("area", formattedArea);
    formData.append("rentalTarget", rentalTarget);
    formData.append("maxOccupants", maxOccupants);
    formData.append("youtubeLink", youtubeLink);

    for (let image of selectedImages) {
      formData.append("images", image.file);
    }

    try {
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      setLoading(true);
      const response = await createPost(formData, accessToken);
      toast.success("Đăng bài thành công, vui lòng chờ admin duyệt");
      navigate("/");
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      }
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
    <div className="div-user-container-add-post">
      <ToastContainer position="top-right" autoClose={5000} />
      <Box
        sx={{ display: "flex", height: "100vh" }}
        className="addpost-container"
      >
        <Box
          sx={{
            flex: 4,
            bgcolor: "#ffffff",
            padding: 2,
            justifyContent: "center",
          }}
        >
          <form
            className="form-container-user-add-post"
            onSubmit={handleSubmit}
          >
            {errorNull && <p className="error-message">{errorNull}</p>}
            <Typography className="title">Đăng tin mới</Typography>
            <Typography className="title2">Địa chỉ cho thuê</Typography>
            <div style={{ display: "flex", gap: "16px", flexGrow: 1 }}>
              <div style={{ flex: 1 }}>
                <SelectWithLabel
                  label="Chọn Tỉnh/Thành phố"
                  options={provinces}
                  value={selectedProvince ? selectedProvince.code : null}
                  onChange={handleProvinceChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <SelectWithLabel
                  label="Chọn Quận/Huyện"
                  options={districts}
                  value={selectedDistrict ? selectedDistrict.code : null}
                  onChange={handleDistrictChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <SelectWithLabel
                  label="Chọn Phường/Xã"
                  options={wards}
                  value={selectedWard ? selectedWard.code : null}
                  onChange={handleWardChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <TextField
                  id="address-field"
                  label="Địa chỉ"
                  variant="outlined"
                  size="small"
                  fullWidth
                  error={!!error}
                  helperText={error}
                  value={address}
                  onChange={handleAddressChange}
                  inputProps={{
                    maxLength: 20,
                  }}
                  required
                />
              </div>
            </div>
            <Box sx={{ marginTop: 2 }}>
              <Typography className="title2">Địa chỉ chính xác</Typography>
              <TextField
                size="small"
                variant="outlined"
                value={fullAddress}
                InputProps={{
                  readOnly: true,
                  sx: { bgcolor: "#f0f0f0", marginBottom: "0.5rem" },
                }}
                fullWidth
                sx={{ marginTop: 1 }}
                required
              />
            </Box>
            <Box className="container-info-detail">
              <Typography className="title3">
                Chọn loại hình cho thuê
              </Typography>
              <FormControl sx={{ m: 1, minWidth: 300 }} size="small">
                <Select
                  sx={{ fontSize: "" }}
                  native
                  value={propertyType}
                  onChange={(e) => setpropertyType(e.target.value)}
                  required
                >
                  <option aria-label="None" value="">
                    --Chọn loại chuyên mục--
                  </option>
                  <option value="Nhà trọ, phòng trọ">Nhà trọ, phòng trọ</option>
                  <option value="Nhà nguyên căn">Nhà nguyên căn</option>
                  <option value="Cho thuê căn hộ">Cho thuê căn hộ</option>
                  <option value="Cho thuê căn hộ mini">
                    Cho thuê căn hộ mini
                  </option>
                  <option value="Cho thuê căn hộ dịch vụ">
                    Cho thuê căn hộ dịch vụ
                  </option>
                  <option value="Cho thuê mặt bằng, văn phòng">
                    Cho thuê mặt bằng, văn phòng
                  </option>
                </Select>
              </FormControl>
              <Typography className="title3">Tiêu đề</Typography>
              <TextField
                size="small"
                variant="outlined"
                fullWidth
                value={title}
                onChange={handleTitleChange}
                inputProps={{
                  maxLength: 50,
                }}
                error={!!errorTitle}
                helperText={errorTitle}
                required
              />
              <Typography className="title3">Nội dung miêu tả</Typography>
              <div style={{ width: "100%" }}>
                <div
                  className="quill-content"
                  ref={quillRef}
                  style={{ height: "300px" }}
                  required
                />
                {errorContent && (
                  <div style={{ color: "red", marginTop: "4px" }}>
                    {errorContent}
                  </div>
                )}
              </div>
              <Box
                sx={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  marginTop: "1rem",
                }}
              >
                <TextField
                  id="outlined-basic"
                  label="Thông tin liên hệ"
                  variant="outlined"
                  size="small"
                  value={currentUser?.username || ""}
                  InputProps={{
                    readOnly: true,
                    sx: { bgcolor: "#f0f0f0", width: "30vw" },
                  }}
                />
                <TextField
                  id="outlined-basic"
                  label="Điện thoại"
                  variant="outlined"
                  sx={{ width: "30vw" }}
                  size="small"
                  value={phone}
                  onChange={handleChangePhone}
                  error={!!errorPhone}
                  helperText={errorPhone}
                  type="number"
                  required
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  flexWrap: "nowrap",
                  width: "100%",
                  marginTop: "0.5rem",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "48%",
                    marginBottom: 2,
                  }}
                >
                  <TextField
                    id="outlined-basic"
                    label="Giá cho thuê"
                    variant="outlined"
                    size="small"
                    value={rentalPrice}
                    onChange={handleRentalPriceChange}
                    inputProps={{
                      inputMode: "decimal",
                      pattern: "\\d+(\\.\\d{1,2})?",
                      step: "0.01",
                    }}
                    error={!!errorRental}
                    required
                  />
                  <FormControl
                    variant="outlined"
                    sx={{ minWidth: "120px", marginLeft: 1 }}
                  >
                    <InputLabel id="currency-label"></InputLabel>
                    <Select
                      labelId="currency-label"
                      size="small"
                      id="currency-select"
                      value={typePrice}
                      onChange={handleCurrencyChange}
                    >
                      <MenuItem value="1">Triệu/tháng</MenuItem>
                      <MenuItem value="2">Triệu/m²/tháng</MenuItem>
                    </Select>
                  </FormControl>
                  {errorRental && (
                    <FormHelperText error sx={{ marginLeft: 1 }}>
                      {errorRental}
                    </FormHelperText>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "48%",
                  }}
                >
                  <TextField
                    id="outlined-basic"
                    label="Diện tích"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={area}
                    onChange={handleAreaChange}
                    inputProps={{
                      min: 0,
                      pattern: "\\d+(\\.\\d{1,2})?",
                      step: "0.01",
                    }}
                    error={!!areaError}
                    required
                  />
                  <TextField
                    id="area-field"
                    variant="outlined"
                    size="small"
                    value="m²"
                    InputProps={{ readOnly: true }}
                    sx={{
                      backgroundColor: "#f0f0f0",
                      marginLeft: 1,
                      maxWidth: "80px",
                    }}
                  />
                  {areaError && (
                    <FormHelperText error sx={{ marginLeft: 1 }}>
                      {areaError}
                    </FormHelperText>
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexWrap: "nowrap",
                  width: "100%",
                }}
              >
                <FormControl size="small" sx={{ width: "30%" }}>
                  <InputLabel id="demo-simple-select-helper-label">
                    Đối tượng cho thuê
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-helper-label"
                    label="Đối tượng cho thuê"
                    value={rentalTarget}
                    onChange={(e) => setRentalTarget(e.target.value)}
                  >
                    <MenuItem value="Tất cả">--Tất cả--</MenuItem>
                    <MenuItem value="Nam">Nam</MenuItem>
                    <MenuItem value="Nữ">Nữ</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  id="outlined-basic"
                  label="Số lượng tối đa"
                  variant="outlined"
                  size="small"
                  value={maxOccupants}
                  onChange={handleMaxOccupantsChange}
                  sx={{ width: "30%" }}
                  error={!!maxOccupantsError}
                />
                {maxOccupantsError && (
                  <FormHelperText error sx={{ marginLeft: 1 }}>
                    {maxOccupantsError}
                  </FormHelperText>
                )}

                <TextField
                  id="outlined-basic"
                  label="Link youtube(Nếu có)"
                  variant="outlined"
                  size="small"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  sx={{ width: "30%" }}
                  inputProps={{
                    min: 0,
                  }}
                  error={!!maxOccupantsError}
                />
              </Box>
              <Typography className="title3">Hình ảnh</Typography>
              <p className="custom-fontp">
                Cập nhật hình ảnh chi tiết sẽ giúp tin đăng được chú ý hơn(Tối
                đa 8 ảnh)
              </p>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="upload-button"
                type="file"
                name="images"
                multiple
                onChange={handleImageChange}
              />
              <label htmlFor="upload-button">
                <IconButton
                  component="span"
                  sx={{ width: "20vw", height: "auto" }}
                  required
                >
                  <PhotoCamera
                    sx={{
                      width: "15vw",
                      height: "auto",
                      justifyContent: "center",
                    }}
                  />
                </IconButton>
              </label>
              <div>
                {selectedImages.map((image, index) => (
                  <img
                    key={index}
                    src={image.preview}
                    alt={`uploaded-${index}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      margin: "5px",
                      top: "300px",
                    }}
                  />
                ))}
              </div>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "2vw",
                marginTop: 2,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#4CAF50",
                  width: "14vw",
                  color: "white",
                  fontSize: "16px",
                  "&:hover": {
                    backgroundColor: "#45a049",
                  },
                }}
              >
                Đăng tin
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </div>
  );
};

export default AddPost;
