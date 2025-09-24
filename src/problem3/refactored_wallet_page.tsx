import React, { useMemo, useCallback } from "react";
import { BoxProps } from "@mui/material/Box";

// Types
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
  blockchain: string;
  priority: number;
}

interface Props extends BoxProps {
  children?: React.ReactNode;
}

// Constants
const BLOCKCHAIN_PRIORITIES = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

const DEFAULT_PRIORITY = -99;

type BlockchainType = keyof typeof BLOCKCHAIN_PRIORITIES;

// Custom hook for priority calculation
const useBlockchainPriority = () => {
  return useCallback((blockchain: string): number => {
    return (
      BLOCKCHAIN_PRIORITIES[blockchain as BlockchainType] ?? DEFAULT_PRIORITY
    );
  }, []);
};

// Custom hook for wallet data processing
const useProcessedWalletBalances = (
  balances: WalletBalance[],
  prices: Record<string, number>
) => {
  const getPriority = useBlockchainPriority();

  return useMemo(() => {
    if (!balances || !Array.isArray(balances)) {
      return [];
    }

    return balances
      .filter((balance) => {
        // Fix: Keep only positive balances
        if (balance.amount <= 0) {
          return false;
        }

        const priority = getPriority(balance.blockchain);
        // Fix: Keep only valid blockchain priorities
        return priority > DEFAULT_PRIORITY;
      })
      .map((balance) => ({
        ...balance,
        priority: getPriority(balance.blockchain),
        formatted: balance.amount.toFixed(2), // More precise formatting
      }))
      .sort((a, b) => {
        // Fix: Complete sort function with proper return for equal priorities
        if (a.priority > b.priority) {
          return -1;
        } else if (b.priority > a.priority) {
          return 1;
        }
        // Fix: Return 0 for equal priorities
        return 0;
      });
  }, [balances, getPriority]);
};

// Custom hook for wallet rows
const useWalletRows = (
  processedBalances: FormattedWalletBalance[],
  prices: Record<string, number>
) => {
  return useMemo(() => {
    if (!processedBalances || !prices) {
      return [];
    }

    return processedBalances.map((balance) => {
      const price = prices[balance.currency];
      const usdValue = price ? price * balance.amount : 0;

      return {
        ...balance,
        usdValue,
        key: `${balance.currency}-${balance.blockchain}-${balance.amount}`, // Better key generation
      };
    });
  }, [processedBalances, prices]);
};

// Main component
const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Error handling
  if (!balances || !prices) {
    return (
      <div {...rest} role="alert" aria-live="polite">
        <p>Loading wallet data...</p>
        {children}
      </div>
    );
  }

  const processedBalances = useProcessedWalletBalances(balances, prices);
  const walletRows = useWalletRows(processedBalances, prices);

  return (
    <div {...rest} role="table" aria-label="Wallet balances">
      <div role="rowgroup">
        {walletRows.map((row) => (
          <WalletRow
            key={row.key}
            className={classes.row}
            amount={row.amount}
            usdValue={row.usdValue}
            formattedAmount={row.formatted}
            currency={row.currency}
            blockchain={row.blockchain}
            priority={row.priority}
            aria-label={`${row.currency} balance: ${row.formatted}`}
          />
        ))}
      </div>
      {children}
    </div>
  );
};

// Error boundary component for better error handling
export const WalletPageWithErrorBoundary: React.FC<Props> = (props) => {
  return (
    <ErrorBoundary fallback={<div>Error loading wallet data</div>}>
      <WalletPage {...props} />
    </ErrorBoundary>
  );
};

export default WalletPage;

// Additional utility functions
export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};

export const validateWalletBalance = (
  balance: any
): balance is WalletBalance => {
  return (
    balance &&
    typeof balance.currency === "string" &&
    typeof balance.amount === "number" &&
    typeof balance.blockchain === "string" &&
    !isNaN(balance.amount)
  );
};

// Performance optimization: Memoized priority calculation
const priorityCache = new Map<string, number>();

export const getCachedPriority = (blockchain: string): number => {
  if (priorityCache.has(blockchain)) {
    return priorityCache.get(blockchain)!;
  }

  const priority =
    BLOCKCHAIN_PRIORITIES[blockchain as BlockchainType] ?? DEFAULT_PRIORITY;
  priorityCache.set(blockchain, priority);
  return priority;
};
