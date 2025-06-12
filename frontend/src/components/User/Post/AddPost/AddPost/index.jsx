// components/AddPost/index.js
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import useSocket from '../../../../../hooks/useSocket';
import { useUsageManager } from '../../../../../hooks/useUsageManager';
import { createPost } from '../../../../../redux/postAPI';
import AddPostLeft from '../AddPostLeft/index';
import AddPostRight from '../AddPostRight';
import FooterAddPost from '../Footer';
import './index.css';

const AddPost = () => {
    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const accessToken = currentUser?.accessToken;
    const user = currentUser?._id;
    const userName = currentUser?.username;

    const navigate = useNavigate();
    const socket = useSocket(user);
    const location = useLocation();

    const { currentUsage, checkUsage, updateUsage, refreshUsage, loading: usageLoading } = useUsageManager();

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
        return () => socket.off("notification", handleIncomingNotification);
    }, [socket]);

    const handleMediaChange = (data) => {
        setMediaData(data);
    };

    const handleContentChange = useCallback((data) => {
        setContentData(data);
    }, []);

    const handleVipChange = async (newIsVip) => {
        if (newIsVip) {
            const vipCheck = await checkUsage('vip_post');
            if (!vipCheck || !vipCheck.canUse) {
                return false;
            }
        }

        setIsVip(newIsVip);
        return true;
    };

    const submitPost = async () => {
        console.log("🔍 Submit Post - contentData:", contentData);
        console.log("🔍 Submit Post - mediaData:", mediaData);

        const errors = [];
        const {
            selectedCategory, addressData, transactionType, title, content,
            propertyCategory, apartmentType, legalContract, area, price, phone,
            // ⭐ Thêm các trường có thể thiếu
            userType, projectName, bedroomCount, bathroomCount, floorCount,
            balconyDirection, mainDoorDirection, landDirection,
            selectedFeaturesOfHouse, selectedFeaturesOfLand,
            furnitureStatus, areaUse, typeArea, width, length, deposit
        } = contentData || {};

        // ⭐ Enhanced validation
        if (!selectedCategory) errors.push("Vui lòng chọn danh mục bất động sản.");
        if (!addressData?.province) errors.push("Vui lòng chọn tỉnh/thành phố.");
        if (!addressData?.district) errors.push("Vui lòng chọn quận/huyện.");
        if (!addressData?.ward) errors.push("Vui lòng chọn phường/xã.");
        if (!addressData?.exactaddress) errors.push("Vui lòng nhập địa chỉ cụ thể.");
        if (!transactionType) errors.push("Vui lòng chọn loại giao dịch.");
        if (!title) errors.push("Vui lòng nhập tiêu đề.");
        else if (title.length > 100) errors.push("Tiêu đề không được vượt quá 100 ký tự.");
        if (!content) errors.push("Vui lòng nhập nội dung mô tả.");
        else if (content.length > 500) errors.push("Nội dung mô tả không được vượt quá 500 ký tự.");
        if (!area || parseFloat(area) <= 0) errors.push("Vui lòng nhập diện tích hợp lệ.");
        if (!price || parseFloat(price) <= 0) errors.push("Vui lòng nhập giá hợp lệ.");
        if (!phone) errors.push("Vui lòng nhập số điện thoại.");
        if (!mediaData?.images || mediaData.images.length < 1) errors.push("Vui lòng chọn ít nhất 1 ảnh.");

        // ⭐ Validation cho apartment type nếu là căn hộ
        if (selectedCategory === "Căn hộ/chung cư" && !apartmentType) {
            errors.push("Vui lòng chọn loại hình căn hộ.");
        }

        if (errors.length > 0) {
            errors.forEach(err => toast.error(err));
            return;
        }

        const postAction = isVip ? 'vip_post' : 'post';
        const quotaCheck = await checkUsage(postAction);
        if (!quotaCheck || !quotaCheck.canUse) return;

        setIsSubmitting(true);
        setLoading(true);

        try {
            const finalData = new FormData();

            // ⭐ Basic info - Đảm bảo đầy đủ
            finalData.append('title', title || '');
            finalData.append('content', content || '');
            finalData.append('category', selectedCategory || '');
            finalData.append('transactionType', transactionType || '');
            finalData.append('isVip', isVip);
            finalData.append('userType', userType || 'Cá nhân'); // ⭐ Bắt buộc

            // ⭐ Address - Bắt buộc
            finalData.append('address', JSON.stringify({
                exactaddress: addressData?.exactaddress || '',
                province: addressData?.province || '',
                district: addressData?.district || '',
                ward: addressData?.ward || '',
            }));

            // ⭐ Project info
            finalData.append('projectName', projectName || '');
            finalData.append('locationDetails', JSON.stringify({
                apartmentCode: contentData?.apartmentCode || '',
                block: contentData?.block || '',
                floor: contentData?.floor || '',
                subArea: contentData?.subArea || '',
            }));

            // ⭐ Property details - Bao gồm tất cả fields
            finalData.append('propertyDetails', JSON.stringify({
                propertyCategory: propertyCategory || '',
                apartmentType: apartmentType || '',
                bedroomCount: bedroomCount || '',
                bathroomCount: bathroomCount || '',
                floorCount: floorCount || 0,
                balconyDirection: balconyDirection || '',
                mainDoorDirection: mainDoorDirection || '',
                landDirection: landDirection || '',
            }));

            // ⭐ Features
            finalData.append('features', JSON.stringify([
                ...(selectedFeaturesOfHouse || []),
                ...(selectedFeaturesOfLand || []),
            ]));

            // ⭐ Legal and furniture
            finalData.append('legalContract', legalContract || '');
            finalData.append('furnitureStatus', furnitureStatus || '');

            // ⭐ Area info
            finalData.append('area', parseFloat(area || 0));
            finalData.append('areaUse', parseFloat(areaUse || 0));
            finalData.append('typeArea', typeArea || "m²");

            // ⭐ Dimensions
            finalData.append('dimensions', JSON.stringify({
                width: parseFloat(width || 0),
                length: parseFloat(length || 0),
            }));

            // ⭐ Price info
            finalData.append('price', parseFloat((price || '0').replace(/,/g, '')));
            finalData.append('deposit', parseFloat((deposit || '0').replace(/,/g, '')));

            // ⭐ Handle media
            if (mediaData?.images) {
                mediaData.images.forEach((image) => {
                    if (image?.file instanceof File) {
                        finalData.append('images', image.file);
                    } else if (typeof image?.preview === 'string' && image.preview.startsWith('http')) {
                        finalData.append('images', image.preview);
                    }
                });
            }

            if (mediaData?.video?.file instanceof File) {
                finalData.append('videoUrl', mediaData.video.file);
            }

            // ⭐ Contact info - Bắt buộc
            finalData.append('contactInfo', JSON.stringify({
                user: user,
                username: userName,
                phoneNumber: phone || '',
            }));

            // ⭐ Debug: Log all FormData entries
            console.log("🔍 FormData entries:");
            for (let pair of finalData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // ⭐ Tạo post
            await createPost(finalData, accessToken);

            // ⭐ Update usage sau khi tạo post thành công
            console.log(`🔄 Post created successfully, updating usage for action: ${postAction}`);
            const updateResult = await updateUsage(postAction);

            if (updateResult) {
                console.log(`✅ Usage updated successfully:`, updateResult);
            } else {
                console.log(`⚠️ Failed to update usage, but post was created`);
            }

            const successMessage = isVip
                ? "🌟 Đăng tin VIP thành công!"
                : "📝 Đăng tin thành công!";

            toast.success(successMessage);

            setTimeout(() => {
                navigate("/");
            }, 1500);

        } catch (error) {
            console.error('Error creating post:', error);
            const errorMessage = error?.response?.data?.message || "Đăng tin thất bại!";
            toast.error(errorMessage);
            console.log("🔍 Full error response:", error?.response);
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const previewPost = () => {
        const previewData = { ...mediaData, ...contentData, isVip };
        console.log('Preview Data:', previewData);
    };

    if (loading || usageLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container-add-post">
            <ToastContainer />
            <div className="container-add-post-content">
                <AddPostLeft onMediaChange={handleMediaChange} type={type} editPost={editPost} />
                <div>
                    <AddPostRight onContentChange={handleContentChange} isSubmitting={isSubmitting} type={type} editPost={editPost} />
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
                    isVip={isVip}
                    onVipChange={handleVipChange}
                    currentUsage={currentUsage}
                />
            </div>
        </div>
    );
};

export default AddPost;