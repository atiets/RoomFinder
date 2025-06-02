import axios from "axios";

const API_URL = `${process.env.REACT_APP_BASE_URL_API}/v1/subscriptions/`;

// Lấy tất cả gói đăng ký
export const getAllSubscriptions = async () => {
    try {
        const response = await axios.get(API_URL);
        return response;
    } catch (error) {
        if (error.response) {
            console.error("Lỗi từ API:", error.response.data);
            throw new Error(error.response.data.message || "Không thể lấy danh sách gói đăng ký.");
        } else {
            console.error("Lỗi không xác định:", error.message);
            throw new Error("Không thể lấy danh sách gói đăng ký. Vui lòng thử lại.");
        }
    }
};

// Lấy gói đăng ký hiện tại của user
export const getCurrentSubscription = async (token) => {
    try {
        const response = await axios.get(`${API_URL}current`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        if (error.response) {
            console.error("Lỗi từ API:", error.response.data);
            throw new Error(error.response.data.message || "Không thể lấy thông tin gói đăng ký.");
        } else {
            console.error("Lỗi không xác định:", error.message);
            throw new Error("Không thể lấy thông tin gói đăng ký. Vui lòng thử lại.");
        }
    }
};

// Kiểm tra khả năng sử dụng tính năng
export const checkFeatureUsage = async (feature, token) => {
    try {
        const response = await axios.get(`${API_URL}check-feature/${feature}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        if (error.response) {
            console.error("Lỗi từ API:", error.response.data);
            throw new Error(error.response.data.message || "Không thể kiểm tra tính năng.");
        } else {
            console.error("Lỗi không xác định:", error.message);
            throw new Error("Không thể kiểm tra tính năng. Vui lòng thử lại.");
        }
    }
};

// Cập nhật usage
export const updateFeatureUsage = async (feature, increment, token) => {
    try {
        const response = await axios.post(
            `${API_URL}update-usage`,
            { feature, increment },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response;
    } catch (error) {
        if (error.response) {
            console.error("Lỗi từ API:", error.response.data);
            throw new Error(error.response.data.message || "Không thể cập nhật usage.");
        } else {
            console.error("Lỗi không xác định:", error.message);
            throw new Error("Không thể cập nhật usage. Vui lòng thử lại.");
        }
    }
};
