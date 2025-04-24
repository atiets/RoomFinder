import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    Grid,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import './index.css';

const complaintTypes = [
    'Sai thông tin bất động sản',
    'Lừa đảo / Gian lận',
    'Ứng xử không đúng mực',
    'Khác',
];

const severityLevels = ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'];

const ComplaintForm = () => {
    const [attachment, setAttachment] = useState(null);

    // Handle file change
    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        setAttachment(file);
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('File đính kèm:', attachment);
        // Xử lý form tại đây
    };

    return (
        <Box className="complaint-container">
            <Paper elevation={6} className="complaint-paper">
                <Typography variant="h5" className="complaint-header" display="flex" alignItems="center" gap={1}>
                    <ReportProblemIcon className="complaint-icon" />
                    Gửi Khiếu Nại
                </Typography>

                <Divider sx={{ my: 2 }} />

                <form className="complaint-form" onSubmit={handleSubmit}>
                    {/* Thông tin người gửi */}
                    <Typography variant="subtitle1" className="section-label">Thông tin người gửi</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField label="Họ và tên" fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Email" fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Số điện thoại" fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Liên kết bài viết (nếu có)" fullWidth size="small" />
                        </Grid>
                    </Grid>

                    {/* Chi tiết khiếu nại */}
                    <Typography variant="subtitle1" className="section-label">Chi tiết khiếu nại</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField label="ID bài viết" fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField select label="Loại khiếu nại" fullWidth size="small" defaultValue="">
                                {complaintTypes.length > 0 && complaintTypes.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Nội dung khiếu nại"
                                multiline
                                rows={4}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Mức độ nghiêm trọng"
                                fullWidth
                                size="small"
                                defaultValue=""
                            >
                                {severityLevels.length > 0 && severityLevels.map((level) => (
                                    <MenuItem key={level} value={level}>{level}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {/* Tạo Button để chọn tệp */}
                            <input
                                type="file"
                                id="file-input"
                                className="file-input"
                                onChange={handleFileChange}
                                accept="image/*, .pdf, .docx"
                            />
                            <Button
                                variant="contained"
                                component="span"
                                className="file-input-button"
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                Chọn Tệp Đính Kèm
                            </Button>
                            {attachment && (
                                <Typography variant="body2" className="file-input-name">
                                    Đã chọn: {attachment.name}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>

                    {/* Điều khoản */}
                    <FormControlLabel
                        control={<Checkbox color="success" />}
                        label="Tôi cam kết các thông tin cung cấp là chính xác."
                        className="terms-checkbox"
                    />

                    {/* Gửi */}
                    <Button variant="contained" className="submit-button" type="submit">
                        Gửi Khiếu Nại
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default ComplaintForm;
