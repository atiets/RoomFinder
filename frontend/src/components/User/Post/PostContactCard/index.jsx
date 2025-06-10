import EmailIcon from "@mui/icons-material/Email";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import {
    Avatar,
    Box,
    Button,
    Card,
    Divider,
    IconButton,
    Typography,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useUsageManager } from "../../../../hooks/useUsageManager"; 
import "./index.css";

export default function ContactInfoCard({
    post,
    getHiddenPhoneNumber,
    handleChat,
}) {
    const [showFullPhone, setShowFullPhone] = useState(false);
    const [canViewPhone, setCanViewPhone] = useState(false);
    const [checkingQuota, setCheckingQuota] = useState(true);
    
    const { checkUsage, updateUsage, currentUsage } = useUsageManager(); // ⭐ Sử dụng hook

    // ⭐ Check quota khi component mount
    useEffect(() => {
        checkPhoneViewQuota();
    }, [currentUsage]);

    const checkPhoneViewQuota = async () => {
        try {
            setCheckingQuota(true);
            
            // Nếu chưa có currentUsage, chờ load
            if (!currentUsage) {
                setCanViewPhone(false);
                return;
            }

            const { currentUsage: usage } = currentUsage;
            
            // ⭐ Check nếu có quota xem số điện thoại
            if (usage.hiddenPhoneViews > 0) {
                setCanViewPhone(true);
            } else {
                setCanViewPhone(false);
                setShowFullPhone(false); // Reset về ẩn số
            }
        } catch (error) {
            console.error("Error checking phone view quota:", error);
            setCanViewPhone(false);
        } finally {
            setCheckingQuota(false);
        }
    };

    const togglePhoneVisibility = async () => {
        // ⭐ Nếu đang hiển thị số thật, cho phép ẩn mà không cần check quota
        if (showFullPhone) {
            setShowFullPhone(false);
            return;
        }

        // ⭐ Nếu muốn hiển thị số thật, cần check và update quota
        try {
            const usageCheck = await checkUsage('view_phone');
            if (!usageCheck || !usageCheck.canUse) {
                return; // Alert đã được hiển thị trong checkUsage
            }

            // ⭐ Update usage trước khi hiển thị số
            const updateResult = await updateUsage('view_phone');
            if (updateResult) {
                setShowFullPhone(true);
                
                // ⭐ Hiển thị thông báo sử dụng quota
                if (updateResult.remaining <= 5 && updateResult.remaining > 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: '⚠️ Cảnh báo quota',
                        text: `Bạn chỉ còn ${updateResult.remaining} lượt xem số điện thoại!`,
                        confirmButtonColor: '#ff9800',
                        timer: 3000,
                        timerProgressBar: true
                    });
                }
            }
        } catch (error) {
            console.error("Error toggling phone visibility:", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi xem số điện thoại!'
            });
        }
    };

    // ⭐ Render icon dựa trên quota
    const renderPhoneIcon = () => {
        if (checkingQuota) {
            return <CircularProgress size={16} />;
        }

        if (!canViewPhone) {
            return (
                <Tooltip title="Bạn cần đăng nhập/nâng cấp gói để xem số điện thoại">
                    <LockIcon sx={{ color: '#757575' }} />
                </Tooltip>
            );
        }

        return (
            <IconButton
                onClick={togglePhoneVisibility}
                size="small"
                className="visibility-icon-button"
            >
                {showFullPhone ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
        );
    };

    // ⭐ Render số điện thoại
    const renderPhoneNumber = () => {
        if (!canViewPhone) {
            // ⭐ Nếu không có quota, luôn hiển thị số ẩn
            return getHiddenPhoneNumber(post.contactInfo?.phoneNumber);
        }

        return showFullPhone
            ? post.contactInfo?.phoneNumber
            : getHiddenPhoneNumber(post.contactInfo?.phoneNumber);
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
                    endIcon={renderPhoneIcon()}
                    sx={{
                        '& .MuiButton-endIcon': {
                            cursor: canViewPhone ? 'pointer' : 'not-allowed'
                        }
                    }}
                >
                    {renderPhoneNumber()}
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