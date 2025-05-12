import {
    Box,
    Button,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import ReportDetailModal from "./ReportDetailModal";

const mockReports = [
    {
        reportId: 1,
        postId: 101,
        postTitle: "Phòng trọ gần đại học",
        reportCount: 5,
        commonReason: "Nội dung sai sự thật",
        status: "Pending",
        note: "Thông tin sai giá thuê",
        reporterEmail: "user@example.com",
        authorId: 201,
    },
    {
        reportId: 2,
        postId: 102,
        postTitle: "Căn hộ cao cấp",
        reportCount: 3,
        commonReason: "Hình ảnh không đúng",
        status: "Pending",
        note: "Hình ảnh khác thực tế",
        reporterEmail: "user2@example.com",
        authorId: 202,
    },
];

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [statusFilter, setStatusFilter] = useState("Pending");
    const [searchText, setSearchText] = useState("");
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        // Sử dụng dữ liệu giả
        setReports(mockReports);
    }, []);

    useEffect(() => {
        const filtered = reports.filter(
            (r) =>
                r.status === statusFilter &&
                r.postTitle.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredReports(filtered);
    }, [statusFilter, searchText, reports]);

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Quản lý báo cáo
            </Typography>

            <Box display="flex" gap={2} mb={3}>
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

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Tiêu đề</TableCell>
                        <TableCell>Lượt báo cáo</TableCell>
                        <TableCell>Lý do phổ biến</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredReports.map((report) => (
                        <TableRow key={report.reportId}>
                            <TableCell>{report.postTitle}</TableCell>
                            <TableCell>{report.reportCount}</TableCell>
                            <TableCell>{report.commonReason}</TableCell>
                            <TableCell>{report.status}</TableCell>
                            <TableCell>
                                <Button
                                    variant="outlined"
                                    onClick={() => setSelectedReport(report)}
                                >
                                    Xử lý
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {selectedReport && (
                <ReportDetailModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}
        </Box>
    );
};

export default AdminReports;
