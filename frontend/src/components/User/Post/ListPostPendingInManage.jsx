import { Pagination, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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

  const handleTitleClick = (id) => {
    console.log("Navigating to post with ID:", id);
    if (id) {
      navigate(`/posts/${id}`);
    } else {
      console.error("ID bài đăng không hợp lệ");
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
    rentalPrice: post.rentalPrice,
    typePrice: post.typePrice,
    area: post.area,
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
  }, [statusPending, statusUpdate, visibility, token, dispatch]);

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
      console.log("Post deleted:", result);
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
      {currentPosts.length > 0 ? (
        currentPosts.map((post, index) => (
          <RoomPostManage
            key={index}
            post={post}
            onTitleClick={handleTitleClick}
            onEditPost={() => {}}
            onHidePost={() => {}}
            onDeletePost={handleDeletePost}
            onVisiblePost={() => {}}
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
