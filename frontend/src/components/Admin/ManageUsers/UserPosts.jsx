import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUserPostsByUserId } from "../../../redux/postAPI";
import RoomPostUser from "./RoomPostUser";

const UserPosts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const token = currentUser?.accessToken;
  const { userId } = useParams();
  const navigate = useNavigate();

  const handleTitleClick = (id) => {
    navigate(`/posts/${id}`);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getUserPostsByUserId(token, userId);
        if (Array.isArray(data)) {
          const formattedPosts = data.map((post) => ({
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
            images: post.images ? post.images.slice(0, 2) : [],
          }));
          setPosts(formattedPosts);
        } else {
          console.error("Dữ liệu trả về không phải là mảng.");
        }
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      }
    };

    fetchPosts();
  }, [token, userId]);

  return (
    <div style={{ minHeight: "310px" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {posts.map((post) => (
          <RoomPostUser
            key={post.id}
            post={post}
            onTitleClick={handleTitleClick}
          />
        ))}
      </ul>
    </div>
  );
};

export default UserPosts;
