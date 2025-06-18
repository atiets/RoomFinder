// components/TransactionCard.jsx
import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Button,
  Stack,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

import {
  getPackageColor,
  getAvatarIcon,
  formatCurrency,
  formatDate,
  getPaymentIcon,
  getPaymentMethodText
} from '../../../utils/helpers';
import { generateInvoicePDF } from '../../../utils/pdfUtils';
import TransactionDetails from './TransactionDetails';
import TransactionFeatures from './TransactionFeatures';

const TransactionCard = ({ transaction, currentUser }) => {
const handleDownloadPDF = async (e) => {
  e.stopPropagation();
  
  try {
    await generateInvoicePDF(transaction, currentUser);
    
    console.log('✅ Hóa đơn PDF đã được tạo thành công');
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo PDF:', error);
    alert(`Có lỗi xảy ra: ${error.message || 'Không thể tạo hóa đơn PDF'}`);
  } finally {
  }
};

  return (
    <Accordion sx={{
      mb: 2,
      borderRadius: "12px !important",
      border: `2px solid ${getPackageColor(transaction.packageType)}`,
      "&:before": { display: "none" },
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: `${getPackageColor(transaction.packageType)}15`,
          borderRadius: "12px 12px 0 0",
          minHeight: "80px !important",
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={1}>
            <Avatar sx={{
              bgcolor: getPackageColor(transaction.packageType),
              width: 56,
              height: 56,
              fontSize: "1.5rem",
            }}>
              {getAvatarIcon(transaction.packageType)}
            </Avatar>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{
              fontWeight: "bold",
              color: getPackageColor(transaction.packageType),
            }}>
              {transaction.packageName}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {transaction.description}
            </Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="h6" sx={{
              fontWeight: "bold",
              color: "#1B5E20",
            }}>
              {formatCurrency(transaction.amount)}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {getPaymentIcon(transaction.paymentMethod)} {getPaymentMethodText(transaction.paymentMethod)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {formatDate(transaction.transactionDate)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <Chip
              icon={<CheckCircleIcon sx={{ color: "#81C784" }} />}
              label="Thành công"
              sx={{
                bgcolor: "#E8F5E8",
                color: "#2E7D32",
                fontWeight: "bold",
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <IconButton
              size="small"
              onClick={handleDownloadPDF}
              sx={{
                bgcolor: "#E8F5E8",
                color: "#2E7D32",
                "&:hover": { bgcolor: "#C8E6C8" },
              }}
              title="Tải hóa đơn PDF"
            >
              <DownloadIcon />
            </IconButton>
          </Grid>
        </Grid>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          <TransactionDetails transaction={transaction} />
          <TransactionFeatures transaction={transaction} />

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadPDF({ stopPropagation: () => {} })}
                sx={{
                  bgcolor: "#81C784",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: "#66BB6A",
                  },
                }}
              >
                Tải hóa đơn PDF
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default TransactionCard;
