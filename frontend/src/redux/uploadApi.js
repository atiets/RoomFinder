import axios from "axios";

const BASE_URL =  `${process.env.REACT_APP_BASE_URL_API}/v1/upload/upload-image`;

export const uploadImages = async (images, token) => {
    try {
        const formData = new FormData();
        images.forEach(image => {
            formData.append('images', image); // Thêm từng ảnh vào formData
        });

        const response = await axios.post(BASE_URL, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.success) {
            return response.data.imageUrls; // Trả về mảng URL của các ảnh đã upload
        } else {
            throw new Error('Upload ảnh thất bại');
        }
    } catch (error) {
        console.error('Lỗi khi upload ảnh:', error);
        throw error; // Ném lỗi để xử lý ngoài
    }
};


