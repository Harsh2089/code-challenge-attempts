import React, { useState, useRef, useEffect } from "react";
import { Token, PriceData } from "../types";
import { formatCurrency } from "../utils/validation";
import { ChevronDown, Search, X } from "lucide-react";

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  tokens: Token[];
  prices: PriceData;
  error?: string;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  tokens,
  prices,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTokenClick = (token: Token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTokenSelect(null as any);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full token-button ${selectedToken ? "selected" : ""} ${
          error ? "border-red-300 bg-red-50" : ""
        }`}
      >
        <div className="flex items-center space-x-3 flex-1">
          {selectedToken ? (
            <>
              <img
                src={selectedToken.icon}
                alt={selectedToken.symbol}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/vite.svg";
                }}
              />
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">
                  {selectedToken.symbol}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedToken.name}
                </div>
              </div>
              {prices[selectedToken.symbol] && (
                <div className="text-sm text-gray-600">
                  ${formatCurrency(prices[selectedToken.symbol])}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 text-left text-gray-500">Select a token</div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {selectedToken && (
            <button
              onClick={handleClearSelection}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredTokens.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => handleTokenClick(token)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={token.icon}
                    alt={token.symbol}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/vite.svg";
                    }}
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                  {prices[token.symbol] && (
                    <div className="text-sm text-gray-600">
                      ${formatCurrency(prices[token.symbol])}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 animate-slide-up">{error}</p>
      )}
    </div>
  );
};

export default TokenSelector;
