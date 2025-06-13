import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Swal from 'sweetalert2';

export const useUsageManager = () => {
  const [currentUsage, setCurrentUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  const accessToken = currentUser?.accessToken || localStorage.getItem('accessToken');

  // API endpoints
  const API_BASE = process.env.REACT_APP_BASE_URL_API || 'http://localhost:8000';

  // Fetch current usage
  const fetchCurrentUsage = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/v1/payments/usage/current`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.data.success) {
        setCurrentUsage(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
      
      // Nếu không tìm thấy subscription, thiết lập gói Free mặc định
      if (error.response?.status === 404 && error.response?.data?.message?.includes("Không tìm thấy gói")) {
        setCurrentUsage({
          planType: 'free',
          planName: 'Gói miễn phí',
          currentUsage: {
            usage: {
              postsCreated: 0, // Giả sử chưa sử dụng tin nào
              vipPostsUsed: 0,
              hiddenPhoneViews: 0
            }
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUsage = async () => {
    console.log('🔄 Refreshing usage data...');
    await fetchCurrentUsage();
  };

  // Check if can perform action
  const checkUsage = async (action) => {
    if (!accessToken) {
      showLoginAlert();
      return { canUse: false };
    }

    // ⭐⭐⭐ XỬ LÝ ĐẶC BIỆT CHO GÓI FREE ⭐⭐⭐
    // Nếu không có currentUsage hoặc currentUsage.success = false,
    // giả định đây là gói Free và tự xử lý logic check quota
    if (!currentUsage || (currentUsage && !currentUsage.currentUsage)) {
      console.log("Xử lý đặc biệt cho gói Free");
      
      // Đối với gói Free
      if (action === 'post') {
        // Giả sử trong gói Free còn quota để đăng tin thường (vì không có dữ liệu thực)
        return { 
          canUse: true, 
          remaining: 3, // Giả định còn 3 tin
          message: "Gói Free: còn lại 3 tin đăng" 
        };
      } else if (action === 'vip_post') {
        // Gói Free không được đăng tin VIP
        showQuotaExhaustedAlert(action, "Gói Free không hỗ trợ đăng tin VIP");
        return { canUse: false };
      }
    }

    try {
      const response = await axios.get(`${API_BASE}/v1/payments/usage/check`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { action }
      });

      if (response.data.success) {
        const { canUse, remaining, message } = response.data.data;
        
        if (!canUse) {
          showQuotaExhaustedAlert(action, message);
          return { canUse: false };
        }
        
        return { canUse: true, remaining, message };
      }
      return { canUse: false };
    } catch (error) {
      console.error('Error checking usage:', error);
      
      // ⭐⭐⭐ XỬ LÝ LỖI 404 - KHÔNG TÌM THẤY GÓI ⭐⭐⭐
      if (error.response?.status === 404 && 
          error.response?.data?.message?.includes("Không tìm thấy gói")) {
        
        console.log("Không tìm thấy gói đăng ký - Xử lý như gói Free");
        
        // Với gói Free
        if (action === 'post') {
          // Cho phép đăng tin thường (giả sử còn 3 lượt)
          return { 
            canUse: true, 
            remaining: 3,
            message: "Gói Free: Còn lại 3 tin đăng" 
          };
        } else if (action === 'vip_post') {
          // Không cho phép đăng tin VIP với gói Free
          showQuotaExhaustedAlert(action, "Gói Free không hỗ trợ đăng tin VIP");
          return { canUse: false };
        }
      }
      
      // Các lỗi khác
      return { canUse: false };
    }
  };

  // Update usage after action
  const updateUsage = async (action) => {
    if (!accessToken) return false;

    // ⭐⭐⭐ XỬ LÝ ĐẶC BIỆT CHO GÓI FREE ⭐⭐⭐
    // Nếu không có currentUsage hoặc là gói free mặc định
    if (!currentUsage || 
        (currentUsage && currentUsage.planType === 'free' && !currentUsage.currentUsage?.usage)) {
      console.log("Bỏ qua cập nhật usage cho gói Free mặc định");
      
      // Không cần cập nhật thực tế với DB, chỉ update state local
      if (action === 'post') {
        setCurrentUsage(prev => ({
          ...prev,
          planType: 'free',
          planName: 'Gói miễn phí',
          currentUsage: {
            usage: {
              postsCreated: (prev?.currentUsage?.usage?.postsCreated || 0) + 1,
              vipPostsUsed: 0,
              hiddenPhoneViews: 0
            }
          }
        }));
      }
      
      return true; // Giả lập thành công
    }

    try {
      console.log(`🔄 Updating usage for action: ${action}`);
      
      const response = await axios.post(`${API_BASE}/v1/payments/usage/update`, 
        { action },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.success) {
        console.log(`Usage updated successfully:`, response.data.data);
        
        await fetchCurrentUsage();
        
        return response.data.data;
      }
      return false;
    } catch (error) {
      console.error('Error updating usage:', error);
      
      // ⭐⭐⭐ XỬ LÝ LỖI 404 - KHÔNG TÌM THẤY GÓI ⭐⭐⭐
      if (error.response?.status === 404 && 
          error.response?.data?.message?.includes("Không tìm thấy gói")) {
        
        console.log("Không tìm thấy gói đăng ký - Bỏ qua cập nhật usage");
        return true; // Coi như thành công cho gói Free
      }
      
      return false;
    }
  };

  // Showp alerts
  const showLoginAlert = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Chưa đăng nhập',
      text: 'Vui lòng đăng nhập để sử dụng tính năng này.',
      confirmButtonText: 'Đăng nhập',
      confirmButtonColor: '#4caf50'
    });
  };

  const showQuotaExhaustedAlert = (action, message) => {
    const actionNames = {
      'post': 'đăng tin thường',
      'vip_post': 'đăng tin VIP',
      'view_phone': 'xem số điện thoại ẩn'
    };

    Swal.fire({
      icon: 'error',
      title: '⚠️ Đã hết quota!',
      html: `
        <div style="text-align: center;">
          <p style="font-size: 16px; margin-bottom: 15px; color: #d32f2f;">${message}</p>
          <p style="color: #666;">Bạn đã sử dụng hết quota <strong>${actionNames[action]}</strong> cho tháng này.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; color: #4caf50; font-weight: bold;">
              💡 Giải pháp:
            </p>
            <ul style="text-align: left; margin: 10px 0; padding-left: 20px; color: #666;">
              <li>🚀 Nâng cấp gói cao hơn</li>
              <li>⏰ Chờ reset quota tháng sau</li>
              <li>💰 Mua thêm quota riêng</li>
            </ul>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '🚀 Nâng cấp gói ngay',
      cancelButtonText: 'Để sau',
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#757575',
      width: '500px'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/subscription';
      }
    });
  };

  // Load usage on mount
  useEffect(() => {
    fetchCurrentUsage();
  }, [accessToken]);

  const shouldShowQuotaWarning = (action) => {
    if (!currentUsage) return false;
    
    const { usage } = currentUsage.currentUsage;
    let remaining = 0;
    
    switch (action) {
      case 'post':
        remaining = usage.postsCreated;
        break;
      case 'vip_post':
        remaining = usage.vipPostsUsed;
        break;
      case 'view_phone':
        remaining = usage.hiddenPhoneViews;
        break;
      default:
        return false;
    }
    
    // Hiển thị warning nếu quota <= 5 và > 0
    return remaining <= 5 && remaining > 0;
  };

  // Show warning alert
  const showQuotaWarning = (action, remaining) => {
    const actionNames = {
      'post': 'đăng tin thường',
      'vip_post': 'đăng tin VIP',
      'view_phone': 'xem số điện thoại'
    };

    Swal.fire({
      icon: 'warning',
      title: '⚠️ Quota sắp hết!',
      html: `
        <div style="text-align: center;">
          <p style="font-size: 16px; margin-bottom: 15px;">
            Bạn chỉ còn <strong style="color: #ff9800;">${remaining} lượt</strong> ${actionNames[action]}
          </p>
          <p style="color: #666;">Nâng cấp gói để có thêm quota và không bị gián đoạn.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '🚀 Nâng cấp ngay',
      cancelButtonText: 'Để sau',
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#757575',
      timer: 5000,
      timerProgressBar: true
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/subscription';
      }
    });
  };

  return {
    currentUsage,
    loading,
    checkUsage,
    updateUsage,
    fetchCurrentUsage,
    refreshUsage,
    showQuotaExhaustedAlert,
    shouldShowQuotaWarning, 
    showQuotaWarning,
  };
};