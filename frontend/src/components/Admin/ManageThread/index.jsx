import { Box, MenuItem, Select, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { getUserThread } from "../../../redux/threadApi";
import ThreadList from "../../User/forum/ThreadList";
import "./index.css";

const ManageThread = () => {
    const user = useSelector((state) => state.auth.login.currentUser);
    const accessToken = user?.accessToken;

    const [statusFilter, setStatusFilter] = useState("pending");
    const [searchText, setSearchText] = useState("");
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [typeList, setTypeList] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchText]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const response = await getUserThread({
                    keyword: debouncedSearchText,
                    status: statusFilter,
                    page,
                    limit: 10,
                    token: accessToken,
                });
                setThreads(Array.isArray(response?.data?.data) ? response.data.data : []);
                setTotalPages(response?.data?.pagination?.total || 1);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            }
            setLoading(false);
        };

        fetchSearchResults();
    }, [statusFilter, page, debouncedSearchText]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleStatusFilter = (event) => {
        setStatusFilter(event.target.value);
        setPage(1);
        setTypeList(event.target.value);
    };

    return (
        <div className="manage-thread">
            <ToastContainer />
            <Box display="flex" gap={2} mb={2}>
                <Select
                    size="small"
                    value={statusFilter}
                    onChange={handleStatusFilter}
                >
                    <MenuItem value="approved">Đang hiển thị</MenuItem>
                    <MenuItem value="pending">Chờ duyệt</MenuItem>
                </Select>
                <TextField
                    size="small"
                    placeholder="Tìm theo từ khóa, tiêu đề, tác giả..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    fullWidth
                />
            </Box>
            <div>
                {!loading || threads.length > 0 ? (
                    <ThreadList
                        type={typeList}
                        threads={threads}
                        setThreads={setThreads}
                        loading={loading}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        onThreadClick={(id) => console.log("Thread click:", id)}
                        onThreadUpdated={() => { }}
                        onThreadDeleted={() => { }}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default ManageThread;