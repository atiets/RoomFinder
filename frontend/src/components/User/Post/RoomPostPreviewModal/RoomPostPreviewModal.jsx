import CloseIcon from "@mui/icons-material/Close";
import {
    Box,
    Divider,
    IconButton,
    Modal,
    Typography,
} from "@mui/material";
import RoomPost from "../RoomPost";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 650,
    bgcolor: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    borderRadius: "16px",
    p: 3,
    maxHeight: "90vh",
    overflowY: "auto",
};

const RoomPostPreviewModal = ({
    open,
    onClose,
    post,
    onToggleFavorite,
    isFavorite,
    onTitleClick,
}) => {
    if (!post) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        color: "#666",
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography
                    variant="h6"
                    sx={{ mb: 1, textAlign: "center", fontWeight: "bold" }}
                >
                    Xem trước tin đăng
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <RoomPost
                    post={post}
                    onTitleClick={onTitleClick}
                    onToggleFavorite={onToggleFavorite}
                    isFavorite={isFavorite}
                />
            </Box>
        </Modal>
    );
};

export default RoomPostPreviewModal;
