import { PriceData, Token } from "../types";

const PRICES_API_URL = "https://interview.switcheo.com/prices.json";
const TOKEN_ICON_BASE_URL =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

// Popular tokens with their configurations
export const POPULAR_TOKENS: Token[] = [
  {
    symbol: "SWTH",
    name: "Switcheo Token",
    icon: `${TOKEN_ICON_BASE_URL}/SWTH.svg`,
    decimals: 8,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: `${TOKEN_ICON_BASE_URL}/USDC.svg`,
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    icon: `${TOKEN_ICON_BASE_URL}/USDT.svg`,
    decimals: 6,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: `${TOKEN_ICON_BASE_URL}/ETH.svg`,
    decimals: 18,
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: `${TOKEN_ICON_BASE_URL}/BTC.svg`,
    decimals: 8,
  },
  {
    symbol: "NEO",
    name: "NEO",
    icon: `${TOKEN_ICON_BASE_URL}/NEO.svg`,
    decimals: 8,
  },
  {
    symbol: "GAS",
    name: "GAS",
    icon: `${TOKEN_ICON_BASE_URL}/GAS.svg`,
    decimals: 8,
  },
  {
    symbol: "BNB",
    name: "Binance Coin",
    icon: `${TOKEN_ICON_BASE_URL}/BNB.svg`,
    decimals: 18,
  },
];

export const fetchPrices = async (): Promise<PriceData> => {
  try {
    console.log("Fetching prices from:", PRICES_API_URL);
    const response = await fetch(PRICES_API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch prices");
    }
    const priceData = await response.json();
    console.log("Fetched price data:", priceData);

    // Handle array of objects format
    if (Array.isArray(priceData)) {
      const priceMap: PriceData = {};
      priceData.forEach((item: any) => {
        // Try different possible property names
        const currency =
          item.currency || item.symbol || item.token || item.name;
        const price = item.price || item.value || item.rate || item.usd;

        if (currency && typeof price === "number") {
          priceMap[currency.toUpperCase()] = price;
          console.log(`Added price: ${currency.toUpperCase()} = $${price}`);
        } else {
          console.log("Skipping item:", item);
        }
      });
      console.log("Converted to price map:", priceMap);
      return priceMap;
    }

    // Handle object format (fallback)
    return priceData;
  } catch (error) {
    console.error("Error fetching prices:", error);
    console.log("Using fallback mock prices");
    // Return mock prices for development
    return {
      SWTH: 0.05,
      USDC: 1.0,
      USDT: 1.0,
      ETH: 2000,
      BTC: 45000,
      NEO: 15,
      GAS: 5,
      BNB: 300,
    };
  }
};

export const getTokenIconUrl = (symbol: string): string => {
  return `${TOKEN_ICON_BASE_URL}/${symbol.toUpperCase()}.svg`;
};

export const calculateExchangeRate = (
  fromToken: Token,
  toToken: Token,
  prices: PriceData
): number => {
  const fromPrice = prices[fromToken.symbol] || 0;
  const toPrice = prices[toToken.symbol] || 0;

  if (fromPrice === 0 || toPrice === 0) return 0;

  return fromPrice / toPrice;
};

export const calculateSwapAmount = (
  fromAmount: string,
  fromToken: Token,
  toToken: Token,
  prices: PriceData
): string => {
  if (!fromAmount || fromAmount === "0") return "0";

  const fromPrice = prices[fromToken.symbol] || 0;
  const toPrice = prices[toToken.symbol] || 0;

  console.log(
    `Calculating swap: ${fromAmount} ${fromToken.symbol} to ${toToken.symbol}`
  );
  console.log(
    `Prices: ${fromToken.symbol}=$${fromPrice}, ${toToken.symbol}=$${toPrice}`
  );

  if (fromPrice === 0 || toPrice === 0) {
    console.log("Missing price data, returning 0");
    return "0";
  }

  const exchangeRate = fromPrice / toPrice;
  const amount = parseFloat(fromAmount);
  const result = amount * exchangeRate;

  console.log(`Exchange rate: ${exchangeRate}, Result: ${result}`);

  return result.toFixed(toToken.decimals);
};

export const calculatePriceImpact = (
  fromAmount: string,
  toAmount: string,
  fromToken: Token,
  toToken: Token,
  prices: PriceData
): number => {
  const exchangeRate = calculateExchangeRate(fromToken, toToken, prices);
  const actualRate = parseFloat(toAmount) / parseFloat(fromAmount);

  if (exchangeRate === 0) return 0;

  return Math.abs((actualRate - exchangeRate) / exchangeRate) * 100;
};
