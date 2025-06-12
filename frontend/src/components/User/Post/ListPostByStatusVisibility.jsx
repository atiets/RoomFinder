import { Pagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { ToastContainer, toast } from "react-toastify";
import { viewPost } from "../../../redux/chatApi";
import {
  deletePost,
  getUserPostsByStateAndVisibility,
  togglePostVisibility,
} from "../../../redux/postAPI"; // Hàm API mới
import { setPosts } from "../../../redux/postSlice";
import "./RoomPost.css";
import RoomPostManage from "./RoomPostManage";

const ListPostByStatusVisibility = ({ status, visibility, token }) => {
  const posts = useSelector((state) => state.posts.posts);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const userId = currentUser?._id;
  const [refresh, setRefresh] = useState(false);

  const [editPost, setEditPost] = useState([]);

  const handleTitleClick = async (id) => {
    if (!id) {
      console.error("ID bài đăng không hợp lệ");
      return;
    }
    try {
      await viewPost(id, userId, token);
      navigate(`/posts/${id}`);
    } catch (error) {
      console.error("Lỗi khi gọi API xem bài đăng:", error);
      navigate(`/posts/${id}`);
    }
  };

  const handleCreatePost = () => {
    if (currentUser.postQuota <= 0) {
      alert("Bạn đã hết lượt đăng tin trong tháng. Vui lòng nâng cấp gói hoặc chờ đến tháng sau.");
    } else {
      navigate("/AddPost");
    }
  };

  const handleHidePost = async (postId) => {
    try {
      setLoading(true);
      const response = await togglePostVisibility(postId, token);
      toast.success("Cập nhật thành công!");
      setRefresh(prev => !prev);
    } catch (error) {
      console.error("Lỗi khi ẩn bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisiblePost = async (postId) => {
    try {
      setLoading(true);
      const response = await togglePostVisibility(postId, token);
      toast.success("Cập nhật thành công!");
      setRefresh(prev => !prev);
    } catch (error) {
      console.error("Lỗi khi ẩn bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      setLoading(true);
      const result = await deletePost(postId, token);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        const response = await getUserPostsByStateAndVisibility(
          status,
          visibility,
          token,
        );
        const data = response.data;
        setEditPost(data);
        console.log("User posts:", data);
        const formattedPosts = data.map((post) => ({
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
          images: post.images ? post.images.slice(0, 2) : [],
          visibility: post.visibility || "",
          status: post.status || "",
          daysRemaining: post.daysRemaining || 0,
          hoursRemaining: post.hoursRemaining || 0,
        }));
        dispatch(setPosts(formattedPosts));
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [status, visibility, token, refresh]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="user-posts-list">
      <ToastContainer/>
      {currentPosts.length > 0 ? (
        currentPosts.map((post, index) => (
          <RoomPostManage
            key={index}
            post={post}
            onTitleClick={handleTitleClick}
            onHidePost={handleHidePost}
            onDeletePost={handleDeletePost}
            onVisiblePost={handleVisiblePost}
            editPost={editPost}
          />
        ))
      ) : (
        <div className="container-nocontent">
          <Typography>Bạn chưa có tin đăng nào</Typography>
          <button
            onClick={handleCreatePost}
            style={{ marginTop: "20px" }}
            className="manage-post-add-post"
          >
            Đăng tin ngay
          </button>
        </div>
      )}
      <div className="approved-post-list-container-pagination">
        <Pagination
          count={Math.ceil(posts.length / postsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ListPostByStatusVisibility;
