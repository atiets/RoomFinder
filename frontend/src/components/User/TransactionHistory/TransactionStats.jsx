// components/TransactionStats.jsx
import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '../../../utils/helpers';

const TransactionStats = ({ stats }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <Card sx={{
          bgcolor: "#E8F5E8",
          border: "1px solid #81C784",
          borderRadius: 2,
        }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ color: "#2E7D32", fontWeight: "bold" }}>
              Tổng giao dịch
            </Typography>
            <Typography variant="h4" sx={{ color: "#1B5E20", fontWeight: "bold" }}>
              {stats.totalTransactions || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{
          bgcolor: "#E8F5E8",
          border: "1px solid #81C784",
          borderRadius: 2,
        }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ color: "#2E7D32", fontWeight: "bold" }}>
              Tổng chi tiêu
            </Typography>
            <Typography variant="h4" sx={{ color: "#1B5E20", fontWeight: "bold" }}>
              {formatCurrency(stats.totalSpent || 0)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TransactionStats;
