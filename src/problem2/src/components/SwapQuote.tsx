import React from "react";
import { Token, PriceData } from "../types";
import { calculateExchangeRate, calculatePriceImpact } from "../utils/api";
import { formatCurrency, formatTokenAmount } from "../utils/validation";
import { TrendingUp, Clock, Shield, Info } from "lucide-react";

interface SwapQuoteProps {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  prices: PriceData;
  slippage: number;
}

const SwapQuote: React.FC<SwapQuoteProps> = ({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  prices,
  slippage,
}) => {
  const exchangeRate = calculateExchangeRate(fromToken, toToken, prices);
  const priceImpact = calculatePriceImpact(
    fromAmount,
    toAmount,
    fromToken,
    toToken,
    prices
  );
  const minimumReceived = parseFloat(toAmount) * (1 - slippage / 100);
  const fee = parseFloat(fromAmount) * 0.003; // 0.3% fee

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return "text-green-600";
    if (impact < 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriceImpactText = (impact: number) => {
    if (impact < 1) return "Low";
    if (impact < 3) return "Medium";
    return "High";
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-4 animate-slide-up">
      <div className="space-y-3">
        {/* Exchange Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Exchange Rate</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            1 {fromToken.symbol} ={" "}
            {formatTokenAmount(exchangeRate.toString(), toToken.decimals)}{" "}
            {toToken.symbol}
          </div>
        </div>

        {/* Price Impact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Price Impact</span>
          </div>
          <div
            className={`text-sm font-medium ${getPriceImpactColor(
              priceImpact
            )}`}
          >
            {priceImpact.toFixed(2)}% ({getPriceImpactText(priceImpact)})
          </div>
        </div>

        {/* Minimum Received */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Minimum Received</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {formatTokenAmount(minimumReceived.toString(), toToken.decimals)}{" "}
            {toToken.symbol}
          </div>
        </div>

        {/* Fee */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Trading Fee</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {formatTokenAmount(fee.toString(), fromToken.decimals)}{" "}
            {fromToken.symbol}
          </div>
        </div>

        {/* Slippage Tolerance */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Slippage Tolerance</span>
          <div className="text-sm font-medium text-gray-900">{slippage}%</div>
        </div>

        {/* USD Values */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">From Amount (USD)</span>
            <div className="text-sm font-medium text-gray-900">
              $
              {formatCurrency(
                parseFloat(fromAmount) * (prices[fromToken.symbol] || 0)
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">To Amount (USD)</span>
            <div className="text-sm font-medium text-gray-900">
              $
              {formatCurrency(
                parseFloat(toAmount) * (prices[toToken.symbol] || 0)
              )}
            </div>
          </div>
        </div>

        {/* Warning for high price impact */}
        {priceImpact > 3 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">High Price Impact</p>
                <p>
                  This trade will have a significant price impact. Consider
                  reducing the trade size.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapQuote;
