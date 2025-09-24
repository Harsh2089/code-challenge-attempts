import React from "react";
import { Token } from "../types";
import { Loader2, ArrowRightLeft } from "lucide-react";

interface SwapButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  fromToken: Token | null;
  toToken: Token | null;
}

const SwapButton: React.FC<SwapButtonProps> = ({
  onClick,
  disabled,
  loading,
  fromToken,
  toToken,
}) => {
  const getButtonText = () => {
    if (loading) return "Swapping...";
    if (!fromToken) return "Select a token to swap from";
    if (!toToken) return "Select a token to swap to";
    if (fromToken.symbol === toToken.symbol)
      return "Cannot swap the same token";
    return `Swap ${fromToken.symbol} for ${toToken.symbol}`;
  };

  const getButtonIcon = () => {
    if (loading) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    return <ArrowRightLeft className="w-5 h-5" />;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="swap-button flex items-center justify-center space-x-2"
    >
      {getButtonIcon()}
      <span>{getButtonText()}</span>
    </button>
  );
};

export default SwapButton;
