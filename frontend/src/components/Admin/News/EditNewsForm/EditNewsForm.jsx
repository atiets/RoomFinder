import axios from "axios";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setSelectedMenu } from "../../../../redux/menuSlice";
import "./EditNewsForm.css";

const EditNewsForm = () => {
  document.title = "Chỉnh sửa tin tức";
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const dispatch = useDispatch();
  let axiosJWT = axios.create({
    baseURL: "https://befindrentalrooms-production.up.railway.app",
  });

  // Lấy thông tin tin tức hiện tại
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const response = await axiosJWT.get(`/v1/news/${id}`);
        const newsData = response.data;
        setTitle(newsData.title);
        setDescription(newsData.description);
        setContent(newsData.content); // Gán nội dung cho content state
        setAuthor(newsData.author);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin tin tức:", err);
        toast.error("Không thể tải thông tin tin tức.");
      }
    };
    fetchNewsDetail();
  }, [id]);

  // Khởi tạo Quill Editor
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
  }, [content]); // Chạy lại khi content thay đổi

  // Xử lý khi cập nhật tin tức
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosJWT.put(`/v1/news/${id}`, {
        title,
        description,
        content,
        author,
      });
      navigate(`/manage-news/${id}`);
      toast.success("Cập nhật tin tức thành công!");
      dispatch(setSelectedMenu("newsList"));
    } catch (err) {
      console.error("Lỗi khi cập nhật tin tức:", err);
      toast.error("Không thể cập nhật tin tức.");
    }
  };

  const handleCancel = () => {
    navigate(`/manage-news/${id}`);
    // dispatch(setSelectedMenu("newsList"));
  };

  return (
    <div className="news-management">
      <ToastContainer position="top-right" autoClose={5000} />
      {/*<Sidebar/>*/}
      <div className="content">
        <div className="news-form-container">
          <div className="form-content">
            <div className="news-details-form">
              <h2>Chỉnh sửa tin tức</h2>
              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>Tiêu đề:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả:</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tác giả:</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nội dung:</label>
                  <div className="quill-editor-container">
                    <div ref={quillRef} style={{ height: "300px" }} />
                  </div>
                </div>
                <div className="news-btn">
                  <button type="submit" className="submit-button-edit-news">
                    Cập nhật
                  </button>
                  <button
                    type="button"
                    className="cancel-button-edit-news"
                    onClick={handleCancel}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNewsForm;
