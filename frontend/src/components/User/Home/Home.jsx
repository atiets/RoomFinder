import { Email } from "@mui/icons-material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// Thay thế bằng hình ảnh đẹp hơn từ Unsplash
// import supportPic from "../../../assets/images/supportPic.png";
import { searchAndCategorizePosts } from "../../../redux/postAPI";
import SupportChatModal from "../Chatbot";
import CompareArea from "../CompareArea/CompareArea";
import ListPostHome from "../Post/ListPostHome";
import "./Home.css";
import Introduction from "./Introduction";
import Introduction2 from "./Introduction2";
import ListNewsHome from "./ListNewsHome";
import RealEstateSection from "./RealEstateSection";

const Home = () => {
  document.title = "Phòng trọ xinh";
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supportVisible, setSupportVisible] = useState(false);
  const supportRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const [category1Posts, setCategory1Posts] = useState([]);
  const [category2Posts, setCategory2Posts] = useState([]);
  const [openChat, setOpenChat] = useState(false);

  // URL hình ảnh customer support chất lượng cao
  const supportImageUrl = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });

  // Intersection Observer for fade in effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !supportVisible) {
          setSupportVisible(true);
        }
      },
      {
        threshold: 0.3,
        rootMargin: "0px 0px -100px 0px"
      }
    );

    if (supportRef.current) {
      observer.observe(supportRef.current);
    }

    return () => {
      if (supportRef.current) {
        observer.unobserve(supportRef.current);
      }
    };
  }, [supportVisible]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { category1, category2 } =
          await searchAndCategorizePosts({}, token);

        setCategory1Posts(Array.isArray(category1) ? category1.map(formatPost) : []);
        setCategory2Posts(Array.isArray(category2) ? category2.map(formatPost) : []);
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
        <RealEstateSection />
        <div style={{ width: "100%", height: "auto" }}>
          <div style={{ width: "100%", height: "auto" }}>
            <CompareArea />
          </div>
          <ListPostHome
            post={category1Posts}
            title="Cho thuê bất động sản"
            favorite={favorites}
          />
          <ListPostHome
            post={category2Posts}
            title="Mua bán bất động sản"
            favorite={favorites}
          />
          <div style={{ width: "100%", height: "auto" }}>
            <Introduction />
          </div>
          <div style={{ width: "100%", height: "auto" }}>
            <ListNewsHome />
          </div>
          <div style={{ width: "100%", height: "auto" }}>
            <Introduction2 />
          </div>
          <div 
            ref={supportRef}
            className={`support-container ${supportVisible ? 'fade-in' : ''}`}
          >
            {/* Image Section */}
            <div className="support-image">
              <img
                src={supportImageUrl}
                alt="Customer Support - Professional team ready to help"
                className="support-image-img"
                loading="lazy"
                onError={(e) => {
                  // Fallback image nếu link bị lỗi
                  e.target.src = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                }}
              />
            </div>
            {/* Info Section */}
            <div className="support-info">
              <div className="icon">
                <i className="fas fa-headset"></i>
              </div>
              <h3>Hỗ trợ chủ nhà đăng tin</h3>
              <p>
                Nếu bạn cần hỗ trợ đăng tin, vui lòng liên hệ qua các kênh bên dưới. 
                Đội ngũ của chúng tôi sẵn sàng hỗ trợ bạn 24/7!
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