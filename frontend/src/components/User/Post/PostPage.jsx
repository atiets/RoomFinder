import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { searchAndCategorizePosts } from "../../../redux/postAPI";
import { viewPost } from "../../../redux/chatApi";
import Header from "../Header/Header";
import SearchPosts from "../Search/searchPosts";
import ListAllPost from "./ListAllPost";

const PostsPage = () => {
  const location = useLocation();
  const [category1Posts, setCategory1Posts] = useState([]);
  const [category2Posts, setCategory2Posts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const userId = currentUser?._id;
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const {
        category1,
        category2
      } = await searchAndCategorizePosts({}, token);

      // ⭐ Ensure posts có đầy đủ thông tin VIP
      const processedCategory1 = category1.map(post => ({
        ...post,
        isVip: post.isVip || false,
        views: post.views || 0
      }));
      
      const processedCategory2 = category2.map(post => ({
        ...post,
        isVip: post.isVip || false,
        views: post.views || 0
      }));

      setCategory1Posts(processedCategory1);
      setCategory2Posts(processedCategory2);
      
      console.log("📊 Posts loaded:", {
        category1VipCount: processedCategory1.filter(p => p.isVip).length,
        category2VipCount: processedCategory2.filter(p => p.isVip).length,
        totalCategory1: processedCategory1.length,
        totalCategory2: processedCategory2.length
      });
      
    } catch (error) {
      console.error("Lỗi khi lấy bài đăng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  let posts = [];
  if (location.pathname === "/ChoThue") {
    posts = category1Posts;
    document.title = "Cho thuê bất động sản";
  } else if (location.pathname === "/CanBan") {
    posts = category2Posts;
    document.title = "Mua bán bất động sản";
  }

  const handleTitleClick = async (id) => {
    console.log("Navigating to post with ID:", id);
    if (id) {
      try {
        await viewPost(id, userId, token);
        navigate(`/posts/${id}`);
      } catch (error) {
        console.error("Lỗi khi gọi API xem bài đăng:", error);
        navigate(`/posts/${id}`);
      }
    } else {
      console.error("ID bài đăng không hợp lệ");
    }
  };

  return (
    <>
      <Header />
      <SearchPosts />
      <ListAllPost posts={posts} handleTitleClick={handleTitleClick} />
    </>
  );
};

export default PostsPage;