import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateReportWithCanvas = async (chartData) => {
  try {
    // Tạo HTML content
    const htmlContent = generateHTMLContent(chartData);
    
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
    const fileName = `BaoCao_GiaBDS_${Date.now()}.pdf`;
    pdf.save(fileName);
    
    console.log('✅ PDF đã được tạo thành công:', fileName);
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo PDF:', error);
    throw new Error('Lỗi khi tạo báo cáo PDF');
  }
};

const generateHTMLContent = (chartData) => {
  return `
    <div style="width: 750px; font-family: Arial, sans-serif; color: #333; line-height: 1.6; background: white;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4CAF50; padding-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: bold; color: #2E7D32; margin: 0 0 10px 0;">
          PHÒNG TRỌ XINH
        </h1>
        <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 10px 0; color: #333;">
          BÁO CÁO GIÁ BẤT ĐỘNG SẢN
        </h2>
        <p style="font-size: 16px; color: #666; margin: 0;">
          ${chartData.overview.district}, ${chartData.overview.province}
        </p>
      </div>
      
      <!-- Company Info -->
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 30px; font-size: 14px; color: #666;">
        <strong style="color: #2E7D32;">Công ty TNHH PHÒNG TRỌ XINH</strong><br>
        Địa chỉ: 01 Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM<br>
        Điện thoại: (+84) 0313-728-397<br>
        Email: PhongTroXinh@gmail.com
      </div>
      
      <!-- Overview Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: 600; color: #2E7D32; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E8F5E8;">
          THÔNG TIN TỔNG QUAN
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; width: 250px; color: #2E7D32;">
              Khu vực:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${chartData.overview.district}, ${chartData.overview.province}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              Loại bất động sản:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${chartData.overview.category}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              Loại giao dịch:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${chartData.overview.transactionType}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              Giá trung bình hiện tại:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #2E7D32; font-weight: 600; font-size: 16px;">
              ${chartData.overview.currentPrice} triệu VNĐ/m²
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              Biến động giá:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; font-size: 16px; color: ${chartData.overview.priceFluctuation > 0 ? '#4CAF50' : chartData.overview.priceFluctuation < 0 ? '#f44336' : '#FF9800'};">
              ${chartData.overview.priceFluctuation > 0 ? '+' : ''}${chartData.overview.priceFluctuation.toFixed(2)}%
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              Ngày tạo báo cáo:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${new Date().toLocaleString('vi-VN')}
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Market Analysis -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: 600; color: #2E7D32; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E8F5E8;">
          PHÂN TÍCH THỊ TRƯỜNG
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; width: 250px; color: #2E7D32;">
              Xu hướng giá:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600;">
              ${chartData.overview.priceFluctuation > 0 ? '📈 Tăng giá' : chartData.overview.priceFluctuation < 0 ? '📉 Giảm giá' : '➡️ Ổn định'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              Mức độ biến động:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${Math.abs(chartData.overview.priceFluctuation) > 10 ? '🔴 Cao' : Math.abs(chartData.overview.priceFluctuation) > 5 ? '🟡 Trung bình' : '🟢 Thấp'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              Tình trạng thị trường:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              ${chartData.overview.priceFluctuation > 5 ? '🔥 Nóng' : chartData.overview.priceFluctuation < -5 ? '❄️ Lạnh' : '⚖️ Ổn định'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #2E7D32;">
              Giá trị đầu tư:
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600;">
              ${chartData.overview.priceFluctuation > 0 ? '✅ Tích cực' : '⚠️ Cần thận trọng'}
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Price Data Table -->
      ${chartData.chartData && chartData.chartData.length > 0 ? `
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: 600; color: #2E7D32; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E8F5E8;">
          DỮ LIỆU GIÁ THEO THỜI GIAN
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #4CAF50; color: white;">
              <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: 600;">STT</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: 600;">Thời gian</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: 600;">Giá TB (triệu VNĐ/m²)</th>
            </tr>
          </thead>
          <tbody>
            ${chartData.chartData.slice(0, 10).map((item, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${item.month || item.period || `Tháng ${index + 1}`}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: 600;">${item.averagePrice ? item.averagePrice.toFixed(2) : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      <!-- Footer -->
      <div style="background: #E8F5E8; padding: 20px; border-radius: 8px; margin-top: 200px; !important">
        <h4 style="font-weight: 600; color: #2E7D32; margin: 0 0 10px 0;">⚠️ LƯU Ý:</h4>
        <ul style="margin: 0 0 20px 20px; padding: 0;">
          <li style="margin-bottom: 5px;">Báo cáo này chỉ mang tính chất tham khảo</li>
          <li style="margin-bottom: 5px;">Giá cả có thể thay đổi theo thời gian thực</li>
          <li>Dữ liệu được thu thập từ các nguồn công khai</li>
        </ul>
        
        <div style="text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 15px;">
          <strong>Cảm ơn quý khách đã sử dụng dịch vụ phân tích giá của Phòng trọ xinh!</strong><br>
          Báo cáo được tạo vào: ${new Date().toLocaleString('vi-VN')}<br>
          Website: phongtro-xinh.com | Hotline: (+84) 0313-728-397
        </div>
      </div>
      
    </div>
  `;
};