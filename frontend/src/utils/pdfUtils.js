// utils/pdfUtils.js - Fixed font issues
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate, getPaymentMethodText } from './helpers';

export const generateInvoicePDF = (transaction, currentUser) => {
  try {
    const doc = new jsPDF();
    
    doc.setFont('helvetica', 'normal');
    
    // Header
    addHeader(doc, transaction);
    
    // Company Info
    addCompanyInfo(doc);
    
    // Customer Info
    const customerY = addCustomerInfo(doc, transaction, currentUser);
    
    // Transaction Info
    const transactionY = addTransactionInfo(doc, transaction, customerY);
    
    // Features
    const featuresY = addFeatures(doc, transaction, transactionY);
    
    // Total Amount
    const totalY = addTotalAmount(doc, transaction, featuresY);
    
    // Footer
    addFooter(doc, totalY);
    
    // Save PDF
    const fileName = `HoaDon_${transaction.invoiceNumber}_${transaction.packageName}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF Invoice generated:', fileName);
    return true;
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw new Error('Lỗi khi tạo hóa đơn PDF');
  }
};

const addHeader = (doc, transaction) => {
  doc.setFontSize(20);
  doc.setTextColor(46, 125, 50);
  doc.text('ROOMFINDER', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('HOA DON THANH TOAN', 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`So: ${transaction.invoiceNumber}`, 105, 40, { align: 'center' });
  
  // Line separator
  doc.setDrawColor(129, 199, 132);
  doc.setLineWidth(1);
  doc.line(20, 45, 190, 45);
};

const addCompanyInfo = (doc) => {
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  doc.text('Cong ty TNHH PHONG TRO XINH', 20, 55);
  doc.text('Dia chi: 01 D. Vo Van Ngan, Linh Chieu, Thu Duc, Ho Chi Minh', 20, 62);
  doc.text('Dien thoai: (+84) 0313-728-397 | Email: PhongTroXinh@gmail.com', 20, 69);
};

const addCustomerInfo = (doc, transaction, currentUser) => {
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('THONG TIN KHACH HANG', 20, 85);
  
  const customerData = [
    ['Ten khach hang:', transaction.userName || currentUser?.username || 'N/A'],
    ['Email:', transaction.userEmail || currentUser?.email || 'N/A'],
    ['Ngay tao hoa don:', formatDateSimple(new Date())],
  ];
  
  autoTable(doc, {
    startY: 90,
    body: customerData,
    theme: 'plain',
    styles: { 
      fontSize: 10, 
      cellPadding: 2,
      font: 'helvetica' // ⭐ Specify font for table
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 120 }
    }
  });
  
  return doc.lastAutoTable.finalY;
};

const addTransactionInfo = (doc, transaction, startY) => {
  const finalY = startY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('THONG TIN GIAO DICH', 20, finalY);
  
  const transactionData = [
    ['Ma giao dich:', transaction.id],
    ['Ngay giao dich:', formatDateSimple(transaction.transactionDate)],
    ['Goi dich vu:', transaction.packageName],
    ['Phuong thuc thanh toan:', getPaymentMethodTextSimple(transaction.paymentMethod)],
    ['Trang thai:', 'Thanh cong'],
    ['Thoi gian hieu luc:', `${formatDateSimple(transaction.transactionDate)} - ${formatDateSimple(transaction.expiryDate)}`],
  ];
  
  autoTable(doc, {
    startY: finalY + 5,
    body: transactionData,
    theme: 'plain',
    styles: { 
      fontSize: 10, 
      cellPadding: 2,
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 110 }
    }
  });
  
  return doc.lastAutoTable.finalY;
};

const addFeatures = (doc, transaction, startY) => {
  const featuresY = startY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`TINH NANG GOI ${transaction.packageName.toUpperCase()}`, 20, featuresY);
  
  const featuresData = transaction.features.map((feature, index) => [
    `${index + 1}.`, convertToSimpleText(feature)
  ]);
  
  autoTable(doc, {
    startY: featuresY + 5,
    body: featuresData,
    theme: 'plain',
    styles: { 
      fontSize: 9, 
      cellPadding: 2,
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 15 },
      1: { cellWidth: 155 }
    }
  });
  
  return doc.lastAutoTable.finalY;
};

const addTotalAmount = (doc, transaction, startY) => {
  const totalY = startY + 10;
  doc.setFillColor(232, 245, 232);
  doc.rect(20, totalY, 170, 15, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(46, 125, 50);
  doc.text('TONG TIEN:', 25, totalY + 10);
  doc.text(formatCurrency(transaction.amount), 165, totalY + 10, { align: 'right' });
  
  return totalY;
};

const addFooter = (doc, totalY) => {
  const footerY = totalY + 30;
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  doc.text('Cam on quy khach da su dung dich vu cua Phong tro xinh!', 105, footerY, { align: 'center' });
  doc.text('Moi thac mac vui long lien he: PhongTroXinh@gmail.com | (+84) 0313-728-397', 105, footerY + 7, { align: 'center' });

  const currentTime = formatDateSimple(new Date());
  doc.text(`Hoa don duoc tao tu dong vao ${currentTime}`, 105, footerY + 14, { align: 'center' });
};

// ⭐ Helper functions for simple text
const formatDateSimple = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

const getPaymentMethodTextSimple = (method) => {
  switch (method) {
    case 'momo': return 'Vi MoMo';
    case 'bank_transfer': return 'Chuyen khoan ngan hang';
    case 'vnpay': return 'VNPay';
    case 'zalopay': return 'ZaloPay';
    case 'manual': return 'Thanh toan thu cong';
    default: return 'Khac';
  }
};

const convertToSimpleText = (text) => {
  // Convert Vietnamese diacritics to simple text
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
    'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y'
  };
  
  return text.replace(/[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/g, 
    char => map[char] || char);
};