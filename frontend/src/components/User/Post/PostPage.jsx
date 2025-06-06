import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { searchAndCategorizePosts } from "../../../redux/postAPI";
import Header from "../Header/Header";
import SearchPosts from "../Search/searchPosts";
import ListAllPost from "./ListAllPost";

const PostsPage = () => {
  const location = useLocation();
  const [category1Posts, setCategory1Posts] = useState([]);
  const [category2Posts, setCategory2Posts] = useState([]);
  const [category3Posts, setCategory3Posts] = useState([]);
  const [category4Posts, setCategory4Posts] = useState([]);
  const [category5Posts, setCategory5Posts] = useState([]);

  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const {
        category1,
        category2
      } = await searchAndCategorizePosts({}, token);

      setCategory1Posts(category1);
      setCategory2Posts(category2);
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

  const handleTitleClick = (id) => {
    console.log("Navigating to post with ID:", id);
    if (id) {
      navigate(`/posts/${id}`);
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
