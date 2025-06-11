// utils/apiUtils.js
import { getTransactionHistory } from '../redux/subscriptionAPI';

export const fetchTransactionData = async (userId, token) => {
  if (!userId || !token) {
    throw new Error('Không tìm thấy thông tin người dùng');
  }

  try {
    const response = await getTransactionHistory(userId, token);
    
    if (response.success) {
      return {
        transactions: response.data.transactions,
        stats: response.data.stats
      };
    } else {
      throw new Error(response.message || 'Lỗi khi tải dữ liệu');
    }
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw new Error('Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.');
  }
};