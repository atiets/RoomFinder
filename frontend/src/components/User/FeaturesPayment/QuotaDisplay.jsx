import React from 'react';
import { Box, Typography, Grid, Chip, Card, CardContent } from '@mui/material';
import { useUsageManager } from '../../../hooks/useUsageManager';

const QuotaDisplay = ({ compact = true }) => {
  const { currentUsage, loading } = useUsageManager();

  if (loading || !currentUsage) {
    return (
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
        <Typography variant="body2">Đang tải thông tin quota...</Typography>
      </Box>
    );
  }

  const { currentUsage: usage, planName, features } = currentUsage;

  const quotaItems = [
    {
      label: 'Tin thường',
      current: usage.postsCreated,
      max: features.posting.monthlyPostLimit === -1 ? '∞' : features.posting.monthlyPostLimit,
      color: '#4caf50',
      icon: '📝'
    },
    {
      label: 'Tin VIP',
      current: usage.vipPostsUsed,
      max: features.vipFeatures.vipPostsPerMonth === -1 ? '∞' : features.vipFeatures.vipPostsPerMonth,
      color: '#ff9800',
      icon: '⭐'
    },
    {
      label: 'Xem SĐT',
      current: usage.hiddenPhoneViews,
      max: features.contactFeatures.hiddenPhoneViewsPerMonth === -1 ? '∞' : features.contactFeatures.hiddenPhoneViewsPerMonth,
      color: '#2196f3',
      icon: '📱'
    }
  ];

  return (
    <Card sx={{ mb: 2, bgcolor: '#f8f9fa' }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          📊 Quota hiện tại ({planName})
        </Typography>
        <Grid container spacing={2}>
          {quotaItems.map((item, index) => (
            <Grid item xs={4} key={index}>
              <Box textAlign="center">
                <Typography variant="body2" gutterBottom>
                  {item.icon} {item.label}
                </Typography>
                <Chip 
                  label={`${item.current}/${item.max}`}
                  size="small"
                  sx={{ 
                    bgcolor: item.color + '20',
                    color: item.color,
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuotaDisplay;