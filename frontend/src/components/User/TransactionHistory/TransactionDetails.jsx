// components/TransactionDetails.jsx
import React from 'react';
import { Grid, Paper, Typography, Stack, Box, Divider } from '@mui/material';
import { formatDate, formatUsageDisplay } from '../../../utils/helpers';

const TransactionDetails = ({ transaction }) => {
  return (
    <Grid item xs={12} md={6}>
      <Paper sx={{ p: 2, bgcolor: "#f8fffe", borderRadius: 2 }}>
        <Typography variant="h6" sx={{
          fontWeight: "bold",
          mb: 2,
          color: "#2E7D32",
        }}>
          📋 Thông tin giao dịch
        </Typography>

        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Mã giao dịch:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {transaction.id}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Mã hóa đơn:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {transaction.invoiceNumber}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Ngày giao dịch:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {formatDate(transaction.transactionDate)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Ngày hết hạn:
            </Typography>
            <Typography variant="body2" sx={{
              fontWeight: "bold",
              color: new Date(transaction.expiryDate) > new Date() ? "#2E7D32" : "#D32F2F",
            }}>
              {formatDate(transaction.expiryDate)}
            </Typography>
          </Box>

          {/* Usage information */}
          {transaction.currentUsage && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ color: "#666", fontWeight: "bold" }}>
                Sử dụng hiện tại:
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Số tin còn lại:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {formatUsageDisplay(transaction.currentUsage.usage?.postsCreated)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Số tin VIP còn lại:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {formatUsageDisplay(transaction.currentUsage.usage?.vipPostsUsed)}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    </Grid>
  );
};

export default TransactionDetails;
