import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { setSelectedMenu } from "../../../redux/menuSlice";
import { getPostDetail, updatePost } from "../../../redux/postAPI";
import "./UpdatePost.css";

const UpdatePost = ({ postId }) => {
  document.title = "Cập nhật bài đăng";
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rentalPrice, setRentalPrice] = useState("");
  const [area, setArea] = useState("");
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const accessToken = currentUser?.accessToken;
  const [typePrice, setTypePrice] = useState("1");
  const [areaError, setAreaError] = useState("");
  const [errorNull, setErrorNull] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current && content) {
      // Kiểm tra quillRef và content
      const quill = new Quill(quillRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["image", "video"],
            [{ font: [] }, { size: ["small", "medium", "large", "huge"] }],
            [{ align: [] }],
            ["link", "blockquote", "code-block"],
            ["clean"],
          ],
        },
      });

      // Cập nhật nội dung khi có sự thay đổi trong editor
      quill.on("text-change", () => {
        setContent(quill.root.innerHTML);
      });

      // Đặt nội dung ban đầu cho editor nếu có sẵn
      quill.root.innerHTML = content;

      return () => {
        quillRef.current = null;
      };
    }
  }, [content]);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        console.log("Fetching post detail with ID:", postId);
        const postData = await getPostDetail(postId);
        setPost(postData.data);
      } catch (error) {
        setError("Lỗi khi lấy chi tiết bài đăng");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostDetail();
    }
  }, [postId]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setRentalPrice(post.rentalPrice);
      setArea(post.area);
    }
  }, [post]);

  const handleUpdatePostData = async () => {
    const postData = {
      title,
      content,
      rentalPrice,
      typePrice,
      area,
    };
    if (!title || !content || !rentalPrice || !area) {
      setErrorNull("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    try {
      setLoading(true);
      const updatedPost = await updatePost(postId, postData, accessToken);
      toast.success("Cập nhật bài đăng thành công");
      dispatch(setSelectedMenu("postList"));
    } catch (error) {
      toast.error("Cập nhật bài đăng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (e) => {
    setTypePrice(e.target.value);
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

  const handleRentalPriceChange = (e) => {
    const value = e.target.value;
    const regex = /^[0-9]*\.?[0-9]*$/;

    if (value === "" || regex.test(value)) {
      setRentalPrice(value);
      setError("");
    } else {
      setError("Giá cho thuê phải là số thực không âm");
    }
  };

  if (!post) {
    return <div>Đang tải...</div>;
  }

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="container-updatepost">
      <ToastContainer position="top-right" autoClose={5000} />
      <Typography className="update-post-title">Chỉnh sửa bài đăng</Typography>
      {errorNull && <p className="error-message">{errorNull}</p>}
      <div>
        <TextField
          label="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
        />
      </div>

      <Typography className="title3">Nội dung miêu tả</Typography>
      <div ref={quillRef} style={{ height: "300px" }} required />
      <div className="update-post-container-area-price">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "48%",
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
            required
            error={!!error}
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
          {error && (
            <FormHelperText error sx={{ marginLeft: 1 }}>
              {error}
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
            sx={{ backgroundColor: "#f0f0f0", marginLeft: 1, maxWidth: "80px" }}
          />
          {areaError && (
            <FormHelperText error sx={{ marginLeft: 1 }}>
              {areaError}
            </FormHelperText>
          )}
        </Box>
      </div>
      <div>
        <Button
          className="manage-update-post-btn-confirm"
          onClick={handleUpdatePostData}
        >
          Cập nhật
        </Button>
      </div>
    </div>
  );
};

export default UpdatePost;
