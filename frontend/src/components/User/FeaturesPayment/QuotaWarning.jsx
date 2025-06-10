// components/QuotaWarning.js
import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const QuotaWarning = ({ type, remaining }) => {
  const navigate = useNavigate();

  const getWarningConfig = () => {
    switch (type) {
      case 'post':
        return {
          title: '📝 Quota đăng tin sắp hết',
          message: `Bạn chỉ còn ${remaining} lượt đăng tin. Nâng cấp gói để đăng thêm!`,
          color: 'warning'
        };
      case 'vip_post':
        return {
          title: '⭐ Quota tin VIP sắp hết',
          message: `Bạn chỉ còn ${remaining} lượt đăng tin VIP. Nâng cấp gói để có thêm quota!`,
          color: 'warning'
        };
      default:
        return null;
    }
  };

  const config = getWarningConfig();
  if (!config || remaining > 5) return null;

  return (
    <Alert 
      severity={config.color} 
      sx={{ mb: 2 }}
      action={
        <Button 
          color="inherit" 
          size="small" 
          onClick={() => navigate('/subscription')}
        >
          Nâng cấp
        </Button>
      }
    >
      <AlertTitle>{config.title}</AlertTitle>
      {config.message}
    </Alert>
  );
};

export default QuotaWarning;
