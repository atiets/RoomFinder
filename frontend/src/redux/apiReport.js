import axios from "axios";

const API_URL = `${process.env.REACT_APP_BASE_URL_API}/v1/report/`;

export const sendComplaint = async (reportData, token) => {
    try {
        const response = await axios.post(API_URL, reportData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        if (error.response) {
            console.error("Lỗi từ API:", error.response.data);
            throw new Error(error.response.data.message || "Gửi báo cáo thất bại.");
        } else {
            console.error("Lỗi không xác định:", error.message);
            throw new Error("Không thể gửi báo cáo. Vui lòng thử lại.");
        }
    }
};
