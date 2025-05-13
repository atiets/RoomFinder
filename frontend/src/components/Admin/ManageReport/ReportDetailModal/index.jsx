import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { markReportAsViewed } from "../../../../redux/apiReport";

const ReportDetailModal = ({ report, onClose, onAction }) => {
    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const token = currentUser?.accessToken;

    const handleAction = (action) => {
        if (onAction) {
            onAction(action, report.reportId); // Truyền action và reportId về handleBatchAction
        }
        onClose();
    };

    useEffect(() => {
        const handleMarkReport = async () => {
            try {
                if (report.reportId && token && report.status !== "Reviewed") {
                    await markReportAsViewed(report.reportId, token);
                }
            } catch (error) {
                console.error("Lỗi khi đánh dấu đã xem:", error);
            }
        };

        handleMarkReport();
    }, [report.reportId, report.status, token]);

    return (
        <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Chi tiết báo cáo</DialogTitle>
            <DialogContent dividers>
                <Box mb={2}>
                    <Typography variant="subtitle2">Tiêu đề bài viết:</Typography>
                    <Typography>{report.postTitle}</Typography>
                </Box>
                <Divider />
                <Box my={2}>
                    <Typography variant="subtitle2">Lý do phổ biến:</Typography>
                    <Typography>{report.commonReason}</Typography>
                </Box>
                <Box my={2}>
                    <Typography variant="subtitle2">Ghi chú từ người báo cáo:</Typography>
                    <Typography>{report.note}</Typography>
                </Box>
                <Box my={2}>
                    <Typography variant="subtitle2">Email người báo cáo:</Typography>
                    <Typography>{report.reporterEmail}</Typography>
                </Box>
                <Box my={2}>
                    <Typography variant="subtitle2">Tổng số lượt báo cáo:</Typography>
                    <Typography>{report.reportCount}</Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleAction("keep")} variant="outlined" color="primary">
                    Giữ nguyên
                </Button>
                <Button onClick={() => handleAction("hide")} variant="contained" color="warning">
                    Ẩn bài viết
                </Button>
                <Button onClick={() => handleAction("delete")} variant="contained" color="error">
                    Xoá bài viết
                </Button>
                <Button onClick={onClose}>Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReportDetailModal;
