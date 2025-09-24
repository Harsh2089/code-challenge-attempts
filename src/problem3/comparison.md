# Code Comparison: Original vs Refactored

## Key Improvements Made

### 1. **Fixed Critical Logic Errors**

#### Original (Broken):
```typescript
if (lhsPriority > -99) { // ❌ lhsPriority is undefined
  if (balance.amount <= 0) { // ❌ Keeps negative amounts
    return true;
  }
}
```

#### Refactored (Fixed):
```typescript
if (balance.amount <= 0) {
  return false; // ✅ Filter out negative amounts
}

const priority = getPriority(balance.blockchain);
return priority > DEFAULT_PRIORITY; // ✅ Keep only valid priorities
```

### 2. **Fixed Type Safety Issues**

#### Original:
```typescript
const getPriority = (blockchain: any): number => { // ❌ any type
```

#### Refactored:
```typescript
type BlockchainType = keyof typeof BLOCKCHAIN_PRIORITIES;
const getPriority = (blockchain: string): number => { // ✅ Proper typing
```

### 3. **Improved Performance with Custom Hooks**

#### Original:
```typescript
const sortedBalances = useMemo(() => {
  // Complex logic mixed in component
}, [balances, prices]); // ❌ Unused dependency
```

#### Refactored:
```typescript
// ✅ Extracted to custom hook
const useProcessedWalletBalances = (balances, prices) => {
  return useMemo(() => {
    // Clean, focused logic
  }, [balances, getPriority]); // ✅ Correct dependencies
};
```

### 4. **Better Error Handling**

#### Original:
```typescript
const usdValue = prices[balance.currency] * balance.amount; // ❌ No error handling
```

#### Refactored:
```typescript
const price = prices[balance.currency];
const usdValue = price ? price * balance.amount : 0; // ✅ Safe calculation
```

### 5. **Improved Code Organization**

#### Original:
- Magic numbers scattered throughout
- Complex logic in component
- No separation of concerns

#### Refactored:
```typescript
// ✅ Constants defined
const BLOCKCHAIN_PRIORITIES = {
  Osmosis: 100,
  Ethereum: 50,
  // ...
} as const;

// ✅ Custom hooks for separation
const useBlockchainPriority = () => { /* ... */ };
const useProcessedWalletBalances = () => { /* ... */ };
```

### 6. **Better Key Generation**

#### Original:
```typescript
key={index} // ❌ Can cause React issues
```

#### Refactored:
```typescript
key={`${balance.currency}-${balance.blockchain}-${balance.amount}`} // ✅ Unique keys
```

### 7. **Accessibility Improvements**

#### Original:
```typescript
<div {...rest}>
  {rows}
</div>
```

#### Refactored:
```typescript
<div {...rest} role="table" aria-label="Wallet balances">
  <div role="rowgroup">
    {walletRows.map((row) => (
      <WalletRow
        aria-label={`${row.currency} balance: ${row.formatted}`}
        // ... other props
      />
    ))}
  </div>
</div>
```

## Performance Improvements

1. **Memoization**: Proper use of `useMemo` with correct dependencies
2. **Caching**: Priority calculation caching to avoid repeated computations
3. **Custom Hooks**: Better separation allows for individual optimization
4. **Error Boundaries**: Graceful error handling prevents crashes

## Maintainability Improvements

1. **Type Safety**: Proper TypeScript usage throughout
2. **Constants**: Magic numbers replaced with named constants
3. **Separation of Concerns**: Logic extracted into focused functions
4. **Documentation**: Clear comments and JSDoc where needed
5. **Testing**: Functions are now easily testable in isolation

## Summary

The refactored code addresses all 12 identified issues:
- ✅ Fixed logic errors and runtime bugs
- ✅ Improved type safety and error handling
- ✅ Enhanced performance through proper memoization
- ✅ Better code organization and maintainability
- ✅ Added accessibility features
- ✅ Made the code more testable and reusable
