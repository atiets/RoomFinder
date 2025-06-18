// utils/pdfUtils.js - Fixed with html2canvas approach
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatCurrency, formatDate, getPaymentMethodText } from './helpers';

export const generateInvoicePDF = async (transaction, currentUser) => {
  try {
    // Tạo HTML content
    const htmlContent = generateInvoiceHTML(transaction, currentUser);
    
    // Tạo container tạm thời
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px'; // A4 width in pixels
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    
    document.body.appendChild(container);
    
    // Chờ một chút để DOM render
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Chụp screenshot
    const canvas = await html2canvas(container, {
      scale: 2, // Tăng chất lượng
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: container.scrollHeight + 40,
      scrollX: 0,
      scrollY: 0
    });
    
    // Xóa container tạm thời
    document.body.removeChild(container);
    
    // Tạo PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Thêm trang đầu tiên
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Thêm các trang tiếp theo nếu cần
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Lưu file
    const fileName = `HoaDon_${transaction.invoiceNumber}_${convertToSimpleText(transaction.packageName)}_${Date.now()}.pdf`;
    pdf.save(fileName);
    
    console.log('✅ PDF Invoice generated:', fileName);
    return true;
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw new Error('Lỗi khi tạo hóa đơn PDF');
  }
};

const generateInvoiceHTML = (transaction, currentUser) => {
  return `
    <div style="width: 750px; font-family: Arial, sans-serif; color: #333; line-height: 1.6; background: white;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4CAF50; padding-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: bold; color: #2E7D32; margin: 0 0 10px 0;">
          PHÒNG TRỌ XINH
        </h1>
        <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 10px 0; color: #333;">
          HÓA ĐƠN THANH TOÁN
        </h2>
        <p style="font-size: 16px; color: #666; margin: 0;">
          Số: ${transaction.invoiceNumber}
        </p>
      </div>
      
      <!-- Company Info -->
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 30px; font-size: 14px; color: #666;">
        <strong style="color: #2E7D32;">Công ty TNHH PHÒNG TRỌ XINH</strong><br>
        Địa chỉ: 01 Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM<br>
        Điện thoại: (+84) 0313-728-397<br>
        Email: PhongTroXinh@gmail.com
      </div>
      
      <!-- Customer Info Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: 600; color: #2E7D32; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E8F5E8;">
          📋 THÔNG TIN KHÁCH HÀNG
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; width: 250px; color: #2E7D32;">
              👤 Tên khách hàng:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${transaction.userName || currentUser?.username || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              📧 Email:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${transaction.userEmail || currentUser?.email || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              📅 Ngày tạo hóa đơn:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${formatDateToVietnamese(new Date())}
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Transaction Info Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: 600; color: #2E7D32; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E8F5E8;">
          💳 THÔNG TIN GIAO DỊCH
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; width: 250px; color: #2E7D32;">
              🔑 Mã giao dịch:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-family: monospace; font-weight: 600;">
              ${transaction.id}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              📅 Ngày giao dịch:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${formatDateToVietnamese(transaction.transactionDate)}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              📦 Gói dịch vụ:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32; font-size: 16px;">
              ${transaction.packageName}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              💰 Phương thức thanh toán:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${getPaymentMethodTextVietnamese(transaction.paymentMethod)}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              ✅ Trạng thái:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #4CAF50; font-weight: 600;">
              Thành công
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              ⏰ Thời gian hiệu lực:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${formatDateToVietnamese(transaction.transactionDate)} - ${formatDateToVietnamese(transaction.expiryDate)}
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Features Section -->
      <div style="margin-bottom: 30px; margin-top: 300px; !important;">
        <h3 style="font-size: 18px; font-weight: 600; color: #2E7D32; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E8F5E8;">
          🎯 TÍNH NĂNG GÓI ${transaction.packageName.toUpperCase()}
        </h3>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50;">
          <ul style="margin: 0; padding-left: 25px; line-height: 2;">
            ${transaction.features.map((feature, index) => `
              <li style="margin-bottom: 8px; font-size: 14px;">
                <strong style="color: #2E7D32;">✓</strong> ${feature}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
      
      <!-- Total Amount Section -->
      <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%); padding: 25px; border-radius: 15px; border: 2px solid #4CAF50; text-align: center;">
          <div style="font-size: 18px; font-weight: 600; color: #2E7D32; margin-bottom: 10px;">
            💰 TỔNG TIỀN THANH TOÁN
          </div>
          <div style="font-size: 32px; font-weight: bold; color: #2E7D32;">
            ${formatCurrency ? formatCurrency(transaction.amount) : `${transaction.amount.toLocaleString('vi-VN')} VNĐ`}
          </div>
          <div style="font-size: 14px; color: #666; margin-top: 5px;">
            (Đã bao gồm VAT)
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #E8F5E8; padding: 20px; border-radius: 8px; margin-top: 40px; border: 2px solid #4CAF50;">
        <div style="text-align: center; font-size: 14px; color: #2E7D32; margin-bottom: 15px;">
          <strong>🙏 Cảm ơn quý khách đã sử dụng dịch vụ của Phòng trọ xinh!</strong>
        </div>
        <div style="text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 15px;">
          📞 Mọi thắc mắc vui lòng liên hệ:<br>
          📧 Email: PhongTroXinh@gmail.com | ☎️ Hotline: (+84) 0313-728-397<br><br>
          <em>Hóa đơn được tạo tự động vào ${formatDateToVietnamese(new Date())}</em>
        </div>
      </div>
      
    </div>
  `;
};

// ⭐ Helper functions với tiếng Việt
const formatDateToVietnamese = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

const getPaymentMethodTextVietnamese = (method) => {
  switch (method) {
    case 'momo': return '📱 Ví MoMo';
    case 'bank_transfer': return '🏦 Chuyển khoản ngân hàng';
    case 'vnpay': return '💳 VNPay';
    case 'zalopay': return '📱 ZaloPay';
    case 'manual': return '💵 Thanh toán thủ công';
    default: return '❓ Khác';
  }
};

const convertToSimpleText = (text) => {
  if (!text) return '';
  
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