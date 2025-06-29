import { Pagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { viewPost } from "../../../redux/chatApi";
import {
  deletePost,
  getUserPostsByStateAndVisibility,
} from "../../../redux/postAPI";
import RoomPostManage from "../Post/RoomPostManage";

const ListPost = ({ statusPending, statusUpdate, visibility, token }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const userId = currentUser?._id;
  const [refresh, setRefresh] = useState(false);

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

  const formatPost = (post) => ({
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
    status: post.status,
    visibility: post.visibility,
    images: post.images ? post.images.slice(0, 2) : [],
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const responsePending = await getUserPostsByStateAndVisibility(
          statusPending,
          visibility,
          token,
        );
        const responseUpdate = await getUserPostsByStateAndVisibility(
          statusUpdate,
          visibility,
          token,
        );
        const combinedPosts = [...responsePending.data, ...responseUpdate.data];
        const data = combinedPosts.map(formatPost);
        setPosts(data);
        dispatch(setPosts(data));
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [statusPending, statusUpdate, visibility, token, dispatch, refresh]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDeletePost = async (postId) => {
    try {
      const result = await deletePost(postId, token);
      toast.success("Xoá yêu cầu đăng thành công");
      setRefresh(prev => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  console.log("Current Posts:", currentPosts);

  return (
    <div className="user-posts-list">
      <ToastContainer />
      {currentPosts.length > 0 ? (
        currentPosts.map((post, index) => (
          <RoomPostManage
            key={index}
            post={post}
            onTitleClick={handleTitleClick}
            onEditPost={() => { }}
            onHidePost={() => { }}
            onDeletePost={handleDeletePost}
            onVisiblePost={() => { }}
          />
        ))
      ) : (
        <div className="container-nocontent">
          <Typography>Bạn chưa có tin đăng nào</Typography>
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

export default ListPost;
