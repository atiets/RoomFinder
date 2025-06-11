import { Pagination } from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getViewedPosts, viewPost } from "../../../redux/chatApi";
import RoomPostManage from "../Post/RoomPostManage";
import './ViewedPost.css';

const ViewedPost = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.login.currentUser);
    const token = user?.accessToken;
    const userID = user?._id;
    const [favoritePosts, setFavoritePosts] = useState({});
    const [viewedPost, setViewPost] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 3;

    const handleTitleClick = async (postId) => {
        if (!postId) {
            console.error("ID bài đăng không hợp lệ");
            return;
        }
        try {
            await viewPost(postId, userID, token);
            navigate(`/posts/${postId}`);
        } catch (error) {
            console.error("Lỗi khi gọi API xem bài đăng:", error);
            navigate(`/posts/${postId}`);
        }
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

    // ⭐ Sort viewed posts với VIP lên đầu
    const sortedViewedPosts = useMemo(() => {
        return [...viewedPost].sort((a, b) => {
            // VIP posts lên đầu
            if (a.isVip && !b.isVip) return -1;
            if (!a.isVip && b.isVip) return 1;
            
            // Cùng loại thì sort theo thời gian xem gần nhất
            return new Date(b.viewedAt || b.updatedAt || 0) - new Date(a.viewedAt || a.updatedAt || 0);
        });
    }, [viewedPost]);

    const paginatedPosts = sortedViewedPosts.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // ⭐ Count VIP posts
    const vipCount = viewedPost.filter(post => post.isVip).length;

    return (
        <div className="viewed-post-container">
            <div className="viewed-post-header">
                <h2 className="viewed-post-title">Lịch sử xem bài viết</h2>
                
                {/* ⭐ Stats info */}
                <div className="viewed-post-stats">
                    <span className="total-count">
                        📊 Tổng: <strong>{viewedPost.length}</strong> bài
                    </span>
                    {vipCount > 0 && (
                        <span className="vip-count">
                            🌟 VIP: <strong>{vipCount}</strong> bài
                        </span>
                    )}
                </div>
            </div>

            {/* ⭐ VIP notice */}
            {vipCount > 0 && (
                <div className="vip-notice">
                    <span>🌟 Các bài viết VIP được hiển thị ưu tiên đầu tiên</span>
                </div>
            )}

            <div className="viewed-posts-list">
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
            </div>

            {viewedPost.length > itemsPerPage && (
                <div className="pagination-wrapper">
                    <Pagination
                        count={Math.ceil(sortedViewedPosts.length / itemsPerPage)}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color="primary"
                    />
                </div>
            )}

            {viewedPost.length === 0 && (
                <div className="no-viewed-posts">
                    <p>Bạn chưa xem bài viết nào.</p>
                </div>
            )}
        </div>
    );
};

export default ViewedPost;