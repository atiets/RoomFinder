// components/QuotaDisplay.js
import React from 'react';
import { Box, Typography, LinearProgress, Grid, Card, CardContent, Chip } from '@mui/material';
import { useUsageManager } from '../../../hooks/useUsageManager';

const QuotaDisplay = ({ compact = true }) => {
  const { currentUsage, loading } = useUsageManager();

  if (loading || !currentUsage) return null;

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
    }
  ];

  if (compact) {
    return (
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          📊 Quota hiện tại ({planName})
        </Typography>
        <Grid container spacing={2}>
          {quotaItems.map((item, index) => (
            <Grid item xs={6} key={index}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">
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
      </Box>
    );
  }

  return null; 
};

export default QuotaDisplay;