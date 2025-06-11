// components/TransactionFeatures.jsx
import React from 'react';
import { Grid, Paper, Typography, Stack, Box } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { getPackageColor } from '../../../utils/helpers';

const TransactionFeatures = ({ transaction }) => {
  if (!transaction.features || transaction.features.length === 0) {
    return null;
  }

  return (
    <Grid item xs={12} md={6}>
      <Paper sx={{ p: 2, bgcolor: "#f8fffe", borderRadius: 2 }}>
        <Typography variant="h6" sx={{
          fontWeight: "bold",
          mb: 2,
          color: getPackageColor(transaction.packageType),
        }}>
          ✨ Tính năng đã mua
        </Typography>

        <Stack spacing={1}>
          {transaction.features.map((feature, index) => (
            <Box key={index} sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}>
              <CheckCircleIcon sx={{
                color: getPackageColor(transaction.packageType),
                fontSize: 16,
              }} />
              <Typography variant="body2">{feature}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Grid>
  );
};

export default TransactionFeatures;
