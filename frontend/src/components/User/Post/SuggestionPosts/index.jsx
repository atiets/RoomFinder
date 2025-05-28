import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useEffect, useState } from "react";
import { fetchSuggestedPosts } from "../../../../redux/postAPI";
import RoomPost from "../RoomPost";
import "./index.css";

const SuggestionPosts = ({ postId, token, onTitleClick }) => {
    const [suggestedPosts, setSuggestedPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPostSuggestion = async (pageNumber) => {
        try {
            const result = await fetchSuggestedPosts(postId, token, pageNumber);
            setSuggestedPosts(result?.posts);
            setTotalPages(result?.totalPages);
        } catch (err) {
            console.error("Lỗi khi gọi API gợi ý bài đăng:", err);
        }
    };

    useEffect(() => {
        fetchPostSuggestion(page);
    }, [postId, page]);

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    return (
        <div className="post-detail-container-suggettion-posts">
            <div className="suggested-posts-list">
                {Array.isArray(suggestedPosts) && suggestedPosts.map((post) => (
                    <RoomPost
                        key={post._id}
                        post={post}
                        onTitleClick={onTitleClick}
                        isFavorite={false}
                    />
                ))}
            </div>
            <button
                className="next-page-button"
                onClick={handleNextPage}
                disabled={page >= totalPages}
            >
                <ArrowForwardIosIcon />
            </button>

        </div>
    );
};

export default SuggestionPosts;
