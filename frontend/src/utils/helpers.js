// utils/helpers.js
import { PACKAGE_COLORS, PAYMENT_ICONS, PAYMENT_TEXTS, AVATAR_ICONS } from '../constants/transactionConstants';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getPackageColor = (packageType) => {
  return PACKAGE_COLORS[packageType] || PACKAGE_COLORS.free;
};

export const getPaymentIcon = (method) => {
  return PAYMENT_ICONS[method] || '💰';
};

export const getPaymentMethodText = (method) => {
  return PAYMENT_TEXTS[method] || 'Khác';
};

export const getAvatarIcon = (packageType) => {
  return AVATAR_ICONS[packageType] || '📦';
};

export const formatUsageDisplay = (usage) => {
  return usage === 999999 ? "∞" : usage || 0;
};

export const isExpired = (expiryDate) => {
  return new Date(expiryDate) <= new Date();
};
