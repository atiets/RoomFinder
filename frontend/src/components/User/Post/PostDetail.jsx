import { Favorite, FavoriteBorder } from "@mui/icons-material";
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import DoorFrontOutlinedIcon from '@mui/icons-material/DoorFrontOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import HouseOutlinedIcon from "@mui/icons-material/HouseOutlined";
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import OutlinedFlagOutlinedIcon from "@mui/icons-material/OutlinedFlagOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import WcOutlinedIcon from '@mui/icons-material/WcOutlined';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import Swal from "sweetalert2";
import { viewPost } from "../../../redux/chatApi";
import { getPostDetail, useFavoriteToggle } from "../../../redux/postAPI";
import AdminHeader from "../../Admin/AdminHeader/AdminHeader";
import Header from "../Header/Header";
import PostMap from "../MapIntegration/PostMap";
import AddReviewForm from "../Review/ReviewForm/ReviewForm";
import ReviewsList from "../Review/ReviewList/ReviewsList";
import AlertSubscription from "./ModalAddAlertSubscription";
import ModalAppointment from "./ModalAppointment";
import ComplaintModal from "./ModalComplaint";
import ContactInfoCard from "./PostContactCard";
import "./PostDetail.css";
import ShareMenu from "./ShareMenu";
import SuggestionPosts from "./SuggestionPosts";

const PostDetail = ({ onToggleFavorite }) => {
  const navigate = useNavigate();
  const URL_POST = `${process.env.REACT_APP_BASE_URL_FRONTEND}/posts/`;

  document.title = "Chi tiết bài đăng";
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const userId = user?._id;
  const { toggleFavorite } = useFavoriteToggle(user);
  const { reviews } = useSelector((state) => state.reviews);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [showModalAppointment, setShowModalAppointment] = useState(false);
  const [openModalComplaint, setOpenModalComplaint] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const thumbnailWrapperRef = useRef(null);
  const [refreshData, setRefreshData] = useState(false);

  let axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL_API,
  });

  const [currentScroll, setCurrentScroll] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const THUMBNAIL_WIDTH = 110;
  const GAP = 8;
  const STEP = THUMBNAIL_WIDTH + GAP;

  useEffect(() => {
    const wrapper = thumbnailWrapperRef.current;
    if (wrapper) {
      setMaxScroll(wrapper.scrollWidth - wrapper.clientWidth);
    }
  }, [post?.images]);

  const scrollThumbnailsLeft = () => {
    const wrapper = thumbnailWrapperRef.current;
    if (!wrapper) return;
    let newScroll = wrapper.scrollLeft - STEP;
    if (newScroll < 0) newScroll = 0;
    wrapper.scrollTo({ left: newScroll, behavior: "smooth" });
    setCurrentScroll(newScroll);
  };

  const scrollThumbnailsRight = () => {
    const wrapper = thumbnailWrapperRef.current;
    if (!wrapper) return;
    let newScroll = wrapper.scrollLeft + STEP;
    if (newScroll > maxScroll) newScroll = maxScroll;
    wrapper.scrollTo({ left: newScroll, behavior: "smooth" });
    setCurrentScroll(newScroll);
  };

  const showLeftArrow = currentScroll > 0;
  const showRightArrow = currentScroll < maxScroll;

  const getHiddenPhoneNumber = (number) => {
    if (!number || number.length < 3) return number;
    return number.slice(0, -3) + "***";
  };

  const handleChat = (post) => {
    navigate(`/chat`, {
      state: {
        postId: post._id,
        title: post.title,
        image: post.images?.[0],
        price: post.rentalPrice,
        typePrice: post.typePrice,
        contactInfo: post.contactInfo?.user,
      },
    });
  };

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await getPostDetail(id);
        console.log("Response Data:", response);
        setPost(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết bài đăng:", error);
      }
    };

    if (id) {
      fetchPostDetail();
    }
  }, [id]);


  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axiosJWT.get("/v1/posts/favorites", {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
        setFavorites(response.data.favorites);
        setFavoriteCount(response.data.favorites.length);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
      }
    };

    if (user?.accessToken) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    console.log("Dữ liệu reviews hiện tại:", reviews);
  }, [reviews]);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % post.images.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + post.images.length) % post.images.length
    );
  };

  const handleToggleFavorite = async () => {
    const isFavorite = favorites.some((fav) => fav._id === id);

    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để thêm bài đăng vào danh sách yêu thích.",
        confirmButtonText: "Đăng nhập",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          Navigate("/login");
        }
      });
      return;
    }

    try {
      await toggleFavorite(id, isFavorite);
      if (isFavorite) {
        setFavorites(favorites.filter((fav) => fav._id !== id));
        setFavoriteCount((prev) => prev - 1);
      } else {
        setFavorites([...favorites, { _id: id }]);
        setFavoriteCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái yêu thích:", error);
    }
  };

  if (!post)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  const isFavorite = favorites.some((fav) => fav._id === id);

  const formatPriceToText = (price) => {
    if (typeof price !== "number" || isNaN(price)) {
      return "Giá không hợp lệ";
    }

    if (price >= 1_000_000_000) {
      const billions = Math.floor(price / 1_000_000_000);
      return `${billions} Tỷ VNĐ`;
    }

    if (price >= 1_000_000) {
      const millions = Math.floor(price / 1_000_000);
      const rest = Math.floor((price % 1_000_000) / 1_000);
      return rest > 0
        ? `${millions} triệu ${rest} nghìn VND`
        : `${millions} triệu VND`;
    }

    return `${price.toLocaleString()} VND`;
  };
  const tableRows = [];

  if (post.category) {
    tableRows.push(
      <TableRow key="category">
        <TableCell className="title-cell">
          <HouseOutlinedIcon className="style-icon" /> Loại hình cho thuê
        </TableCell>
        <TableCell>{post.category}</TableCell>
      </TableRow>
    );
  }

  if (post.maxOccupants > 0) {
    tableRows.push(
      <TableRow key="maxOccupants">
        <TableCell className="title-cell">
          <Diversity3OutlinedIcon className="style-icon" /> Số người tối đa
        </TableCell>
        <TableCell>{post.maxOccupants}</TableCell>
      </TableRow>
    );
  }

  if (post.rentalTarget) {
    tableRows.push(
      <TableRow key="rentalTarget">
        <TableCell className="title-cell">
          <PeopleOutlineOutlinedIcon className="style-icon" /> Đối tượng cho thuê
        </TableCell>
        <TableCell>{post.rentalTarget}</TableCell>
      </TableRow>
    );
  }

  if (post.area > 0) {
    tableRows.push(
      <TableRow key="area">
        <TableCell className="title-cell">
          <MapOutlinedIcon className="style-icon" /> Diện tích
        </TableCell>
        <TableCell>{post.area} {post.typeArea}</TableCell>
      </TableRow>
    );
  }

  if (post.areaUse > 0) {
    tableRows.push(
      <TableRow key="areaUse">
        <TableCell className="title-cell">
          <MapOutlinedIcon className="style-icon" /> Diện tích sử dụng
        </TableCell>
        <TableCell>{post.areaUse} m²</TableCell>
      </TableRow>
    );
  }

  if (post.deposit) {
    tableRows.push(
      <TableRow key="deposit">
        <TableCell className="title-cell">
          <MonetizationOnOutlinedIcon className="style-icon" /> Tiền cọc
        </TableCell>
        <TableCell>{post.deposit} VNĐ</TableCell>
      </TableRow>
    );
  }

  if (post.features?.length > 0) {
    tableRows.push(
      <TableRow key="features">
        <TableCell className="title-cell">
          <CheckCircleOutlineOutlinedIcon className="style-icon" /> Đặc điểm
        </TableCell>
        <TableCell>{post.features.join(', ')}</TableCell>
      </TableRow>
    );
  }

  if (post.furnitureStatus) {
    tableRows.push(
      <TableRow key="furnitureStatus">
        <TableCell className="title-cell">
          <CheckroomOutlinedIcon className="style-icon" /> Nội thất
        </TableCell>
        <TableCell>{post.furnitureStatus}</TableCell>
      </TableRow>
    );
  }

  if (post.legalContract) {
    tableRows.push(
      <TableRow key="legalContract">
        <TableCell className="title-cell">
          <GavelOutlinedIcon className="style-icon" /> Giấy tờ pháp lý
        </TableCell>
        <TableCell>{post.legalContract}</TableCell>
      </TableRow>
    );
  }

  if (post.locationDetails?.subArea) {
    tableRows.push(
      <TableRow key="subArea">
        <TableCell className="title-cell">
          <LocationOnOutlinedIcon className="style-icon" /> Vị trí cụ thể
        </TableCell>
        <TableCell>{post.locationDetails.subArea}</TableCell>
      </TableRow>
    );
  }

  if (post.locationDetails?.projectName) {
    tableRows.push(
      <TableRow key="projectName">
        <TableCell className="title-cell">
          <ApartmentOutlinedIcon className="style-icon" /> Dự án
        </TableCell>
        <TableCell>{post.locationDetails.projectName}</TableCell>
      </TableRow>
    );
  }

  if (post.propertyDetails?.apartmentType) {
    tableRows.push(
      <TableRow key="apartmentType">
        <TableCell className="title-cell">
          <ApartmentOutlinedIcon className="style-icon" /> Loại hình căn hộ/nhà ở
        </TableCell>
        <TableCell>{post.propertyDetails.apartmentType}</TableCell>
      </TableRow>
    );
  }

  if (post.propertyDetails?.balconyDirection) {
    tableRows.push(
      <TableRow key="balconyDirection">
        <TableCell className="title-cell">
          <MeetingRoomOutlinedIcon className="style-icon" /> Hướng ban công
        </TableCell>
        <TableCell>{post.propertyDetails.balconyDirection}</TableCell>
      </TableRow>
    );
  }

  if (post.propertyDetails?.bathroomCount) {
    tableRows.push(
      <TableRow key="bathroomCount">
        <TableCell className="title-cell">
          <WcOutlinedIcon className="style-icon" /> Số phòng tắm
        </TableCell>
        <TableCell>{post.propertyDetails.bathroomCount}</TableCell>
      </TableRow>
    );
  }

  if (post.propertyDetails?.bedroomCount) {
    tableRows.push(
      <TableRow key="bedroomCount">
        <TableCell className="title-cell">
          <HotelOutlinedIcon className="style-icon" /> Số phòng ngủ
        </TableCell>
        <TableCell>{post.propertyDetails.bedroomCount}</TableCell>
      </TableRow>
    );
  }

  if (post.propertyDetails?.floorCount > 0) {
    tableRows.push(
      <TableRow key="floorCount">
        <TableCell className="title-cell">
          <LayersOutlinedIcon className="style-icon" /> Tổng số tầng
        </TableCell>
        <TableCell>{post.propertyDetails.floorCount}</TableCell>
      </TableRow>
    );
  }

  if (post.propertyDetails?.mainDoorDirection) {
    tableRows.push(
      <TableRow key="mainDoorDirection">
        <TableCell className="title-cell">
          <DoorFrontOutlinedIcon className="style-icon" /> Hướng cửa chính
        </TableCell>
        <TableCell>{post.propertyDetails.mainDoorDirection}</TableCell>
      </TableRow>
    );
  }

  if (post.propertyDetails?.propertyCategory) {
    tableRows.push(
      <TableRow key="propertyCategory">
        <TableCell className="title-cell">
          <CategoryOutlinedIcon className="style-icon" /> Đặc điểm nhà/đất
        </TableCell>
        <TableCell>{post.propertyDetails.propertyCategory}</TableCell>
      </TableRow>
    );
  }

  // Tạo visibleRows theo showAll
  const visibleRows = showAll ? tableRows : tableRows.slice(0, 4);

  const handleTitleClick = async (id) => {
    if (!id) {
      console.error("ID bài đăng không hợp lệ");
      return;
    }
    try {
      await viewPost(id, userId, accessToken);
      navigate(`/posts/${id}`);
      setRefreshData(prev => !prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Lỗi khi gọi API xem bài đăng:", error);
      navigate(`/posts/${id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="post-detail-container">
      <ToastContainer position="top-right" autoClose={5000} />
      {user && (user.admin === "true" || user.admin === true) ? (
        <AdminHeader />
      ) : (
        <Header />
      )}
      <div className="post-detail-container-post">
        <div className="post-detail-container-left">
          {post.images && post.images.length > 0 && (
            <div className="image-gallery">
              <div className="main-image-wrapper">
                <img
                  src={post.images[currentIndex]}
                  alt={`Post image ${currentIndex + 1}`}
                  className="post-detail-image"
                />
                <div className="top-right-buttons">
                  <Box className="favorite-container">
                    <div className="circle-button" onClick={handleToggleFavorite}>
                      {isFavorite ? (
                        <Favorite style={{ color: "red" }} />
                      ) : (
                        <FavoriteBorder style={{ color: "#000" }} />
                      )}
                    </div>
                    <Typography className="favorite-count">{favoriteCount}</Typography>
                  </Box>
                  <div className="circle-button">
                    <div className="share-container">
                      <ShareMenu url={`${URL_POST}${post._id}`} title={post.title} />
                    </div>
                  </div>
                  <div className="circle-button" onClick={() => setOpenModalComplaint(true)}>
                    <OutlinedFlagOutlinedIcon style={{ color: "#000" }} />
                  </div>
                </div>
                <button className="prev-btn" onClick={prevImage}>←</button>
                <button className="next-btn" onClick={nextImage}>→</button>
              </div>
              <div className="thumbnail-carousel-container">
                {showLeftArrow && (
                  <button className="arrow-button left" onClick={scrollThumbnailsLeft}>←</button>
                )}
                <div className="thumbnail-wrapper" ref={thumbnailWrapperRef}>
                  {post?.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className={`thumbnail-image ${index === currentIndex ? "active" : ""}`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>

                {showRightArrow && (
                  <button className="arrow-button right" onClick={scrollThumbnailsRight}>→</button>
                )}
              </div>
            </div>
          )}
          <Box className="container-content-detail">
            <Box className="container-left">
              <div className="content-detail-title">
                <Box className="container-cost">
                  <Typography className="post-title">{post.title}</Typography>
                  <Typography className="post-detail-price">
                    {post.price !== undefined
                      ? formatPriceToText(post.price)
                      : "Không có giá"}
                  </Typography>
                </Box>
                <Box className="view-count-container">
                  <Typography className="view-count">
                    👀 {post.views} lượt xem
                  </Typography>
                </Box>
              </div>
              <Button startIcon={<RoomOutlinedIcon />} className="address-detail">
                {post.address?.exactaddress || "Địa chỉ chưa có"}{" "}
                {post.address?.ward} {post.address?.district}{" "}
                {post.address?.province}
              </Button><br />
              <text className="post-content-title">Mô tả chi tiết</text>
              <div
                className="post-content"
                dangerouslySetInnerHTML={{
                  __html: post?.content?.replace(/\n/g, '<br />')
                }}
              />

              <TableContainer component={Paper} className="container-table">
                <Table className="table-category">
                  <TableBody>
                    {visibleRows}
                  </TableBody>
                </Table>

                {tableRows.length > 4 && (
                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <Button variant="outlined" className="post-detail-btn-table" onClick={() => setShowAll(!showAll)}>
                      {showAll ? 'Ẩn bớt' : 'Xem thêm'}
                    </Button>
                  </div>
                )}
              </TableContainer>
            </Box>
          </Box>
        </div>
        <div className="post-detail-container-right">
          <ContactInfoCard
            post={post}
            getHiddenPhoneNumber={getHiddenPhoneNumber}
            handleChat={handleChat}
          />
          <div className="post-detail-container-right-btn">
            <AlertSubscription post = {post}/>
          </div>
        </div>
      </div>
      <div className="suggestion-posts-wrapper">
        <SuggestionPosts
          postId={id}
          token={accessToken}
          onTitleClick={handleTitleClick}
        />
      </div>
      <div className="post-detail-container-comment">
        <AddReviewForm />
        <ReviewsList postId={id} />
      </div>
      {showModalAppointment && (
        <ModalAppointment
          visible={showModalAppointment}
          onClose={() => setShowModalAppointment(false)}
          post={post}
        />
      )}
      <ComplaintModal
        isOpen={openModalComplaint}
        handleClose={() => setOpenModalComplaint(false)}
        postID={post._id}
      />
      {post.latitude && post.longitude && (
        <PostMap
          latitude={post.latitude}
          longitude={post.longitude}
          title={post.title}
          address={post.address}
        />
      )}
    </div>
  );
};

export default PostDetail;
