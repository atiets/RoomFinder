import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useSocket from '../../../../../hooks/useSocket';
import { createPost } from '../../../../../redux/postAPI';
import AddPostLeft from '../AddPostLeft/index';
import AddPostRight from '../AddPostRight';
import FooterAddPost from '../Footer';
import './index.css';

const AddPost = () => {
    const [mediaData, setMediaData] = useState(null);
    const [contentData, setContentData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const accessToken = currentUser?.accessToken;
    const user = currentUser?._id;
    const userName = currentUser?.username;
    const [notifications, setNotifications] = useState("");
    
    const socket = useSocket(user);
    
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


    console.log("Notifications:", notifications);

    const handleMediaChange = (data) => {
        setMediaData(data);
    };

    const handleContentChange = useCallback((data) => {
        setContentData(data);
    }, []);
    // console.log('Media Data:', mediaData);

    const submitPost = async () => {
        setIsSubmitting(true);
        try {
            // Tạo đối tượng dữ liệu cuối cùng
            const finalData = new FormData();

            finalData.append('title', contentData?.title || '');
            finalData.append('content', contentData?.content || '');
            finalData.append('category', contentData?.selectedCategory || '');
            finalData.append('transactionType', contentData?.transactionType || '');

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
            finalData.append('typeArea', contentData?.typeArea || 'm²');
            finalData.append('dimensions', JSON.stringify({
                width: parseFloat(contentData?.width || 0),
                length: parseFloat(contentData?.length || 0),
            }));

            finalData.append('price', parseFloat(contentData?.price || 0));
            finalData.append('deposit', parseFloat(contentData?.deposit || 0));
            finalData.append('userType', contentData?.userType || 'Cá nhân');

            // Thêm hình ảnh
            if (mediaData?.images && mediaData?.images.length > 0) {
                mediaData?.images.forEach((image) => {
                    finalData.append('images', image.file); // Giả sử hình ảnh được chọn qua input file
                });
            }

            if (mediaData?.video?.file) {
                finalData.append('videoUrl', mediaData.video.file); // Gửi file thật, không phải preview
            }

            // Thông tin liên hệ
            finalData.append('contactInfo', JSON.stringify({
                user: user,
                username: userName,
                phoneNumber: contentData?.phone,
            }));

            console.log('Final Data:', finalData);

            // Gửi yêu cầu POST với dữ liệu FormData qua hàm createPost
            const response = await createPost(finalData, accessToken); // Giả sử createPost nhận finalData và accessToken

            // Hiển thị thông báo hoặc redirect
            console.log('Bài đăng đã được tạo thành công:', response);
        } catch (error) {
            console.error("Đăng bài thất bại:", error);
            // Hiển thị thông báo lỗi
        } finally {
            setIsSubmitting(false); // Xóa dấu hiệu đang submit
        }
    };


    const previewPost = () => {
        const previewData = {
            ...mediaData,
            ...contentData,
        };
        console.log('Preview Data:', previewData);
    };
    return (
        <div className="container-add-post">
            <div className="container-add-post-content">
                <AddPostLeft onMediaChange={handleMediaChange} />
                <AddPostRight onContentChange={handleContentChange} isSubmitting={isSubmitting} />
            </div>
            <div className="container-add-post-footer">
                <FooterAddPost onSubmit={submitPost} onPreview={previewPost} />
            </div>
        </div>
    );
};

export default AddPost;