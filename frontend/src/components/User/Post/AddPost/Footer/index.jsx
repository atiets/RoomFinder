// Footer component của bạn đã ổn, chỉ cần đảm bảo hiển thị quota đúng
import { useState } from 'react';
import { Checkbox, FormControlLabel, Box, Typography } from '@mui/material';
import { useUsageManager } from '../../../../../hooks/useUsageManager';
import RoomPostPreviewModal from '../../RoomPostPreviewModal/RoomPostPreviewModal';
import './index.css';

const FooterAddPost = ({ 
    onSubmit, 
    type, 
    editPost, 
    mediaData, 
    contentData, 
    isVip, 
    onVipChange 
}) => {
    const [openPreview, setOpenPreview] = useState(false);
    const { currentUsage, loading } = useUsageManager();

    const handlePreview = () => {
        setOpenPreview(true);
    };

    const handleClose = () => {
        setOpenPreview(false);
    };

    const handleVipToggle = async (event) => {
        const newIsVip = event.target.checked;
        const success = await onVipChange(newIsVip);
        if (!success && newIsVip) {
            // Reset checkbox nếu không thể set VIP
            event.target.checked = false;
        }
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
                    .filter(img => img.preview)
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

    const renderPostTypeInfo = () => {
        if (loading || !currentUsage) {
            return <span>Đang tải...</span>;
        }

        const { currentUsage: usage, planName } = currentUsage;
        const normalQuota = usage?.postsCreated === 999999 ? '∞' : (usage?.postsCreated || 0);
        const vipQuota = usage?.vipPostsUsed === 999999 ? '∞' : (usage?.vipPostsUsed || 0);
        const hasVipQuota = (usage?.vipPostsUsed || 0) > 0;

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isVip}
                            onChange={handleVipToggle}
                            disabled={!hasVipQuota}
                            sx={{
                                color: '#ff9800',
                                '&.Mui-checked': {
                                    color: '#ff9800',
                                },
                            }}
                        />
                    }
                    label=""
                    sx={{ margin: 0 }}
                />
                
                <Box>
                    {isVip ? (
                        <span>
                            Đã chọn <strong style={{ color: '#ff9800' }}>🌟 Đăng tin VIP</strong>
                            <span style={{ color: '#666', fontSize: '0.9em', marginLeft: '8px' }}>
                                (Còn lại: {vipQuota} tin)
                            </span>
                        </span>
                    ) : (
                        <span>
                            Đã chọn <strong>📄 Đăng tin thường</strong>
                            <span style={{ color: '#666', fontSize: '0.9em', marginLeft: '8px' }}>
                                (Còn lại: {normalQuota} tin)
                            </span>
                        </span>
                    )}
                </Box>
            </Box>
        );
    };

    return (
        <>
            <div className="footer-add-post">
                <div className="footer-left">
                    {renderPostTypeInfo()}
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