import axios from "axios";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAxios } from "../../../../createInstance";
import { setSelectedMenu } from "../../../../redux/menuSlice";
import { createNews } from "../../../../redux/newsAPI";
import "./NewsForm.css";

const NewsForm = () => {
  document.title = "Thêm tin tức";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [errorContent, setErrorContent] = useState("");
  const [errorAuthor, setErrorAuthor] = useState("");
  const [errorNull, setErrorNull] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const accessToken = currentUser?.accessToken;
  let axiosJWT = axios.create({
    baseURL: "https://befindrentalrooms-production.up.railway.app",
    withCredentials: true,
  });
  axiosJWT = createAxios(currentUser, dispatch);

  // Validate title
  const validateTitle = (value) => {
    if (!value || value.trim() === "") {
      return "Tiêu đề không được để trống!";
    }
    return "";
  };

  // Validate description
  const validateDescription = (value) => {
    if (!value || value.trim() === "" || value.length < 10) {
      return "Mô tả phải có ít nhất 10 ký tự!";
    }
    return "";
  };

  // Validate content
  const validateContent = (value) => {
    if (!value || value.trim() === "" || value.length < 200) {
      return "Nội dung phải có ít nhất 200 ký tự!";
    }
    return "";
  };

  // Validate author
  const validateAuthor = (value) => {
    if (!value || value.trim() === "") {
      return "Tác giả không được để trống!";
    }
    return "";
  };

  // Handle change for each field
  const handleChangeTitle = (e) => {
    const value = e.target.value;
    setTitle(value);
    setErrorTitle(validateTitle(value));
  };

  const handleChangeDescription = (e) => {
    const value = e.target.value;
    setDescription(value);
    setErrorDescription(validateDescription(value));
  };

  const handleChangeContent = (e) => {
    const value = e.target.value;
    setContent(value);
    setErrorContent(validateContent(value));
  };

  const handleChangeAuthor = (e) => {
    const value = e.target.value;
    setAuthor(value);
    setErrorAuthor(validateAuthor(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !content || !author) {
      setErrorNull("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("content", content);
    formData.append("author", author);

    if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    try {
      await dispatch(createNews(formData, accessToken, axiosJWT));
      // setErrorNull("");

      // Hiển thị thông báo thành công bằng toast
      toast.success("Tin tức đã được thêm thành công!");
      dispatch(setSelectedMenu("newsList"));
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      }
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
      const content = quill.root.innerHTML; // Lấy nội dung từ Quill
      setContent(content);
      setErrorContent(validateContent(content)); // Kiểm tra lỗi nội dung
    });
  }, []);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUrl(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  return (
    <div className="news-form-container">
      <div className="form-content">
        <div className="news-details-form">
          <h2>Chi tiết tin tức</h2>
          <div className="cover-upload">
            <h2 className="cover-title">Thêm trang bìa</h2>
            <div className="conver-image">
              <div className="image-preview">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" />
                ) : (
                  <p className="image-waiting">
                    <img
                      src={require("../../../../assets/images/home.png")}
                      alt="Preview"
                    />
                  </p>
                )}
              </div>
              <label htmlFor="image" className="cover-placeholder">
                <span>Thêm trang bìa</span>
                <input
                  type="file"
                  id="image"
                  onChange={handleImageChange}
                  className="cover-url-input"
                />
              </label>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            {errorNull && <p className="error-message">{errorNull}</p>}
            <div className="form-group">
              <label>Tiêu đề:</label>
              <input
                type="text"
                placeholder="Tiêu đề"
                value={title}
                onChange={handleChangeTitle}
                required
              />
              {errorTitle && <p className="error-message">{errorTitle}</p>}
            </div>
            <div className="form-group">
              <label>Mô tả:</label>
              <textarea
                placeholder="Mô tả ngắn"
                value={description}
                onChange={handleChangeDescription}
                required
              />
              {errorDescription && (
                <p className="error-message">{errorDescription}</p>
              )}
            </div>
            <div className="form-group">
              <label>Tác giả:</label>
              <input
                type="text"
                placeholder="Tác giả"
                value={author}
                onChange={handleChangeAuthor}
                required
              />
              {errorAuthor && <p className="error-message">{errorAuthor}</p>}
            </div>
            <div className="form-group">
              <label>Nội dung:</label>
              <div
                className="quill-content"
                ref={quillRef}
                style={{ height: "300px" }}
              />
              {errorContent && <p className="error-message">{errorContent}</p>}
            </div>
            <div className="news-btn">
              <button type="submit" className="submit-button">
                Thêm tin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsForm;
