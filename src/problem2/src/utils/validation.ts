import { ValidationError, SwapFormData } from "../types";

export const validateAmount = (
  amount: string,
  token: any
): ValidationError | null => {
  if (!amount || amount.trim() === "") {
    return { field: "amount", message: "Amount is required" };
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { field: "amount", message: "Invalid amount format" };
  }

  if (numAmount <= 0) {
    return { field: "amount", message: "Amount must be greater than 0" };
  }

  if (numAmount > 1000000) {
    return { field: "amount", message: "Amount too large" };
  }

  return null;
};

export const validateSwapForm = (formData: SwapFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!formData.fromToken) {
    errors.push({
      field: "fromToken",
      message: "Please select a token to swap from",
    });
  }

  if (!formData.toToken) {
    errors.push({
      field: "toToken",
      message: "Please select a token to swap to",
    });
  }

  if (
    formData.fromToken &&
    formData.toToken &&
    formData.fromToken.symbol === formData.toToken.symbol
  ) {
    errors.push({ field: "tokens", message: "Cannot swap the same token" });
  }

  if (formData.fromAmount) {
    const amountError = validateAmount(formData.fromAmount, formData.fromToken);
    if (amountError) {
      errors.push(amountError);
    }
  }

  return errors;
};

export const formatCurrency = (
  amount: number,
  decimals: number = 2
): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(amount);
};

export const formatTokenAmount = (amount: string, decimals: number): string => {
  const num = parseFloat(amount);
  if (isNaN(num)) return "0";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};
