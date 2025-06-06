import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserThread } from "../../../../redux/threadApi";
import ThreadList from "../../forum/ThreadList";

const ManageThread = () => {
    const user = useSelector((state) => state.auth.login.currentUser);
    const accessToken = user?.accessToken;
    const userId = user?._id;

    const [value, setValue] = useState("approved");
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {

        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const response = await getUserThread({
                    authorId: userId,
                    status: value,
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
    }, [value, page]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    console.log("ManageThread rendered with value:", threads);

    return (
        <div className="manage-thread">
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList onChange={handleChange} className="tab-listpost">
                        <Tab label="Đã đăng" value="approved" />
                        <Tab label="Chờ duyệt" value="pending" />
                    </TabList>
                </Box>
                <TabPanel value="approved" className="tab-panel">
                    {!loading || threads.length > 0 ? (
                        <ThreadList
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
                </TabPanel>
                <TabPanel value="pending" className="tab-panel">
                    {!loading || threads.length > 0 ? (
                        <ThreadList
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
                </TabPanel>
            </TabContext>
        </div>
    );
};

export default ManageThread;