import { Email } from "@mui/icons-material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import supportPic from "../../../assets/images/supportPic.png";
import { searchAndCategorizePosts } from "../../../redux/postAPI";
import SupportChatModal from "../Chatbot";
import CompareArea from "../CompareArea/CompareArea";
import ListPostHome from "../Post/ListPostHome";
import "./Home.css";
import Introduction from "./Introduction";
import Introduction2 from "./Introduction2";
import ListNewsHome from "./ListNewsHome";

const Home = () => {
  document.title = "Phòng trọ xinh";
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const [category1Posts, setCategory1Posts] = useState([]); // phòng trọ
  const [category2Posts, setCategory2Posts] = useState([]); // căn hộ
  const [category3Posts, setCategory3Posts] = useState([]); // văn phòng
  const [category4Posts, setCategory4Posts] = useState([]); // nhà ở
  const [category5Posts, setCategory5Posts] = useState([]); // đất
  const [openChat, setOpenChat] = useState(false);

  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { category1, category2, category3, category4, category5 } =
          await searchAndCategorizePosts({}, token);

        setCategory1Posts(Array.isArray(category1) ? category1.map(formatPost) : []);
        setCategory2Posts(Array.isArray(category2) ? category2.map(formatPost) : []);
        setCategory3Posts(Array.isArray(category3) ? category3.map(formatPost) : []);
        setCategory4Posts(Array.isArray(category4) ? category4.map(formatPost) : []);
        setCategory5Posts(Array.isArray(category5) ? category5.map(formatPost) : []);
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
    price: post.price,
    area: post.area,
    typeArea: post.typeArea,
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
        <ListPostHome
          post={category2Posts}
          title="Cho thuê căn hộ, chung cư"
          favorite={favorites}
        />
        <ListPostHome
          post={category4Posts}
          title="Nhà ở"
          favorite={favorites}
        />
        <ListPostHome
          post={category5Posts}
          title="Đất"
          favorite={favorites}
        />
        <ListPostHome
          post={category3Posts}
          title="Văn phòng, mặt bằng kinh doanh"
          favorite={favorites}
        />
        <div style={{ width: "100%", height: "auto" }}>
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
        {!currentUser?.admin && (
          <div
            className="support-float"
            onClick={() => setOpenChat(true)}
          >
            <ChatBubbleOutlineIcon className="support-float-icon" />
            <span className="support-float-text">Nhấp vào đây để được hỗ trợ</span>
          </div>
        )}

        {/* Modal Chat */}
        {openChat && (
          <div className="support-modal-chat">
            <SupportChatModal open={openChat} onClose={() => setOpenChat(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
