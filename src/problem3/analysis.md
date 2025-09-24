# React Code Analysis: Computational Inefficiencies and Anti-patterns

## Identified Issues

### 1. **Critical Logic Error in Filter Condition**
```typescript
if (lhsPriority > -99) {
  if (balance.amount <= 0) {
    return true; // This returns true for negative/zero amounts!
  }
}
return false
```
**Problem**: The filter logic is inverted. It returns `true` for balances with amount ≤ 0, which means it's filtering OUT positive balances and keeping negative/zero balances.

**Fix**: Should be `balance.amount > 0` to keep positive balances.

### 2. **Undefined Variable Reference**
```typescript
if (lhsPriority > -99) {
```
**Problem**: `lhsPriority` is not defined in this scope. Should be `balancePriority`.

### 3. **Incomplete Sort Function**
```typescript
.sort((lhs: WalletBalance, rhs: WalletBalance) => {
  const leftPriority = getPriority(lhs.blockchain);
  const rightPriority = getPriority(rhs.blockchain);
  if (leftPriority > rightPriority) {
    return -1;
  } else if (rightPriority > leftPriority) {
    return 1;
  }
  // Missing return statement for equal priorities!
});
```
**Problem**: Missing return statement when priorities are equal, causing inconsistent sorting.

### 4. **Unused Dependency in useMemo**
```typescript
const sortedBalances = useMemo(() => {
  // ... filtering and sorting logic
}, [balances, prices]); // prices is not used in the computation
```
**Problem**: `prices` is included in the dependency array but never used in the memoized computation, causing unnecessary re-computations.

### 5. **Type Mismatch in Map Operation**
```typescript
const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
```
**Problem**: `sortedBalances` contains `WalletBalance` objects, but the map function expects `FormattedWalletBalance` objects. The `formatted` property doesn't exist.

### 6. **Inefficient Re-computation**
```typescript
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  return {
    ...balance,
    formatted: balance.amount.toFixed()
  }
})
```
**Problem**: This creates a new array but it's never used. The formatting should be done inline or the result should be used.

### 7. **Poor Key Prop Usage**
```typescript
key={index}
```
**Problem**: Using array index as key can cause React rendering issues when the list changes. Should use a unique identifier.

### 8. **Missing Error Handling**
**Problem**: No error handling for:
- `useWalletBalances()` or `usePrices()` returning undefined/null
- `prices[balance.currency]` being undefined
- Division by zero or invalid calculations

### 9. **Type Safety Issues**
- `blockchain: any` in `getPriority` function
- Missing proper typing for the blockchain values
- No validation of input data

### 10. **Performance Issues**
- `getPriority` function is called multiple times for the same blockchain values
- No memoization of the priority calculation
- Inefficient filtering and sorting logic

### 11. **Code Organization Issues**
- `getPriority` function should be moved outside the component or memoized
- Magic numbers (-99, 100, 50, etc.) should be constants
- Complex logic should be extracted into custom hooks

### 12. **Accessibility Issues**
- No accessibility attributes for the wallet rows
- Missing semantic HTML structure

## Summary of Critical Issues
1. **Logic Error**: Filter keeps negative balances instead of positive ones
2. **Runtime Error**: Undefined variable `lhsPriority`
3. **Type Error**: Incorrect type annotation in map function
4. **Performance**: Unnecessary re-computations due to incorrect dependencies
5. **Maintainability**: Poor code organization and magic numbers
