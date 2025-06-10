import { useState } from 'react';
import RoomPostPreviewModal from '../../RoomPostPreviewModal/RoomPostPreviewModal';
import './index.css';

const FooterAddPost = ({ onSubmit, type, editPost, mediaData, contentData }) => {
    const [openPreview, setOpenPreview] = useState(false);

    const handlePreview = () => {
        setOpenPreview(true);
    };

    const handleClose = () => {
        setOpenPreview(false);
    };

    const formatPostData = () => {
        if (type === "edit" && editPost) {
            return {
                _id: editPost._id,
                title: editPost.title || "",
                price: Number(editPost.price) || 0,
                area: Number(editPost.area) || 0,
                typeArea: editPost.typeArea || "",
                images: editPost.images || [],
                address: {
                    district: editPost.district || editPost.address?.district || "",
                    province: editPost.province || editPost.address?.province || "",
                },
            };
        } else {
            const imagePreviews = Array.isArray(mediaData?.images)
                ? mediaData.images
                    .filter(img => img.preview) // chỉ lấy những ảnh có preview
                    .map(img => img.preview)
                : [];

            return {
                _id: "preview-temp-id",
                title: contentData?.title || "",
                price: Number(contentData?.price) || 0,
                area: Number(contentData?.area) || 0,
                typeArea: contentData?.typeArea || "",
                images: imagePreviews,
                address: {
                    district: contentData?.district || "",
                    province: contentData?.province || "",
                },
            };
        }
    };

    return (
        <>
            <div className="footer-add-post">
                <div className="footer-left">
                    <span>Đã chọn <strong>Đăng tin thường (Miễn phí)</strong></span>
                </div>
                <div className="footer-right">
                    <button className="btn-preview" onClick={handlePreview}>Xem trước</button>
                    <button className="btn-submit" onClick={onSubmit}>
                        {type === "edit" ? "Chỉnh sửa tin" : "Đăng tin"}
                    </button>
                </div>
            </div>
            <RoomPostPreviewModal
                open={openPreview}
                onClose={handleClose}
                post={formatPostData()}
                onToggleFavorite={() => { }}
                isFavorite={false}
                onTitleClick={() => { }}
            />
        </>
    );
};

export default FooterAddPost;
