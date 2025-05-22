// src/components/User/forum/CreateThread/ThreadCaptcha.jsx
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const ThreadCaptcha = ({ isCaptchaVerified, setIsCaptchaVerified, showSnackbar }) => {
  // Xử lý reset captcha
  const reloadCaptcha = () => {
    if (window.turnstile) {
      window.turnstile.reset();
    }
    setIsCaptchaVerified(false);
  };

  // Mô phỏng xác thực captcha
  const simulateVerifyCaptcha = () => {
    setIsCaptchaVerified(true);
    showSnackbar && showSnackbar('Xác thực captcha thành công', 'success');
  };

  return (
    <Box sx={{ margin: 'auto', width: 300, textAlign: 'center', my: 2 }}>
      <Box 
        id="captcha-container" 
        sx={{ 
          width: 300, 
          height: 65, 
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
          bgcolor: '#f5f5f5',
          cursor: 'pointer'
        }}
        onClick={simulateVerifyCaptcha}
      >
        <Typography variant="body2" color="text.secondary">
          {isCaptchaVerified ? '✓ Đã xác thực' : 'Click để xác thực captcha (demo)'}
        </Typography>
      </Box>
      <Link 
        component="button" 
        variant="body2" 
        onClick={reloadCaptcha}
      >
        Tải lại captcha
      </Link>
    </Box>
  );
};

export default ThreadCaptcha;
