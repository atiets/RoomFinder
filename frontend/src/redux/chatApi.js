import axios from "axios";

const BASE_URL =  `${process.env.REACT_APP_BASE_URL_API}/v1/conversations/`;

export const getConversationsByUser = async (userId, token) => {
    try {
        const response = await axios.get(`${BASE_URL}/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", error);
        throw error;
    }
};
