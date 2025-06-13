import { useState } from 'react';
import { Checkbox, FormControlLabel, Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
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
    const currentUser = useSelector((state) => state.auth.login.currentUser);

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
        if (loading) {
            return <span>Đang tải...</span>;
        }

        // ===== SAFE CHECK: NẾU KHÔNG CÓ CURRENTUSER THÌ RETURN EARLY =====
        if (!currentUser) {
            return <span>Vui lòng đăng nhập để đăng tin</span>;
        }

        // ===== KIỂM TRA GÓI PRO/PLUS TRƯỚC =====
        if (currentUsage && currentUsage.planType && (currentUsage.planType === 'pro' || currentUsage.planType === 'plus')) {
            const { currentUsage: usage, planType, planName } = currentUsage;
            
            // Xác định quota dựa trên planType
            let normalQuota, vipQuota, hasVipQuota;

            if (planType === 'plus') {
                // Gói Plus: cả tin thường và tin VIP đều unlimited
                normalQuota = '∞';
                vipQuota = '∞';
                hasVipQuota = true;
            } else if (planType === 'pro') {
                // Gói Pro: tin thường có giới hạn, tin VIP có giới hạn (5)
                normalQuota = usage?.postsCreated || 0;
                vipQuota = usage?.vipPostsUsed || 0;
                hasVipQuota = vipQuota > 0;
            }

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
        }

        // ===== NẾU KHÔNG PHẢI PRO/PLUS THÌ LÀ FREE =====
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={false}
                            disabled={true} // Gói Free không được đăng tin VIP
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
                    <span>
                        Đã chọn <strong>📄 Đăng tin thường miễn phí</strong>
                    </span>
                    <Typography variant="caption" sx={{ display: 'block', color: '#757575' }}>
                        Gói Free: tối đa 3 tin/tháng
                    </Typography>
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