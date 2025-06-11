// constants/transactionConstants.js
export const PACKAGE_TYPES = {
  PRO: 'pro',
  PLUS: 'plus',
  FREE: 'free'
};

export const PACKAGE_COLORS = {
  [PACKAGE_TYPES.PRO]: '#81C784',
  [PACKAGE_TYPES.PLUS]: '#FFB74D',
  [PACKAGE_TYPES.FREE]: '#90A4AE'
};

export const PAYMENT_METHODS = {
  MOMO: 'momo',
  BANK_TRANSFER: 'bank_transfer',
  VNPAY: 'vnpay',
  ZALOPAY: 'zalopay',
  MANUAL: 'manual'
};

export const PAYMENT_ICONS = {
  [PAYMENT_METHODS.MOMO]: '📱',
  [PAYMENT_METHODS.BANK_TRANSFER]: '🏦',
  [PAYMENT_METHODS.VNPAY]: '💳',
  [PAYMENT_METHODS.ZALOPAY]: '💰'
};

export const PAYMENT_TEXTS = {
  [PAYMENT_METHODS.MOMO]: 'Ví MoMo',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
  [PAYMENT_METHODS.VNPAY]: 'VNPay',
  [PAYMENT_METHODS.ZALOPAY]: 'ZaloPay',
  [PAYMENT_METHODS.MANUAL]: 'Thanh toán thủ công'
};

export const AVATAR_ICONS = {
  [PACKAGE_TYPES.PRO]: '⭐',
  [PACKAGE_TYPES.PLUS]: '🔥',
  [PACKAGE_TYPES.FREE]: '📦'
};