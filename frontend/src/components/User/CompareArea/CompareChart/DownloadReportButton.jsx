import React from 'react';
import { Button } from '@mui/material';
import { GetApp } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const DownloadReportButton = ({ chartData }) => {
//   const handleDownload = async () => {
//     try {
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const elements = document.querySelectorAll('.chart-paper, .overview-dashboard');
//       let yOffset = 20;
      
//       // Thêm tiêu đề
//       pdf.setFontSize(18);
//       pdf.text(
//         `Báo cáo giá BĐS: ${chartData.overview.district}, ${chartData.overview.province}`, 
//         20, 
//         yOffset
//       );
//       yOffset += 10;
      
//       // Thêm thông tin cơ bản
//       pdf.setFontSize(12);
//       pdf.text(`Loại BĐS: ${chartData.overview.category}`, 20, yOffset += 8);
//       pdf.text(`Loại giao dịch: ${chartData.overview.transactionType}`, 20, yOffset += 6);
//       pdf.text(`Giá trung bình: ${chartData.overview.currentPrice} triệu/m²`, 20, yOffset += 6);
//       pdf.text(`Biến động giá: ${chartData.overview.priceFluctuation.toFixed(2)}%`, 20, yOffset += 6);
//       yOffset += 10;
      
//       // Chuyển từng phần thành hình ảnh và thêm vào PDF
//       for (const element of elements) {
//         const canvas = await html2canvas(element, { scale: 2 });
//         const imgData = canvas.toDataURL('image/png');
        
//         // Tính toán chiều rộng để giữ tỷ lệ
//         const imgWidth = 170;
//         const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
//         // Kiểm tra nếu cần thêm trang mới
//         if (yOffset + imgHeight > 280) {
//           pdf.addPage();
//           yOffset = 20;
//         }
        
//         pdf.addImage(imgData, 'PNG', 20, yOffset, imgWidth, imgHeight);
//         yOffset += imgHeight + 10;
//       }
      
//       // Thêm thông tin cuối trang
//       pdf.setFontSize(10);
//       pdf.text(`Trích xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`, 20, 285);
      
//       // Tải xuống PDF
//       pdf.save(`bao-cao-gia-bds-${chartData.overview.district}-${new Date().getTime()}.pdf`);
      
//     } catch (error) {
//       console.error('Lỗi khi xuất PDF:', error);
//       alert('Có lỗi xảy ra khi tạo báo cáo. Vui lòng thử lại sau.');
//     }
//   };

  return (
    <Button
      variant="contained"
      startIcon={<GetApp />}
    //   onClick={handleDownload}
      className="download-button"
    >
      Tải báo cáo PDF
    </Button>
  );
};

export default DownloadReportButton;