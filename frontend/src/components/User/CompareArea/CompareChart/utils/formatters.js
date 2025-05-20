// Format số thành dạng tiền tệ
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0';
  return parseFloat(value).toLocaleString('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Format phần trăm
export const formatPercent = (value) => {
  if (value === null || value === undefined) return '0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${parseFloat(value).toFixed(2)}%`;
};
