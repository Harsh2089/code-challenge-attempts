export interface Token {
  symbol: string;
  name: string;
  icon: string;
  price?: number;
  decimals: number;
}

export interface SwapFormData {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  slippage: number;
}

export interface PriceData {
  [key: string]: number;
}

export interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  exchangeRate: number;
  priceImpact: number;
  minimumReceived: string;
  fee: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
