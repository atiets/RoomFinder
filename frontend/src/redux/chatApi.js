import axios from "axios";

const BASE_URL =  `${process.env.REACT_APP_BASE_URL_API}/v1/conversations/`;

export const getConversationsByUser = async (userId, token) => {
    try {
        const response = await axios.get(`${BASE_URL}/user/${userId}`, {
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

export const getMessagesByConversation = async (conversationId, token, page = 1, limit = 10) => { 
    try {
        const url = `${BASE_URL}chat/${conversationId}?page=${page}&limit=${limit}`;
        const response = await axios.get(url, {
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

