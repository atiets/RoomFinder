import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_BASE_URL_API}/v1/conversations/`;

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

export const searchConversation = async (userId, searchText, token) => {
    try {
        const res = await axios.get(`${BASE_URL}search/${userId}`, {
            params: { searchText },
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return res.data;
    } catch (err) {
        console.error("Search error:", err);
    }
};

export const updateConversationVisibility = async (conversationIds, visible, token) => {
    try {
        const response = await axios.patch(`${BASE_URL}visibility`, {
            conversationIds,
            visible,
        },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

        return response;
    } catch (error) {
        console.error('Lỗi khi cập nhật hiển thị hội thoại:', error);
        throw error;
    }
};

export const getFilteredConversations = async (userId, type, token) => {
    try {
        const response = await axios.get(`${BASE_URL}filter/${userId}?type=${type}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response;
    } catch (error) {
        console.error("Error fetching filtered conversations:", error);
        throw error;
    }
};

export const fetchSuggestedQuestions = async (postContent, accessToken) => {
    try {
        const response = await axios.post(`${BASE_URL}/suggest-questions`,
            {
                postContent,

            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error('Lỗi khi gọi API gợi ý câu hỏi:', error);
        return null;
    }
};

//fetch của admin
export const getListConversation = async (adminId, token, unreadOnly, searchText) => {
    try {
        const response = await axios.get(`${BASE_URL}admin/listConversations/${adminId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    unreadOnly,
                    search: searchText
                }
            }
        );
        return response;
    } catch (error) {
        console.error("Error fetching filtered conversations:", error);
        throw error;
    }
};

export const getMessagesWithBot = async (userID, token) => {
    try {
        const response = await axios.get(`${BASE_URL}user/messageswithBot/${userID}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response;
    } catch (error) {
        console.error("Error fetching messages with bot:", error);
        throw error;
    }
};

//Get danh sách các cuộc hội thoại chưa được admin nhận
export const getUnclaimedConversations = async (token) => {
    try {
        const response = await axios.get(`${BASE_URL}unclaimed`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response;
    } catch (error) {
        console.error("Error fetching unclaimed conversations:", error);
        throw error;
    }
};