import { Pagination, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllPosts } from "../../../redux/postAPI";
import "./ManagePosts.css";
import RoomPostManage from "./RoomPostManage";

const ManagePosts = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;

  const navigate = useNavigate();

  const handleTitleClick = (id) => {
    navigate(`/posts/${id}`);
  };

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const data = await getAllPosts(token, currentPage, 5);
        if (Array.isArray(data.posts)) {
          const formattedPosts = data.posts.map((post) => ({
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
            area: post.area,
            status: post.status,
            images: post.images ? post.images.slice(0, 2) : [],
          }));

          setAllPosts(formattedPosts);
          setTotalItems(data.totalItems);
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);
        } else {
          console.error("Dữ liệu trả về không phải là mảng.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ API:", error);
      }
    };

    fetchAllPosts();
  }, [token, currentPage]);

  console.log("Current page:", allPosts);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="all-posts-list">
      {allPosts.length > 0 ? (
        allPosts.map((post, index) => (
          <RoomPostManage
            key={index}
            post={post}
            onTitleClick={handleTitleClick}
          />
        ))
      ) : (
        <div className="container-nocontent">
          <Typography>Chưa có tin đăng nào</Typography>
        </div>
      )}
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        size="medium"
        siblingCount={1}
        boundaryCount={1}
      />
    </div>
  );
};

export default ManagePosts;
