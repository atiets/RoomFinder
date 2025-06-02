import axios from "axios";

const API_URL = `${process.env.REACT_APP_BASE_URL_API}/v1/alertSubscription/`;

export const createAlertSubscription = async (data, token) => {
    try {
        const response = await axios.post(
            `${API_URL}create`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error("Error creating alert subscription:", error.response?.data || error.message);
        throw error;
    }
};

export const getAlertSubscriptions = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching alert subscriptions:", error);
        throw error;
    }
};

