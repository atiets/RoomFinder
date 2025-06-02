import axios from "axios";

const API_URL = `${process.env.REACT_APP_BASE_URL_API}/v1/payments/`;

// Tạo đơn thanh toán
export const createPayment = async (paymentData, token) => {
    try {
        const response = await axios.post(`${API_URL}create`, paymentData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        if (error.response) {
            console.error("Lỗi từ API:", error.response.data);
            throw new Error(error.response.data.message || "Không thể tạo đơn thanh toán.");
        } else {
            console.error("Lỗi không xác định:", error.message);
            throw new Error("Không thể tạo đơn thanh toán. Vui lòng thử lại.");
        }
    }
};

// Lấy lịch sử thanh toán
export const getPaymentHistory = async (page = 1, limit = 10, token) => {
    try {
        const response = await axios.get(`${API_URL}history`, {
            params: { page, limit },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        if (error.response) {
            console.error("Lỗi từ API:", error.response.data);
            throw new Error(error.response.data.message || "Không thể lấy lịch sử thanh toán.");
        } else {
            console.error("Lỗi không xác định:", error.message);
            throw new Error("Không thể lấy lịch sử thanh toán. Vui lòng thử lại.");
        }
    }
};

// Kiểm tra trạng thái thanh toán
export const checkPaymentStatus = async (paymentId, token) => {
    try {
        const response = await axios.get(`${API_URL}status/${paymentId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        if (error.response) {
            console.error("Lỗi từ API:", error.response.data);
            throw new Error(error.response.data.message || "Không thể kiểm tra trạng thái thanh toán.");
        } else {
            console.error("Lỗi không xác định:", error.message);
            throw new Error("Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại.");
        }
    }
};
