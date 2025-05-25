// src/components/common/CustomSnackbar.jsx
import React from 'react';
import { Snackbar, Alert, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

const CustomSnackbar = ({ open, message, severity, onClose, autoHideDuration = 6000 }) => {
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon />;
      case 'info':
        return <HourglassEmptyIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getTitle = () => {
    switch (severity) {
      case 'success':
        return 'Thành công!';
      case 'info':
        return 'Chờ duyệt';
      case 'error':
        return 'Có lỗi xảy ra';
      default:
        return 'Thông báo';
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        icon={getIcon()}
        sx={{
          minWidth: '400px',
          borderRadius: '12px',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {getTitle()}
          </Typography>
          <Typography variant="body2">
            {message}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;