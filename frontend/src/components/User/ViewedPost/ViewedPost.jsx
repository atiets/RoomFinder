import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getViewedPosts } from "../../../redux/chatApi";
import RoomPostManage from "../Post/RoomPostManage";
import './ViewedPost.css';

const ViewedPost = () => {
    const user = useSelector((state) => state.auth.login.currentUser);
    const token = user?.accessToken;
    const userID = user?._id;
    const [favoritePosts, setFavoritePosts] = useState({});
    const [viewedPost, setViewPost] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 3;

    const handleTitleClick = (postId) => {
        console.log(`Xem chi tiết bài viết ${postId}`);
    };

    const handleToggleFavorite = (postId, isFav) => {
        setFavoritePosts((prev) => ({ ...prev, [postId]: isFav }));
    };

    const fetchViewedPosts = async () => {
        const response = await getViewedPosts(userID, token);
        setViewPost(response?.data?.viewedPosts || []);
        console.log("Viewed Posts Response:", response?.data);
    };

    useEffect(() => {
        fetchViewedPosts();
    }, [userID]);

    const paginatedPosts = viewedPost.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="viewed-post-container">
            <h2 className="viewed-post-title">Lịch sử xem bài viết</h2>
            {paginatedPosts.map((post) => (
                <RoomPostManage
                    key={post._id}
                    post={post}
                    onTitleClick={handleTitleClick}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={!!favoritePosts[post._id]}
                    type="history"
                />
            ))}

            {viewedPost.length > itemsPerPage && (
                <div className="pagination-wrapper">
                    <Pagination
                        count={Math.ceil(viewedPost.length / itemsPerPage)}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color="primary"
                    />
                </div>
            )}
        </div>
    );
};

export default ViewedPost;
