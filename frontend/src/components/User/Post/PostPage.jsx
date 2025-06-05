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
        category2,
        category3,
        category4,
        category5,
      } = await searchAndCategorizePosts({}, token);

      setCategory1Posts(category1);
      setCategory2Posts(category2);
      setCategory3Posts(category3);
      setCategory4Posts(category4);
      setCategory5Posts(category5);
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
  if (location.pathname === "/posts") {
    posts = category1Posts;
    document.title = "Cho thuê phòng trọ";
  } else if (location.pathname === "/CanHoPost") {
    posts = category2Posts;
    document.title = "Cho thuê căn hộ/chung cư";
  } else if (location.pathname === "/VanPhongPost") {
    posts = category3Posts;
    document.title = "Cho thuê văn phòng, mặt bằng kinh doanh";
  } else if (location.pathname === "/NhaO") {
    posts = category4Posts;
    document.title = "Cho thuê nhà ở";
  } else if (location.pathname === "/Dat") {
    posts = category5Posts;
    document.title = "Cho thuê đất";
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
