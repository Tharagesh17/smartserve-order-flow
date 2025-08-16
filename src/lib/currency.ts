// Currency formatting utilities for Indian Rupees

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${amount.toFixed(2)}`;
  }
};

export const formatCurrencyWithSymbol = (amount: number, symbol: string = '₹'): string => {
  return `${symbol}${amount.toFixed(2)}`;
};

// Convert USD to INR (you can update this rate or make it dynamic)
export const convertUSDToINR = (usdAmount: number, exchangeRate: number = 83.5): number => {
  return usdAmount * exchangeRate;
};
