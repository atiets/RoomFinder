import axios from "axios";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import Swal from "sweetalert2";
import arrowsIcon from "../../../assets/images/arrowIcon.png";
import { viewPost } from "../../../redux/chatApi";
import { useFavoriteToggle } from "../../../redux/postAPI";
import "./ListPostHome.css";
import RoomPost from "./RoomPost";

const ListPostHome = ({ post = [], title, favorite }) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = React.useState([]);
  const [change, setChange] = React.useState(false);
  const user = useSelector((state) => state.auth.login.currentUser);
  const { toggleFavorite } = useFavoriteToggle(user);
  const userId = user?._id;
  const token = user?.accessToken;
  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axiosJWT.get("/v1/posts/favorites", {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
        await setFavorites(response.data.favorites);
        console.log("Favorites:", response.data.favorites);
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error);
      } finally {
      }
    };

    if (user?.accessToken) {
      fetchFavorites();
    }
  }, [user]);

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

  const handleToggleFavorite = (postId, isFavorite) => {
    if (!user) {
      console.log("Swal được gọi");
      Swal.fire({
        icon: "warning",
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để thêm bài đăng vào danh sách yêu thích.",
        confirmButtonText: "Đăng nhập",
        showCancelButton: true,
      }).then((result) => {
        console.log("Swal result:", result);
        if (result.isConfirmed) {
          Swal.close();
          console.log("Chuyển hướng đến trang đăng nhập");
          navigate("/login");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          console.log("Đã hủy");
          setTimeout(() => Swal.close(), 0);
        }
      });
      return;
    }

    toggleFavorite(postId, isFavorite)
      .then(() => {
        setFavorites(
          isFavorite
            ? favorites.filter((fav) => fav._id !== postId)
            : [...favorites, { _id: postId }],
        );
        Swal.close();
      })
      .catch((error) => console.error("Lỗi khi bật/tắt yêu thích:", error));
  };

  const sliderSettings = {
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  const isPostArray = Array.isArray(post);

  return (
    <div className="approved-posts-slider">
      <div className="approved-post-in-home-title">{title}</div>
      {isPostArray ? (
        <Slider {...sliderSettings}>
          {post.slice(0, 5).map((postItem, index) => (
            <div key={index} className="approved-posts-item">
              <RoomPost
                post={postItem}
                onTitleClick={() => handleTitleClick(postItem.id)}
                isFavorite={favorites.some((fav) => fav._id === postItem.id)}
                onToggleFavorite={() =>
                  handleToggleFavorite(
                    postItem.id,
                    favorites.some((fav) => fav._id === postItem.id),
                  )
                }
              />
              {index === Math.min(post.length, 5) - 1 && (
                <button
                  className="see-more-button"
                  onClick={() => {
                    if (title === "Mua bán bất động sản") {
                      navigate("/CanBan");
                    } else if (title === "Cho thuê bất động sản") {
                      navigate("/ChoThue");
                    }
                  }}
                >
                  See More
                  <img
                    src={arrowsIcon}
                    alt="arrows"
                    className="style-icon-btn-see-more"
                  />
                </button>
              )}
            </div>
          ))}
        </Slider>
      ) : (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default ListPostHome;
