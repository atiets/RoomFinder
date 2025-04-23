import { Email } from "@mui/icons-material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import supportPic from "../../../assets/images/supportPic.png";
import { searchAndCategorizePosts } from "../../../redux/postAPI";
import ListPostHome from "../Post/ListPostHome";
import "./Home.css";
import Introduction from "./Introduction";
import Introduction2 from "./Introduction2";
import ListNewsHome from "./ListNewsHome";
import CompareArea from "../CompareArea/CompareArea";

const Home = () => {
  document.title = "Phòng trọ xinh";
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const [category1Posts, setTroPosts] = useState([]);
  const [category2Posts, setCanHoPosts] = useState([]);
  const [category3Posts, setVanPhongPosts] = useState([]);
  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = {
          category: [
            "Nhà trọ, phòng trọ",
            "Nhà nguyên căn",
            "Cho thuê căn hộ",
            "Cho thuê căn hộ mini",
            "Cho thuê căn hộ dịch vụ",
            "Cho thuê mặt bằng, văn phòng",
          ],
        };
        const { category1, category2, category3 } =
          await searchAndCategorizePosts(params, token);
        setTroPosts(Array.isArray(category1) ? category1.map(formatPost) : []);
        setCanHoPosts(
          Array.isArray(category2) ? category2.map(formatPost) : [],
        );
        setVanPhongPosts(
          Array.isArray(category3) ? category3.map(formatPost) : [],
        );
      } catch (error) {
        console.error("Lỗi khi lấy bài đăng:", error);
      }
    };

    fetchPosts();
  }, [token]);

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
    images: post.images ? post.images.slice(0, 2) : [],
  });

  useEffect(() => {
    console.log("Current User:", currentUser);
    if (currentUser && currentUser.admin !== undefined) {
      if (currentUser.admin === true) {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    setUser(null);
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axiosJWT.get("/v1/posts/favorites", {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.accessToken) {
      fetchFavorites();
    }
  }, [user]);

  return (
    <div className="home-container">
      <ToastContainer position="top-right" autoClose={5000} />
      <div style={{ width: "100%", height: "auto" }}>
        <ListPostHome
          post={category1Posts}
          title="Nhà trọ, phòng trọ"
          favorite={favorites}
        />
        <div style={{ width: "100%", height: "auto" }}>
          <ListPostHome
            post={category2Posts}
            title="Cho thuê căn hộ, nhà ở"
            favorite={favorites}
          />
        </div>
        <div style={{ width: "100%", height: "auto" }}>
          <ListPostHome
            post={category3Posts}
            title="Văn phòng, mặt bằng"
            favorite={favorites}
          />
          <div style={{ width: "100%", height: "auto" }}>
  <CompareArea />
</div>
          <div style={{ width: "100%", height: "auto" }}>
            <Introduction />
          </div>
          <div style={{ width: "100%", height: "auto" }}>
            <ListNewsHome />
          </div>
          <div style={{ width: "100%", height: "auto" }}>
            <Introduction2 />
          </div>
          <div className="support-container">
            {/* Image Section */}
            <div className="support-image">
              <img
                src={supportPic}
                alt="Support"
                className="support-image-img"
              />
            </div>
            {/* Info Section */}
            <div className="support-info">
              <div className="icon">
                <i className="fas fa-headset"></i>
              </div>
              <h3>Hỗ trợ chủ nhà đăng tin</h3>
              <p>
                Nếu bạn cần hỗ trợ đăng tin, vui lòng liên hệ số điện thoại bên
                dưới:
              </p>
              <div className="contact-buttons">
                <button className="contact-btn phone-btn">
                  <i className="fas fa-phone-alt"></i>{" "}
                  <a href="tel:+840313728397" className="home-link-phone">
                    (+84) 0313-728-397
                  </a>
                </button>
                <button className="contact-btn zalo-btn">
                  <Email style={{ marginRight: "10px" }} /> Gmail:
                  PhongTroXinh@gmail.com
                </button>
              </div>
            </div>
          </div>
          {user ? (
            <>
              <p>Hello, {user}</p>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Home;
