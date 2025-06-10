// components/AddPost/index.js
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2'; // ⭐ Import SweetAlert2
import { FormControlLabel, Checkbox, Box, Alert, Typography } from '@mui/material'; // ⭐ Import Material-UI
import useSocket from '../../../../../hooks/useSocket';
import { useUsageManager } from '../../../../../hooks/useUsageManager'; // ⭐ Import hook
import { createPost } from '../../../../../redux/postAPI';
import AddPostLeft from '../AddPostLeft/index';
import AddPostRight from '../AddPostRight';
import FooterAddPost from '../Footer';
import QuotaDisplay from '../../../FeaturesPayment/QuotaDisplay';
import './index.css';

const AddPost = () => {
    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const accessToken = currentUser?.accessToken;
    const user = currentUser?._id;
    const userName = currentUser?.username;

    const navigate = useNavigate();
    const socket = useSocket(user);
    const location = useLocation();

    // ⭐ THÊM: Usage management
    const { currentUsage, checkUsage, loading: usageLoading } = useUsageManager();

    const [mediaData, setMediaData] = useState(null);
    const [contentData, setContentData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notifications, setNotifications] = useState("");
    const [loading, setLoading] = useState(false);
    const [isVip, setIsVip] = useState(false); 
    const { type = "add", editPost } = location.state || {};

    useEffect(() => {
        if (!socket) return;

        const handleIncomingNotification = (message) => {
            console.log("📥 Notification received:", message);
            setNotifications(message);
        };

        socket.on("notification", handleIncomingNotification);

        return () => {
            socket.off("notification", handleIncomingNotification);
        };
    }, [socket]);

    const handleMediaChange = (data) => {
        setMediaData(data);
    };

    const handleContentChange = useCallback((data) => {
        setContentData(data);
    }, []);

    const handleVipChange = async (event) => {
        const newIsVip = event.target.checked;
        
        if (newIsVip) {
            // Check VIP quota khi user muốn chọn VIP
            const vipCheck = await checkUsage('vip_post');
            if (!vipCheck || !vipCheck.canUse) {
                // checkUsage đã hiển thị alert, không set VIP
                return;
            }
        }
        
        setIsVip(newIsVip);
    };

    const submitPost = async () => {
        const errors = [];

        const {
            selectedCategory,
            addressData,
            transactionType,
            title,
            content,
            propertyCategory,
            apartmentType,
            legalContract,
            area,
            price,
            phone
        } = contentData || {};

        if (!selectedCategory) errors.push("Vui lòng chọn danh mục bất động sản.");
        if (!addressData?.province) errors.push("Vui lòng chọn tỉnh/thành phố.");
        if (!addressData?.district) errors.push("Vui lòng chọn quận/huyện.");
        if (!addressData?.ward) errors.push("Vui lòng chọn phường/xã.");
        if (!addressData?.exactaddress) errors.push("Vui lòng nhập địa chỉ cụ thể.");
        if (!transactionType) errors.push("Vui lòng chọn loại giao dịch.");

        if (!title) {
            errors.push("Vui lòng nhập tiêu đề.");
        } else if (title.length > 100) {
            errors.push("Tiêu đề không được vượt quá 100 ký tự.");
        }

        if (!content) {
            errors.push("Vui lòng nhập nội dung mô tả.");
        } else if (content.length > 500) {
            errors.push("Nội dung mô tả không được vượt quá 500 ký tự.");
        }

        if (
            selectedCategory !== "Căn hộ/chung cư" &&
            selectedCategory !== "phòng trọ" &&
            !propertyCategory
        ) {
            errors.push("Vui lòng chọn loại hình bất động sản.");
        }
        if (selectedCategory === "Căn hộ/chung cư" && !apartmentType) {
            errors.push("Vui lòng chọn loại hình căn hộ.");
        }
        if (
            selectedCategory !== "phòng trọ" &&
            selectedCategory !== "Văn phòng, mặt bằng kinh doanh" &&
            !legalContract
        ) {
            errors.push("Vui lòng chọn tình trạng pháp lý.");
        }
        if (!area || parseFloat(area) <= 0) errors.push("Vui lòng nhập diện tích hợp lệ.");
        if (!price || parseFloat(price) <= 0) errors.push("Vui lòng nhập giá hợp lệ.");
        if (!phone) errors.push("Vui lòng nhập số điện thoại.");

        if (!mediaData?.images || mediaData.images.length < 1) {
            errors.push("Vui lòng chọn ít nhất 1 ảnh.");
        }

        if (mediaData?.video?.file && Array.isArray(mediaData.video?.file)) {
            errors.push("Chỉ được chọn tối đa 1 video.");
        }

        if (errors.length > 0) {
            errors.forEach(err => toast.error(err));
            return;
        }

        const postAction = isVip ? 'vip_post' : 'post';
        const quotaCheck = await checkUsage(postAction);
        if (!quotaCheck || !quotaCheck.canUse) {
            return; // Alert đã được hiển thị trong checkUsage
        }

        setIsSubmitting(true);
        setLoading(true);
        try {
            // Tạo đối tượng dữ liệu cuối cùng
            const finalData = new FormData();

            finalData.append('title', contentData?.title || '');
            finalData.append('content', contentData?.content || '');
            finalData.append('category', contentData?.selectedCategory || '');
            finalData.append('transactionType', contentData?.transactionType || '');
            finalData.append('isVip', isVip); 

            finalData.append('address', JSON.stringify({
                exactaddress: contentData?.addressData?.exactaddress || '',
                province: contentData?.addressData?.province || '',
                district: contentData?.addressData?.district || '',
                ward: contentData?.addressData?.ward || '',
            }));

            finalData.append('projectName', contentData?.projectName || '');
            finalData.append('locationDetails', JSON.stringify({
                apartmentCode: contentData?.apartmentCode || '',
                block: contentData?.block || '',
                floor: contentData?.floor || '',
                subArea: contentData?.subArea || '',
            }));

            finalData.append('propertyDetails', JSON.stringify({
                propertyCategory: contentData?.propertyCategory || '',
                apartmentType: contentData?.apartmentType || '',
                bedroomCount: contentData?.bedroomCount || '',
                bathroomCount: contentData?.bathroomCount || '',
                floorCount: contentData?.floorCount || 0,
                balconyDirection: contentData?.balconyDirection || '',
                mainDoorDirection: contentData?.mainDoorDirection || '',
                landDirection: contentData?.lanDirection || '',
            }));

            finalData.append('features', JSON.stringify([
                ...(contentData?.selectedFeaturesOfHouse || []),
                ...(contentData?.selectedFeaturesOfLand || []),
            ]));

            finalData.append('legalContract', contentData?.legalContract || '');
            finalData.append('furnitureStatus', contentData?.furnitureStatus || '');
            finalData.append('area', parseFloat(contentData?.area || 0));
            finalData.append('areaUse', parseFloat(contentData?.areaUse || 0));
            finalData.append('typeArea', contentData?.typeArea || "m²");
            finalData.append('dimensions', JSON.stringify({
                width: parseFloat(contentData?.width || 0),
                length: parseFloat(contentData?.length || 0),
            }));

            finalData.append('price', parseFloat(contentData?.price || 0));
            finalData.append('deposit', parseFloat(contentData?.deposit || 0));
            finalData.append('userType', contentData?.userType || 'Cá nhân');

            const oldImages = [];
            const newImages = [];

            if (mediaData?.images && mediaData.images.length > 0) {
                mediaData.images.forEach((image) => {
                    if (image?.file instanceof File) {
                        newImages.push(image.file);
                    } else if (typeof image?.preview === 'string' && image.preview.startsWith('http')) {
                        oldImages.push(image.preview);
                    }
                });
            }

            let oldVideo = null;
            let newVideo = null;

            if (mediaData?.video) {
                if (mediaData.video.file instanceof File) {
                    newVideo = mediaData.video.file;
                } else if (typeof mediaData.video.preview === 'string' && mediaData.video.preview.startsWith('http')) {
                    oldVideo = mediaData.video.preview;
                }
            }
            
            oldImages.forEach((url) => {
                finalData.append('images', url);
            });

            newImages.forEach((file) => {
                finalData.append('images', file);
            });

            if (oldVideo) {
                finalData.append('videoUrl', oldVideo);
            }
            if (newVideo) {
                finalData.append('videoUrl', newVideo);
            }

            finalData.append('contactInfo', JSON.stringify({
                user: user,
                username: userName,
                phoneNumber: contentData?.phone,
            }));

            const response = await createPost(finalData, accessToken);
            
            const successMessage = isVip 
                ? "Đăng tin VIP thành công! Tin của bạn sẽ được ưu tiên hiển thị."
                : "Đăng tin thành công! Vui lòng chờ admin duyệt.";
            
            toast.success(successMessage);
            navigate("/");
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Đăng tin thất bại. Vui lòng thử lại sau.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const previewPost = () => {
        const previewData = {
            ...mediaData,
            ...contentData,
            isVip, 
        };
        console.log('Preview Data:', previewData);
    };

    if (loading || usageLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    const renderVipOption = () => {
        if (!currentUsage) return null;

        const { currentUsage: usage, planName } = currentUsage;
        const hasVipQuota = usage.vipPostsUsed > 0;

        return (
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isVip}
                                onChange={handleVipChange}
                                disabled={!hasVipQuota}
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="body1" fontWeight="bold">
                                    🌟 Đăng tin VIP
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Ưu tiên hiển thị, giao diện đặc biệt, tăng 300-500% lượt xem
                                </Typography>
                            </Box>
                        }
                    />
                    
                    <Box textAlign="right">
                        <Typography variant="body2" color={hasVipQuota ? "success.main" : "error.main"}>
                            Còn lại: {usage.vipPostsUsed === 999999 ? '∞' : usage.vipPostsUsed}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {planName}
                        </Typography>
                    </Box>
                </Box>
                
                {!hasVipQuota && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                        Bạn đã hết quota tin VIP. Nâng cấp gói để sử dụng tính năng này.
                    </Alert>
                )}
            </Box>
        );
    };

    return (
        <div className="container-add-post">
            <ToastContainer />
            <QuotaDisplay />
            <div className="container-add-post-content">
                <AddPostLeft onMediaChange={handleMediaChange} type={type} editPost={editPost} />
                <div>
                    <AddPostRight onContentChange={handleContentChange} isSubmitting={isSubmitting} type={type} editPost={editPost} />
                    {renderVipOption()}
                </div>
            </div>
            <div className="container-add-post-footer">
                <FooterAddPost
                    onSubmit={submitPost}
                    onPreview={previewPost}
                    type={type} 
                    editPost={editPost}
                    mediaData={mediaData}
                    contentData={contentData}
                />
            </div>
        </div>
    );
};

export default AddPost;