/**
 * Count words in a string
 */
export const countWords = (text: string): number => {
  if (!text || text.trim() === '') return 0;
  return text.trim().split(/\s+/).length;
};

/**
 * Count characters in a string
 */
export const countCharacters = (text: string): number => {
  return text.length;
};

/**
 * Format a large number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};