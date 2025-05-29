import EmailIcon from "@mui/icons-material/Email";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
    Avatar,
    Box,
    Button,
    Card,
    Divider,
    IconButton,
    Typography,
} from "@mui/material";
import { useState } from "react";
import "./index.css";

export default function ContactInfoCard({
    post,
    getHiddenPhoneNumber,
    handleChat,
}) {
    const [showFullPhone, setShowFullPhone] = useState(false);

    const togglePhoneVisibility = () => {
        setShowFullPhone((prev) => !prev);
    };

    return (
        <Box className="container-right sticky-card-container">
            <Card className="card-info" elevation={0}>
                <Box className="container-contactinfo">
                    <Avatar className="room-post-avatar">
                        {post.contactInfo?.username.charAt(0)}
                    </Avatar>
                    <Typography className="room-post-username">
                        {post.contactInfo?.username}
                    </Typography>
                </Box>
                <Divider />
                <Button
                    variant="outlined"
                    className="room-post-button"
                    startIcon={<LocalPhoneIcon />}
                    endIcon={
                        <IconButton
                            onClick={togglePhoneVisibility}
                            size="small"
                            className="visibility-icon-button"
                        >
                            {showFullPhone ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                    }
                >
                    {showFullPhone
                        ? post.contactInfo?.phoneNumber
                        : getHiddenPhoneNumber(post.contactInfo?.phoneNumber)}
                </Button>

                <Button
                    variant="outlined"
                    className="room-post-button"
                    onClick={() => handleChat(post)}
                    startIcon={<EmailIcon />}
                >
                    Gửi tin nhắn
                </Button>
            </Card>
        </Box>
    );
}
