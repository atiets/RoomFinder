import {
    Box,
    Button,
    Checkbox,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { getReport, handleReports, markReportAsViewed } from "../../../redux/apiReport";
import ReportDetailModal from "./ReportDetailModal";

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [statusFilter, setStatusFilter] = useState("Pending");
    const [searchText, setSearchText] = useState("");
    const [selectedReport, setSelectedReport] = useState(null);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [selectedReportIds, setSelectedReportIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const token = currentUser?.accessToken;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchText);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText]);

    const fetchReport = async () => {
        try {
            const reponse = await getReport(debouncedSearch, statusFilter, token);
            setReports(reponse.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Lấy danh sách report thất bại";
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [searchText, statusFilter]);

    useEffect(() => {
        const filtered = reports.filter(
            (r) =>
                r.status === statusFilter &&
                r.postTitle.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredReports(filtered);
    }, [statusFilter, searchText, reports]);

    useEffect(() => {
        setSelectAll(
            filteredReports.length > 0 &&
            filteredReports.every((r) => selectedReportIds.includes(r.reportId))
        );
    }, [filteredReports, selectedReportIds]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedReportIds(filteredReports.map((r) => r.reportId));
        } else {
            setSelectedReportIds([]);
        }
        setSelectAll(e.target.checked);
    };

    const handleSelectOne = (id) => {
        setSelectedReportIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleBatchAction = async (action, singleReportId = null) => {
        const reportIds = singleReportId ? [singleReportId] : selectedReportIds;

        if (reportIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất một báo cáo để thực hiện.");
            return;
        }

        try {
            await handleReports(reportIds, action, token); // gọi API xử lý backend
            toast.success("Xử lý báo cáo thành công.");
            fetchReport();
            setSelectedReportIds([]);
            setSelectAll(false);
        } catch (error) {
            toast.error("Lỗi xử lý báo cáo:", error.message);
        }
    };

    const handleReportClick = (report) => {
        setSelectedReport(report);
    };

    useEffect(() => {
        if (selectedReport && selectedReport.status !== 'Reviewed') {
            const markAsReviewed = async () => {
                try {
                    await markReportAsViewed(selectedReport.reportId, token);
                } catch (error) {
                    console.error("Lỗi khi đánh dấu report là Reviewed:", error);
                }
            };

            markAsReviewed();
        }
    }, [selectedReport, token]);

    console.log("reports", reports);

    return (
        <Box p={3}>
            <ToastContainer />
            <Typography variant="h4" gutterBottom>
                Quản lý báo cáo
            </Typography>
            <Box display="flex" gap={2} mb={2}>
                <Select
                    size="small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <MenuItem value="Pending">Chưa xử lý</MenuItem>
                    <MenuItem value="Reviewed">Đã xem</MenuItem>
                    <MenuItem value="Resolved">Đã xử lý</MenuItem>
                </Select>

                <TextField
                    size="small"
                    placeholder="Tìm theo tiêu đề bài viết"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    fullWidth
                />
            </Box>

            {selectedReportIds.length > 0 && statusFilter !== "Resolved" && (
                <Box mb={2} display="flex" gap={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleBatchAction("keep")}
                    >
                        Giữ nguyên bài viết
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => handleBatchAction("hide")}
                    >
                        Ẩn bài viết
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleBatchAction("delete")}
                    >
                        Xoá bài viết
                    </Button>
                </Box>
            )}

            <Table>
                <TableHead>
                    <TableRow>
                        {statusFilter !== "Resolved" && <TableCell padding="checkbox" >
                            <Checkbox
                                checked={selectAll}
                                onChange={handleSelectAll}
                            />
                        </TableCell>}
                        <TableCell>Tiêu đề bài viết</TableCell>
                        <TableCell>Số lượt báo cáo</TableCell>
                        <TableCell>Lý do phổ biến</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        {statusFilter !== "Resolved" && <TableCell>Hành động</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredReports.map((report) => (
                        <TableRow key={report.reportId}>
                            {statusFilter !== "Resolved" && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedReportIds.includes(report.reportId)}
                                        onChange={() => handleSelectOne(report.reportId)}
                                    />
                                </TableCell>
                            )}
                            <TableCell>{report.postTitle}</TableCell>
                            <TableCell>{report.reportCount}</TableCell>
                            <TableCell>{report.commonReason}</TableCell>
                            <TableCell>{report.status}</TableCell>
                            {statusFilter !== "Resolved" && (
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleReportClick(report)}
                                    >
                                        Xử lý
                                    </Button>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {selectedReport && (
                <ReportDetailModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onAction={handleBatchAction}
                />
            )}

        </Box>
    );
};

export default AdminReports;
