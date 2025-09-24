import React from "react";
import { Token } from "../types";
import { formatTokenAmount } from "../utils/validation";

interface SwapInputProps {
  value: string;
  onChange: (value: string) => void;
  token: Token | null;
  placeholder?: string;
  readOnly?: boolean;
  error?: string;
}

const SwapInput: React.FC<SwapInputProps> = ({
  value,
  onChange,
  token,
  placeholder = "0.0",
  readOnly = false,
  error,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow only numbers and decimal point
    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  const handleMaxClick = () => {
    if (token) {
      // Simulate max balance (in real app, this would come from user's wallet)
      const maxBalance = "1000.0";
      onChange(maxBalance);
    }
  };

  const formatValue = (val: string) => {
    if (!val || val === "0") return "";
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return formatTokenAmount(val, token?.decimals || 8);
  };

  return (
    <div className="relative">
      <div
        className={`relative rounded-xl border-2 transition-all duration-200 ${
          error
            ? "border-red-300 bg-red-50"
            : readOnly
            ? "border-gray-200 bg-gray-50"
            : "border-gray-200 bg-white hover:border-primary-300 focus-within:border-primary-500"
        }`}
      >
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`input-field ${readOnly ? "cursor-not-allowed" : ""}`}
          style={{ paddingRight: token ? "120px" : "16px" }}
        />

        {token && !readOnly && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <button
              type="button"
              onClick={handleMaxClick}
              className="px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
            >
              MAX
            </button>
            <div className="text-sm text-gray-500">{token.symbol}</div>
          </div>
        )}

        {token && readOnly && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            {token.symbol}
          </div>
        )}
      </div>

      {/* Formatted value display */}
      {value && token && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          ≈ {formatValue(value)} {token.symbol}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 animate-slide-up">{error}</p>
      )}
    </div>
  );
};

export default SwapInput;
