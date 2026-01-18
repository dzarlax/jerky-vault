// Helper functions for contact links
// Centralized logic for generating social media and contact links

/**
 * Generate Telegram link from username
 */
export const getTelegramLink = (username: string): string => {
  const cleanUsername = username.replace('@', '');
  return `https://t.me/${cleanUsername}`;
};

/**
 * Generate Instagram link from username
 */
export const getInstagramLink = (username: string): string => {
  const cleanUsername = username.replace('@', '');
  return `https://instagram.com/${cleanUsername}`;
};

/**
 * Generate phone link (tel:)
 */
export const getPhoneLink = (phone: string): string => {
  return `tel:${phone}`;
};

/**
 * Generate Google Maps link from address
 */
export const getMapLink = (address: string): string => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};

/**
 * Format comment text with truncation
 */
export const formatComment = (comment: string, maxLength: number = 50): string => {
  if (!comment || comment.trim() === '') return '-';
  return comment.length > maxLength
    ? `${comment.substring(0, maxLength - 3)}...`
    : comment;
};

/**
 * Format date to locale string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
};
