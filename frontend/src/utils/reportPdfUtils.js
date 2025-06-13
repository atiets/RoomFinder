// utils/reportPdfUtils.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateRealEstateReportPDF = (chartData) => {
  try {
    const doc = new jsPDF();
    
    // Header
    addReportHeader(doc, chartData);
    
    // Company Info
    addCompanyInfo(doc);
    
    // Overview Information
    const overviewY = addOverviewInfo(doc, chartData);
    
    // Market Analysis
    const analysisY = addMarketAnalysis(doc, chartData, overviewY);
    
    // Price Data Table (nếu có)
    let tableY = analysisY;
    if (chartData.chartData && chartData.chartData.length > 0) {
      tableY = addPriceDataTable(doc, chartData, analysisY);
    }
    
    // Footer
    addReportFooter(doc, tableY);
    
    // Save PDF
    const fileName = `BaoCao_GiaBDS_${convertToSimpleText(chartData.overview.district)}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
    
    console.log('✅ Real Estate Report PDF generated:', fileName);
    return true;
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw new Error('Loi khi tao bao cao PDF');
  }
};

const addReportHeader = (doc, chartData) => {
  doc.setFontSize(20);
  doc.setTextColor(46, 125, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('PHONG TRO XINH', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text('BAO CAO GIA BAT DONG SAN', 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`${convertToSimpleText(chartData.overview.district)}, ${convertToSimpleText(chartData.overview.province)}`, 105, 40, { align: 'center' });
  
  // Line separator
  doc.setDrawColor(129, 199, 132);
  doc.setLineWidth(1);
  doc.line(20, 45, 190, 45);
};

const addCompanyInfo = (doc) => {
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  doc.setFont('helvetica', 'normal');
  doc.text('Cong ty TNHH PHONG TRO XINH', 20, 55);
  doc.text('Dia chi: 01 D. Vo Van Ngan, Linh Chieu, Thu Duc, Ho Chi Minh', 20, 62);
  doc.text('Dien thoai: (+84) 0313-728-397 | Email: PhongTroXinh@gmail.com', 20, 69);
};

const addOverviewInfo = (doc, chartData) => {
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('THONG TIN TONG QUAN', 20, 85);
  
  const overviewData = [
    ['Khu vuc:', `${convertToSimpleText(chartData.overview.district)}, ${convertToSimpleText(chartData.overview.province)}`],
    ['Loai bat dong san:', convertToSimpleText(chartData.overview.category)],
    ['Loai giao dich:', convertToSimpleText(chartData.overview.transactionType)],
    ['Gia trung binh hien tai:', `${chartData.overview.currentPrice} trieu VND/m2`],
    ['Bien dong gia:', `${chartData.overview.priceFluctuation > 0 ? '+' : ''}${chartData.overview.priceFluctuation.toFixed(2)}%`],
    ['Ngay tao bao cao:', formatDateSimple(new Date())],
  ];
  
  autoTable(doc, {
    startY: 90,
    body: overviewData,
    theme: 'plain',
    styles: { 
      fontSize: 10, 
      cellPadding: 3,
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 110 }
    }
  });
  
  return doc.lastAutoTable.finalY;
};

const addMarketAnalysis = (doc, chartData, startY) => {
  const analysisY = startY + 15;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('PHAN TICH THI TRUONG', 20, analysisY);
  
  const analysisData = [
    ['Xu huong gia:', chartData.overview.priceFluctuation > 0 ? 'Tang gia' : chartData.overview.priceFluctuation < 0 ? 'Giam gia' : 'On dinh'],
    ['Muc do bien dong:', Math.abs(chartData.overview.priceFluctuation) > 10 ? 'Cao' : Math.abs(chartData.overview.priceFluctuation) > 5 ? 'Trung binh' : 'Thap'],
    ['Tinh trang thi truong:', chartData.overview.priceFluctuation > 5 ? 'Nong' : chartData.overview.priceFluctuation < -5 ? 'Lanh' : 'On dinh'],
    ['Gia tri dau tu:', chartData.overview.priceFluctuation > 0 ? 'Tich cuc' : 'Can than'],
  ];
  
  autoTable(doc, {
    startY: analysisY + 5,
    body: analysisData,
    theme: 'plain',
    styles: { 
      fontSize: 10, 
      cellPadding: 3,
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 110 }
    }
  });
  
  return doc.lastAutoTable.finalY;
};

const addPriceDataTable = (doc, chartData, startY) => {
  const tableY = startY + 15;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('DU LIEU GIA THEO THOI GIAN', 20, tableY);
  
  const tableHeaders = [['STT', 'Thoi gian', 'Gia TB (trieu VND/m2)']];
  const tableData = chartData.chartData.slice(0, 10).map((item, index) => [
    (index + 1).toString(),
    item.month || item.period || `Thang ${index + 1}`,
    item.averagePrice ? item.averagePrice.toFixed(2) : 'N/A'
  ]);
  
  autoTable(doc, {
    startY: tableY + 5,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    styles: { 
      fontSize: 9, 
      cellPadding: 2,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [129, 199, 132],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 70, halign: 'center' },
      2: { cellWidth: 70, halign: 'right' }
    }
  });
  
  return doc.lastAutoTable.finalY;
};

const addReportFooter = (doc, startY) => {
  const footerY = Math.max(startY + 20, 220);
  
  // Background cho phần footer
  doc.setFillColor(232, 245, 232);
  doc.rect(20, footerY, 170, 20, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(46, 125, 50);
  doc.setFont('helvetica', 'bold'); // ✅ Sửa từ setFontStyle thành setFont
  doc.text('LUU Y:', 25, footerY + 8);
  
  doc.setFont('helvetica', 'normal'); // ✅ Sửa từ setFontStyle thành setFont
  doc.setTextColor(0, 0, 0);
  doc.text('- Bao cao nay chi mang tinh chat tham khao', 25, footerY + 14);
  
  // Footer cuối trang
  const bottomY = footerY + 30;
  doc.setFontSize(9);
  doc.setTextColor(102, 102, 102);
  doc.setFont('helvetica', 'normal');
  doc.text('Cam on quy khach da su dung dich vu phan tich gia cua Phong tro xinh!', 105, bottomY, { align: 'center' });

  const currentTime = formatDateSimple(new Date());
  doc.text(`Bao cao duoc tao vao ${currentTime}`, 105, bottomY + 7, { align: 'center' });
};

// Helper functions
const formatDateSimple = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

const convertToSimpleText = (text) => {
  if (!text) return '';
  
  const map = {
    'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'đ': 'd',
    'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'Á': 'A', 'À': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ắ': 'A', 'Ằ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ấ': 'A', 'Ầ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'Đ': 'D',
    'É': 'E', 'È': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ế': 'E', 'Ề': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Í': 'I', 'Ì': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ó': 'O', 'Ò': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ố': 'O', 'Ồ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ớ': 'O', 'Ờ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ú': 'U', 'Ù': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ứ': 'U', 'Ừ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ý': 'Y', 'Ỳ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y'
  };
  
  return text.replace(/[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]/g, 
    char => map[char] || char);
};