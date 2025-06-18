import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { GetApp } from '@mui/icons-material';
import { generateReportWithCanvas } from '../../../../utils/canvasToPdfGenerator';

const DownloadReportButton = ({ chartData }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!chartData || !chartData.overview) {
      alert('Không có dữ liệu để tạo báo cáo. Vui lòng thử lại.');
      return;
    }

    try {
      setLoading(true);
      
      // Validate required data
      if (!chartData.overview.district || !chartData.overview.province) {
        throw new Error('Thiếu thông tin khu vực');
      }

      // ⭐ SỬ DỤNG HTML2CANVAS + jsPDF
      await generateReportWithCanvas(chartData);
      
      console.log('✅ Báo cáo PDF đã được tạo thành công');
      
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert(`Có lỗi xảy ra khi tạo báo cáo: ${error.message}. Vui lòng thử lại sau.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GetApp />}
      onClick={handleDownload}
      disabled={loading || !chartData}
      className="download-button"
      sx={{
        bgcolor: "#81C784",
        color: "#fff",
        "&:hover": {
          bgcolor: "#66BB6A",
        },
        "&:disabled": {
          bgcolor: "#ccc",
        },
      }}
    >
      {loading ? 'Đang tạo báo cáo...' : 'Tải báo cáo PDF'}
    </Button>
  );
};

export default DownloadReportButton;