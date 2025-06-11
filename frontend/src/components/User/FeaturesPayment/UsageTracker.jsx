// components/UsageTracker.js
import React from 'react';
import { Box, Typography, LinearProgress, Grid, Card, CardContent, Chip } from '@mui/material';
import { TrendingUp, Star, Phone } from '@mui/icons-material';
import { useUsageManager } from '../hooks/useUsageManager';

const UsageTracker = ({ compact = false }) => {
  const { currentUsage, loading } = useUsageManager();

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Đang tải usage...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!currentUsage) return null;

  const { currentUsage: usage, planName, features } = currentUsage;

  const usageItems = [
    {
      label: 'Tin đăng thường',
      current: usage.postsCreated,
      max: features.posting.monthlyPostLimit === -1 ? '∞' : features.posting.monthlyPostLimit,
      color: '#4caf50',
      icon: <TrendingUp />
    },
    {
      label: 'Tin VIP',
      current: usage.vipPostsUsed,
      max: features.vipFeatures.vipPostsPerMonth === -1 ? '∞' : features.vipFeatures.vipPostsPerMonth,
      color: '#ff9800',
      icon: <Star />
    },
    {
      label: 'Xem số điện thoại',
      current: usage.hiddenPhoneViews,
      max: features.contactFeatures.hiddenPhoneViewsPerMonth === -1 ? '∞' : features.contactFeatures.hiddenPhoneViewsPerMonth,
      color: '#2196f3',
      icon: <Phone />
    }
  ];

  if (compact) {
    return (
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          📊 Quota hiện tại ({planName})
        </Typography>
        <Grid container spacing={1}>
          {usageItems.map((item, index) => (
            <Grid item xs={4} key={index}>
              <Box textAlign="center">
                <Chip 
                  label={`${item.current}/${item.max}`}
                  size="small"
                  sx={{ 
                    bgcolor: item.color + '20',
                    color: item.color,
                    fontWeight: 'bold'
                  }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  {item.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>
          📊 Quota sử dụng - {planName}
        </Typography>
        
        <Grid container spacing={3}>
          {usageItems.map((item, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box>
                <Box display="flex" alignItems="center" mb={1}>
                  {item.icon}
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {item.label}
                  </Typography>
                </Box>
                
                <Typography variant="h5" sx={{ color: item.color, fontWeight: 'bold' }}>
                  {item.current} / {item.max}
                </Typography>
                
                {item.max !== '∞' && (
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(0, (item.current / item.max) * 100)}
                    sx={{
                      mt: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': { 
                        bgcolor: item.color,
                        borderRadius: 4
                      }
                    }}
                  />
                )}
                
                {item.current === 0 && (
                  <Chip 
                    label="Đã hết quota"
                    size="small"
                    color="error"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UsageTracker;