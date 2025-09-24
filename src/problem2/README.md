# Currency Swap App

A clean currency swap interface built with React and Tailwind CSS. Swap tokens with real-time prices and smooth animations.

## What it does

**UI/UX:**
- Glass-morphism design with gradients
- Smooth animations and transitions
- Works on mobile and desktop
- Search and select tokens easily

**Token swapping:**
- Live prices from Switcheo API
- Real-time exchange rate calculations
- Price impact warnings
- Slippage settings

**Validation:**
- Input validation with helpful error messages
- Prevents duplicate token selection
- Proper decimal handling

**Performance:**
- Built with Vite (super fast)
- Optimized to prevent unnecessary re-renders
- Lazy loading for better performance

## Tech used

- React 18 with hooks
- TypeScript for better code
- Tailwind CSS for styling
- Vite for fast builds
- Lucide React for icons

## Getting started

You'll need Node.js 16+ and npm/yarn.

1. **Install dependencies:**
```bash
npm install
```

2. **Start the dev server:**
```bash
npm run dev
```

3. **Open** `http://localhost:5000` in your browser

**To build for production:**
```bash
npm run build
```

## How it works

**Main components:**
- `TokenSelector` - Search and pick tokens
- `SwapInput` - Enter amounts with validation
- `SwapQuote` - Shows exchange rates and fees
- `SwapButton` - Execute the swap

**APIs used:**
- Switcheo prices: `https://interview.switcheo.com/prices.json`
- Token icons: GitHub token-icons repo

## Supported tokens

- SWTH, USDC, USDT, ETH, BTC, NEO, GAS, BNB

## Customization

**Add new tokens** in `src/utils/api.ts`:
```typescript
{
  symbol: "NEW_TOKEN",
  name: "New Token Name", 
  icon: `${TOKEN_ICON_BASE_URL}/NEW_TOKEN.svg`,
  decimals: 18,
}
```

**Styling:** Edit `tailwind.config.js` and `src/index.css`

**API endpoints:** Update in `src/utils/api.ts`

## That's it!

The app fetches live prices, calculates exchange rates, and handles all the swap logic. Pretty straightforward!
