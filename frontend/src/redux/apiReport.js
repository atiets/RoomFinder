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

export const getReport = async (search = '', status = '', token) => {
    try {
        const params = {};
        if (search) {
            params.search = search;
        }
        if (status) {
            params.status = status;
        }
        const response = await axios.get(`${API_URL}/report-list`, {
            params,
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        if (error.response) {
            console.error("Lỗi từ API:", error.response.data);
            throw new Error(error.response.data.message || "Không thể lấy danh sách bài viết.");
        } else {
            console.error("Lỗi không xác định:", error.message);
            throw new Error("Không thể lấy danh sách bài viết. Vui lòng thử lại.");
        }
    }
};

export const markReportAsViewed = async (reportId, token) => {
    try {
        const response = await axios.patch(
            `${API_URL}mark-as-viewed/${reportId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đánh dấu đã xem:", error.response?.data || error.message);
        throw new Error("Không thể đánh dấu báo cáo đã xem.");
    }
};

export const handleReports = async (reportIds, action, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/handle-report`,
            { reportIds, action },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xử lý báo cáo:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Không thể xử lý báo cáo.");
    }
};
