import { Pagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import { viewPost } from "../../../redux/chatApi";
import { useUsageManager } from "../../../hooks/useUsageManager";
import {
  deletePost,
  getUserPostsByStateAndVisibility,
  togglePostVisibility,
} from "../../../redux/postAPI";
import { setPosts } from "../../../redux/postSlice";
import "./RoomPost.css";
import RoomPostManage from "./RoomPostManage";

const ListPostByStatusVisibility = ({ status, visibility, token }) => {
  const posts = useSelector((state) => state.posts.posts);
  const [loading, setLoading] = useState(true);
  const [localPostQuota, setLocalPostQuota] = useState(null); // ⭐ Thêm state cho gói Free
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const { currentUsage } = useUsageManager(); // ⭐ Thêm hook usage
  const userId = currentUser?._id;
  const [refresh, setRefresh] = useState(false);

  const [editPost, setEditPost] = useState([]);

  // ⭐ HELPER FUNCTIONS
  const getPlanType = () => {
    if (!currentUsage) return "free";
    return currentUsage.planType || "free";
  };

  // ⭐ FETCH USER QUOTA CHO GÓI FREE
  const fetchUserQuota = async () => {
    if (!currentUser?.accessToken) return;

    const planType = getPlanType();
    if (planType !== "free") return;

    try {
      console.log("🔄 Fetching user quota for Free plan...");

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL_API || "http://localhost:8000"}/v1/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (response.data.success) {
        const newQuota = response.data.data.postQuota;
        setLocalPostQuota(newQuota);
        console.log("✅ User quota fetched:", newQuota);
      }
    } catch (error) {
      console.error("Error fetching user quota:", error);
      console.log("📋 Using fallback quota from currentUser");
      setLocalPostQuota(currentUser?.postQuota || 3);
    }
  };

  // ⭐ CHECK CAN POST
  const canPost = () => {
    if (!currentUser) return false;

    const planType = getPlanType();

    if (planType === "free") {
      // Gói Free: ưu tiên localPostQuota (fetch từ API), fallback currentUser.postQuota
      const freeQuota = localPostQuota ?? currentUser?.postQuota ?? 0;
      return freeQuota > 0;
    } else {
      // Gói Pro/Plus: check từ currentUsage
      const quota = currentUsage?.currentUsage?.postsCreated || 0;
      return quota > 0;
    }
  };

  // ⭐ Effect để fetch quota cho gói Free
  useEffect(() => {
    const planType = getPlanType();
    if (planType === "free") {
      fetchUserQuota();
    }
  }, [currentUser?.accessToken, currentUsage?.planType]);

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

  // ⭐ SỬA FUNCTION handleCreatePost THEO LOGIC PLAN TYPE
  const handleCreatePost = () => {
    if (!currentUser) {
      Swal.fire({
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để đăng tin.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Hủy",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm',
          cancelButton: 'custom-swal-cancel'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } else if (!canPost()) {
      // ⭐ CHECK THEO PLAN TYPE
      const planType = getPlanType();
      
      if (planType === "free") {
        Swal.fire({
          title: "Hết lượt đăng tin miễn phí",
          text: "Bạn đã hết lượt đăng tin miễn phí trong tháng. Nâng cấp gói để có thêm lượt đăng tin.",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Nâng cấp gói",
          cancelButtonText: "Hủy",
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm',
            cancelButton: 'custom-swal-cancel'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/subscription");
          }
        });
      } else {
        // Pro/Plus hết quota
        Swal.fire({
          title: "Hết lượt đăng tin",
          text: "Bạn đã hết lượt đăng tin trong gói hiện tại. Vui lòng chờ reset hoặc nâng cấp gói cao hơn.",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Nâng cấp gói",
          cancelButtonText: "Hủy",
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm',
            cancelButton: 'custom-swal-cancel'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/subscription");
          }
        });
      }
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