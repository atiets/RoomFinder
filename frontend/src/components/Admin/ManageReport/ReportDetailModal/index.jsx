import {
    Box,
    Button,
    Divider,
    Modal,
    Stack,
    Typography,
} from "@mui/material";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

const ReportDetailModal = ({ report, onClose }) => {
    const handleFakeAction = (label) => {
        alert(`Giả lập hành động: ${label}`);
        onClose(); // đóng modal
    };

    return (
        <Modal open={!!report} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" mb={2}>
                    Chi tiết báo cáo
                </Typography>

                <Typography>
                    <strong>Tiêu đề bài viết:</strong> {report.postTitle}
                </Typography>
                <Typography>
                    <strong>Lượt báo cáo:</strong> {report.reportCount}
                </Typography>
                <Typography>
                    <strong>Lý do phổ biến:</strong> {report.commonReason}
                </Typography>
                <Typography>
                    <strong>Ghi chú người báo cáo:</strong> {report.note}
                </Typography>
                <Typography>
                    <strong>Email người báo cáo:</strong> {report.reporterEmail}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack direction="column" spacing={1}>
                    <Button variant="contained" onClick={() => handleFakeAction("Giữ nguyên")}>
                        Đánh dấu đã xem (Giữ nguyên bài viết)
                    </Button>
                    <Button variant="contained" color="warning" onClick={() => handleFakeAction("Ẩn bài viết")}>
                        Ẩn bài viết
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleFakeAction("Xoá bài viết")}>
                        Xoá bài viết
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => handleFakeAction("Cảnh báo tài khoản")}>
                        Cảnh báo tài khoản
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default ReportDetailModal;
