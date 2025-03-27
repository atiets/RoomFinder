import React, { useState } from "react";
import RoomPostManage from "../Post/RoomPostManage";

const viewedPostsData = [
    {
        _id: "1",
        title: "Căn hộ cao cấp Quận 1",
        images: ["https://res.cloudinary.com/dcpxl1u8g/image/upload/v1742888071/tsoqw6k2deh9bw06zsw8.jpg"],
        rentalPrice: "10",
        typePrice: "1",
        address: { district: "Quận 1", province: "TP.HCM" },
        area: 80,
    },
    {
        _id: "2",
        title: "Phòng trọ giá rẻ Gò Vấp",
        images: ["https://res.cloudinary.com/dcpxl1u8g/image/upload/v1742888071/tsoqw6k2deh9bw06zsw8.jpg"],
        rentalPrice: "3",
        typePrice: "2",
        address: { district: "Gò Vấp", province: "TP.HCM" },
        area: 20,
    },
    {
        _id: "3",
        title: "Nhà nguyên căn Quận 7",
        images: ["https://res.cloudinary.com/dcpxl1u8g/image/upload/v1742888071/tsoqw6k2deh9bw06zsw8.jpg"],
        rentalPrice: "15",
        typePrice: "1",
        address: { district: "Quận 7", province: "TP.HCM" },
        area: 120,
    },
];

const ViewedPost = () => {
    const [favoritePosts, setFavoritePosts] = useState({});

    const handleTitleClick = (postId) => {
        console.log(`Xem chi tiết bài viết ${postId}`);
    };

    const handleToggleFavorite = (postId, isFav) => {
        setFavoritePosts((prev) => ({ ...prev, [postId]: isFav }));
    };

    return (
        <div>
            <h2>Lịch sử xem bài viết</h2>
            {viewedPostsData.map((post) => (
                <RoomPostManage
                    key={post._id}
                    post={post}
                    onTitleClick={handleTitleClick}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={!!favoritePosts[post._id]}
                />
            ))}
        </div>
    );
};

export default ViewedPost;
