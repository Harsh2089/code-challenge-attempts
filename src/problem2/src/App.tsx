import React, { useState, useEffect, useCallback } from "react";
import { SwapFormData, Token, PriceData, ValidationError } from "./types";
import { fetchPrices, POPULAR_TOKENS, calculateSwapAmount } from "./utils/api";
import { validateSwapForm } from "./utils/validation";
import TokenSelector from "./components/TokenSelector";
import SwapInput from "./components/SwapInput";
import SwapButton from "./components/SwapButton";
import SwapQuote from "./components/SwapQuote";
import { ArrowUpDown, RefreshCw } from "lucide-react";

const App: React.FC = () => {
  const [formData, setFormData] = useState<SwapFormData>({
    fromToken: null,
    toToken: null,
    fromAmount: "",
    toAmount: "",
    slippage: 0.5,
  });

  const [prices, setPrices] = useState<PriceData>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  // Fetch prices on component mount
  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true);
      try {
        const priceData = await fetchPrices();
        setPrices(priceData);
        setLastUpdate(new Date());
      } catch (error) {
        console.error("Failed to load prices:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, []);

  // Calculate toAmount when fromAmount or tokens change
  useEffect(() => {
    console.log("Price data:", prices);
    console.log("Form data:", formData);

    if (formData.fromToken && formData.toToken && formData.fromAmount) {
      const calculatedAmount = calculateSwapAmount(
        formData.fromAmount,
        formData.fromToken,
        formData.toToken,
        prices
      );
      console.log("Calculated amount:", calculatedAmount);
      setFormData((prev) => ({ ...prev, toAmount: calculatedAmount }));
    } else {
      setFormData((prev) => ({ ...prev, toAmount: "" }));
    }
  }, [formData.fromToken, formData.toToken, formData.fromAmount, prices]);

  // Validate form whenever formData changes
  useEffect(() => {
    const validationErrors = validateSwapForm(formData);
    setErrors(validationErrors);
  }, [formData]);

  const handleTokenSelect = useCallback(
    (field: "fromToken" | "toToken", token: Token) => {
      setFormData((prev) => ({
        ...prev,
        [field]: token,
      }));
    },
    []
  );

  const handleAmountChange = useCallback(
    (field: "fromAmount" | "toAmount", value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSwapTokens = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }));
  }, []);

  const handleRefreshPrices = useCallback(async () => {
    setLoading(true);
    try {
      const priceData = await fetchPrices();
      setPrices(priceData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to refresh prices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (errors.length > 0) return;

    setIsSubmitting(true);

    // Simulate API call with loading delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Reset form after successful swap
    setFormData({
      fromToken: null,
      toToken: null,
      fromAmount: "",
      toAmount: "",
      slippage: 0.5,
    });

    setIsSubmitting(false);
  }, [errors]);

  const canSwap =
    errors.length === 0 &&
    formData.fromToken &&
    formData.toToken &&
    formData.fromAmount;

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Currency Swap</h1>
          <p className="text-white/80">Exchange tokens instantly</p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <button
              onClick={handleRefreshPrices}
              disabled={loading}
              className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="text-sm">
                {loading ? "Updating..." : "Refresh Prices"}
              </span>
            </button>
            <span className="text-white/60 text-sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Swap Card */}
        <div className="swap-card animate-fade-in">
          {/* From Token */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="space-y-2">
              <TokenSelector
                selectedToken={formData.fromToken}
                onTokenSelect={(token) => handleTokenSelect("fromToken", token)}
                tokens={POPULAR_TOKENS}
                prices={prices}
                error={errors.find((e) => e.field === "fromToken")?.message}
              />
              <SwapInput
                value={formData.fromAmount}
                onChange={(value) => handleAmountChange("fromAmount", value)}
                token={formData.fromToken}
                placeholder="0.0"
                error={errors.find((e) => e.field === "amount")?.message}
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-4">
            <button
              onClick={handleSwapTokens}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors border-2 border-white shadow-lg"
              aria-label="Swap tokens"
            >
              <ArrowUpDown className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* To Token */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="space-y-2">
              <TokenSelector
                selectedToken={formData.toToken}
                onTokenSelect={(token) => handleTokenSelect("toToken", token)}
                tokens={POPULAR_TOKENS}
                prices={prices}
                error={errors.find((e) => e.field === "toToken")?.message}
              />
              <SwapInput
                value={formData.toAmount}
                onChange={(value) => handleAmountChange("toAmount", value)}
                token={formData.toToken}
                placeholder="0.0"
                readOnly
                error={errors.find((e) => e.field === "tokens")?.message}
              />
            </div>
          </div>

          {/* Swap Quote */}
          {formData.fromToken &&
            formData.toToken &&
            formData.fromAmount &&
            formData.toAmount && (
              <SwapQuote
                fromToken={formData.fromToken}
                toToken={formData.toToken}
                fromAmount={formData.fromAmount}
                toAmount={formData.toAmount}
                prices={prices}
                slippage={formData.slippage}
              />
            )}

          {/* Submit Button */}
          <SwapButton
            onClick={handleSubmit}
            disabled={!canSwap || isSubmitting}
            loading={isSubmitting}
            fromToken={formData.fromToken}
            toToken={formData.toToken}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">Powered by Switcheo Protocol</p>
        </div>
      </div>
    </div>
  );
};

export default App;
