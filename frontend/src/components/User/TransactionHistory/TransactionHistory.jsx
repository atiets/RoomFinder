// components/TransactionHistory.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Alert,
  Skeleton,
  Grid
} from "@mui/material";

import { fetchTransactionData } from "../../../utils/apiUtils";
import TransactionStats from "./TransactionStats";
import TransactionCard from "./TransactionCard";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user info from Redux
  const currentUser = useSelector((state) => state.auth.login.currentUser);
  const userId = currentUser?._id;
  const token = currentUser?.accessToken;

  // Fetch transaction history
  useEffect(() => {
    const loadTransactionHistory = async () => {
      try {
        setLoading(true);
        const data = await fetchTransactionData(userId, token);
        setTransactions(data.transactions);
        setStats(data.stats);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTransactionHistory();
  }, [userId, token]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: "#f8fffe", minHeight: "100vh" }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={60} />
          <Skeleton variant="text" width={500} height={30} />
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {[1, 2].map((item) => (
              <Grid item xs={12} md={6} key={item}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: "#f8fffe", minHeight: "100vh" }}>
        <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
          <Typography variant="body1">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fffe", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{
          fontWeight: "bold",
          color: "#2E7D32",
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}>
          💳 Lịch sử giao dịch
        </Typography>
        <Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
          Quản lý và theo dõi các giao dịch nâng cấp gói dịch vụ của bạn
        </Typography>

        {/* Statistics */}
        <TransactionStats stats={stats} />
      </Box>

      {/* Transaction List */}
      <Box>
        {transactions.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body1">
              Bạn chưa có giao dịch nào. Hãy nâng cấp gói để sử dụng nhiều tính năng hơn!
            </Typography>
          </Alert>
        ) : (
          transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              currentUser={currentUser}
            />
          ))
        )}
      </Box>

      {/* Upgrade Button */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: "#81C784",
            color: "#fff",
            py: 1.5,
            px: 4,
            borderRadius: 3,
            fontSize: "1.1rem",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#66BB6A",
            },
          }}
          onClick={() => (window.location.href = "/subscription")}
        >
          🚀 Nâng cấp gói mới
        </Button>
      </Box>
    </Box>
  );
};

export default TransactionHistory;