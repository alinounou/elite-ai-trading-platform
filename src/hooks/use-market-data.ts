'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Ticker, Candle, AIAnalysis } from '@/types/trading';

// Simulated market data for demo
const MARKET_DATA: Record<string, Omit<Ticker, 'price' | 'change' | 'changePercent' | 'sparkline'>> = {
  'EURUSD': { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex' },
  'GBPUSD': { symbol: 'GBPUSD', name: 'GBP/USD', type: 'forex' },
  'USDJPY': { symbol: 'USDJPY', name: 'USD/JPY', type: 'forex' },
  'USDCHF': { symbol: 'USDCHF', name: 'USD/CHF', type: 'forex' },
  'AUDUSD': { symbol: 'AUDUSD', name: 'AUD/USD', type: 'forex' },
  'USDCAD': { symbol: 'USDCAD', name: 'USD/CAD', type: 'forex' },
  'XAUUSD': { symbol: 'XAUUSD', name: 'Gold', type: 'metal' },
  'XAGUSD': { symbol: 'XAGUSD', name: 'Silver', type: 'metal' },
  'BTCUSD': { symbol: 'BTCUSD', name: 'Bitcoin', type: 'crypto' },
  'ETHUSD': { symbol: 'ETHUSD', name: 'Ethereum', type: 'crypto' },
  'SOLUSD': { symbol: 'SOLUSD', name: 'Solana', type: 'crypto' },
  'AAPL': { symbol: 'AAPL', name: 'Apple', type: 'stock' },
  'MSFT': { symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
  'GOOGL': { symbol: 'GOOGL', name: 'Alphabet', type: 'stock' },
  'AMZN': { symbol: 'AMZN', name: 'Amazon', type: 'stock' },
  'TSLA': { symbol: 'TSLA', name: 'Tesla', type: 'stock' },
  'NVDA': { symbol: 'NVDA', name: 'NVIDIA', type: 'stock' },
  '^GSPC': { symbol: '^GSPC', name: 'S&P 500', type: 'index' },
  '^DJI': { symbol: '^DJI', name: 'Dow Jones', type: 'index' },
  '^IXIC': { symbol: '^IXIC', name: 'NASDAQ', type: 'index' },
};

// Base prices for simulation (fixed, no random)
const BASE_PRICES: Record<string, number> = {
  'EURUSD': 1.0850,
  'GBPUSD': 1.2650,
  'USDJPY': 149.50,
  'USDCHF': 0.8850,
  'AUDUSD': 0.6550,
  'USDCAD': 1.3650,
  'XAUUSD': 2350.00,
  'XAGUSD': 28.50,
  'BTCUSD': 67000,
  'ETHUSD': 3400,
  'SOLUSD': 145,
  'AAPL': 180,
  'MSFT': 415,
  'GOOGL': 175,
  'AMZN': 185,
  'TSLA': 250,
  'NVDA': 880,
  '^GSPC': 5200,
  '^DJI': 39000,
  '^IXIC': 16500,
};

// Create initial static tickers (no random values)
function createInitialTickers(symbols: string[]): Ticker[] {
  return symbols.map(symbol => {
    const basePrice = BASE_PRICES[symbol] || 100;
    return {
      ...MARKET_DATA[symbol],
      price: basePrice,
      change: 0,
      changePercent: 0,
      sparkline: Array(21).fill(basePrice),
      high24h: basePrice * 1.01,
      low24h: basePrice * 0.99,
      volume: 1000000,
    } as Ticker;
  });
}

// Price state for simulation (only used on client)
const priceState: Record<string, { price: number; trend: number }> = {};

// Check if we're on client
function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function useMarketData(symbols: string[] = Object.keys(MARKET_DATA)) {
  const [tickers, setTickers] = useState<Ticker[]>(() => createInitialTickers(symbols));
  const initialized = useRef(false);

  // Initialize price state and start updates on client only
  useEffect(() => {
    if (!isClient() || initialized.current) return;
    initialized.current = true;
    
    // Initialize price state
    symbols.forEach(symbol => {
      if (!priceState[symbol]) {
        priceState[symbol] = {
          price: BASE_PRICES[symbol] || 100,
          trend: Math.random() > 0.5 ? 1 : -1,
        };
      }
    });

    // Start price updates
    const updatePrices = () => {
      setTickers(prevTickers => 
        prevTickers.map(ticker => {
          const state = priceState[ticker.symbol];
          if (!state) return ticker;

          const volatility = ticker.symbol.includes('BTC') ? 0.005 : 
                             ticker.symbol.includes('XAU') ? 0.002 :
                             ticker.symbol.includes('JPY') ? 0.001 : 0.0005;
          
          const randomChange = (Math.random() - 0.5) * volatility;
          const trendChange = state.trend * volatility * 0.1;
          const meanReversion = (BASE_PRICES[ticker.symbol] - state.price) / BASE_PRICES[ticker.symbol] * 0.001;
          
          state.price *= (1 + randomChange + trendChange + meanReversion);
          
          if (Math.random() < 0.01) {
            state.trend *= -1;
          }

          const change = state.price - BASE_PRICES[ticker.symbol];
          const changePercent = (change / BASE_PRICES[ticker.symbol]) * 100;

          return {
            ...ticker,
            price: state.price,
            change,
            changePercent,
          };
        })
      );
    };

    const interval = setInterval(updatePrices, 1000);
    return () => clearInterval(interval);
  }, [symbols]);

  const getTicker = useCallback((symbol: string) => tickers.find(t => t.symbol === symbol), [tickers]);
  const getTickersByType = useCallback((type: Ticker['type']) => tickers.filter(t => t.type === type), [tickers]);

  return { tickers, isLoading: false, error: null, getTicker, getTickersByType, refresh: () => {} };
}

// Historical data hook - generate deterministic data
export function useHistoricalData(symbol: string, interval: string = '1h', limit: number = 100) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const generated = useRef(false);

  useEffect(() => {
    if (!isClient() || generated.current) return;
    generated.current = true;
    
    // Generate candles on client only
    const basePrice = BASE_PRICES[symbol] || 100;
    const generatedCandles: Candle[] = [];
    let price = basePrice * 0.95;
    const now = Date.now();
    const intervalMs = interval === '1m' ? 60000 :
                       interval === '5m' ? 300000 :
                       interval === '15m' ? 900000 :
                       interval === '1h' ? 3600000 :
                       interval === '4h' ? 14400000 :
                       86400000;

    for (let i = 0; i < limit; i++) {
      const open = price;
      const volatility = basePrice * 0.002;
      const trend = Math.sin(i / 20) * volatility * 0.5;
      const noise = (Math.random() - 0.5) * volatility;
      
      price += trend + noise;
      
      const high = Math.max(open, price) * (1 + Math.random() * 0.002);
      const low = Math.min(open, price) * (1 - Math.random() * 0.002);
      const close = price;
      const volume = 500000 + Math.random() * 2000000;

      generatedCandles.push({ time: now - (limit - i) * intervalMs, open, high, low, close, volume });
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCandles(generatedCandles);
  }, [symbol, interval, limit]);

  return { candles, isLoading: candles.length === 0, error: null };
}

// AI Signal hook
export function useAISignal(symbol: string, timeframe: string = '1h') {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/ai/signal?symbol=${symbol}&timeframe=${timeframe}`);
        if (!response.ok) throw new Error('Failed to fetch AI analysis');
        const data = await response.json();
        if (isMounted) {
          setAnalysis(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, 30000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [symbol, timeframe]);

  return { analysis, isLoading, error, refresh: () => {} };
}

// Theme hook
export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    
    const stored = localStorage.getItem('trading-theme') as 'dark' | 'light' | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setTheme(stored);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      if (isClient()) localStorage.setItem('trading-theme', newTheme);
      return newTheme;
    });
  }, []);

  return { theme, toggleTheme };
}

// Portfolio hook
export function usePortfolio() {
  const [portfolio, setPortfolio] = useState({
    totalBalance: 100000, equity: 102500, margin: 15000, freeMargin: 87500, marginLevel: 683.33,
    unrealizedPnl: 2500, realizedPnl: 5000, dailyPnl: 850, weeklyPnl: 3200, monthlyPnl: 8500,
  });

  const [positions] = useState([
    { id: '1', symbol: 'EURUSD', type: 'long' as const, size: 1.5, entryPrice: 1.0820, currentPrice: 1.0850, pnl: 450, pnlPercent: 0.45 },
    { id: '2', symbol: 'XAUUSD', type: 'long' as const, size: 0.5, entryPrice: 2320, currentPrice: 2350, pnl: 1500, pnlPercent: 0.65 },
    { id: '3', symbol: 'BTCUSD', type: 'short' as const, size: 0.1, entryPrice: 68500, currentPrice: 67000, pnl: 150, pnlPercent: 0.22 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio(prev => ({
        ...prev,
        unrealizedPnl: prev.unrealizedPnl + (Math.random() - 0.5) * 50,
        dailyPnl: prev.dailyPnl + (Math.random() - 0.5) * 20,
        equity: prev.equity + (Math.random() - 0.5) * 30,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return { portfolio, positions };
}

// Risk metrics hook
export function useRiskMetrics() {
  return useMemo(() => ({
    valueAtRisk: 2500, conditionalVaR: 3800, sharpeRatio: 1.85, sortinoRatio: 2.45,
    maxDrawdown: 12.5, currentDrawdown: 2.3, winRate: 62.5, profitFactor: 1.85,
    averageWin: 450, averageLoss: 280, riskRewardRatio: 1.61,
  }), []);
}
