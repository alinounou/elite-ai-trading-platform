'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Brain, Zap, Target, Shield,
  RefreshCw, Sun, Moon, DollarSign, Percent, LayoutDashboard, LineChart,
  Calculator, Briefcase, Bot, Menu, X, ChevronRight, AlertTriangle,
  BarChart3, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { useMarketData, useHistoricalData, useAISignal, useTheme, usePortfolio, useRiskMetrics } from '@/hooks/use-market-data';
import { calculatePositionSize, calculateKellyCriterion, calculateVaR, calculateMonteCarlo } from '@/lib/quant';

// Theme colors
const colors = {
  dark: {
    bg: '#0a0a0f',
    card: '#12121a',
    border: '#1f1f2e',
    text: '#ffffff',
    textSecondary: '#8b8b9e',
    accent: {
      buy: '#00d26a',
      sell: '#ff3b5c',
      blue: '#3b82f6',
      purple: '#a855f7',
      orange: '#f59e0b',
      cyan: '#06b6d4',
    },
  },
  light: {
    bg: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#64748b',
    accent: {
      buy: '#22c55e',
      sell: '#ef4444',
      blue: '#3b82f6',
      purple: '#a855f7',
      orange: '#f59e0b',
      cyan: '#06b6d4',
    },
  },
};

// Navigation items
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'charts', label: 'Charts', icon: LineChart },
  { id: 'calculators', label: 'Calculators', icon: Calculator },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'ai-signals', label: 'AI Signals', icon: Bot },
];

// ==================== HEADER ====================
function Header({ 
  theme, 
  toggleTheme, 
  currentPage, 
  setCurrentPage,
  mobileMenuOpen,
  setMobileMenuOpen 
}: { 
  theme: 'dark' | 'light'; 
  toggleTheme: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const themeColors = colors[theme];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b shrink-0" style={{ 
      backgroundColor: themeColors.card, 
      borderColor: themeColors.border 
    }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden p-2 rounded-lg"
            style={{ backgroundColor: themeColors.border, color: themeColors.text }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
            background: `linear-gradient(135deg, ${themeColors.accent.blue}, ${themeColors.accent.purple})` 
          }}>
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-xl" style={{ color: themeColors.text }}>ELITE AI TRADING</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ 
                backgroundColor: 'rgba(0, 210, 106, 0.15)',
                color: themeColors.accent.buy
              }}>
                <Activity size={10} />
                <span>LIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: isActive ? themeColors.accent.blue : 'transparent',
                  color: isActive ? 'white' : themeColors.textSecondary,
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-sm hidden md:block" style={{ color: themeColors.textSecondary }}>
            {currentTime || '--:--:--'}
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{ backgroundColor: themeColors.border, color: themeColors.text }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t p-2" style={{ borderColor: themeColors.border }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: isActive ? themeColors.accent.blue : 'transparent',
                  color: isActive ? 'white' : themeColors.textSecondary,
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                <ChevronRight size={16} className="ml-auto" />
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}

// ==================== MARKET WATCH ====================
function MarketWatch({ theme, selectedSymbol, onSelectSymbol }: { 
  theme: 'dark' | 'light'; 
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}) {
  const { tickers, getTickersByType } = useMarketData();
  const themeColors = colors[theme];
  const [activeTab, setActiveTab] = useState<'forex' | 'crypto' | 'stock' | 'metal'>('forex');

  const filteredTickers = useMemo(() => getTickersByType(activeTab).slice(0, 8), [getTickersByType, activeTab]);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('JPY')) return price.toFixed(2);
    if (symbol.includes('BTC')) return price.toFixed(0);
    if (price >= 1000) return price.toFixed(2);
    return price.toFixed(5);
  };

  return (
    <div className="h-full flex flex-col rounded-xl" style={{ backgroundColor: themeColors.card }}>
      <div className="p-4 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: themeColors.text }}>
          <BarChart3 size={16} style={{ color: themeColors.accent.blue }} />
          MARKET WATCH
        </h2>
        <div className="flex flex-wrap gap-1">
          {(['forex', 'crypto', 'stock', 'metal'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab ? themeColors.accent.blue : themeColors.border,
                color: activeTab === tab ? 'white' : themeColors.textSecondary,
              }}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredTickers.map((ticker) => (
          <div key={ticker.symbol} onClick={() => onSelectSymbol(ticker.symbol)}
            className="flex items-center justify-between p-3 cursor-pointer transition-all hover:opacity-80"
            style={{
              backgroundColor: selectedSymbol === ticker.symbol ? themeColors.border : 'transparent',
              borderBottom: `1px solid ${themeColors.border}`,
            }}>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm" style={{ color: themeColors.text }}>{ticker.name}</div>
              <span className="text-xs" style={{ color: themeColors.textSecondary }}>{ticker.symbol}</span>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="font-mono text-sm font-bold" style={{ color: themeColors.text }} suppressHydrationWarning>
                {formatPrice(ticker.price, ticker.symbol)}
              </div>
              <div className="flex items-center justify-end gap-1">
                {ticker.changePercent >= 0 ? 
                  <TrendingUp size={12} style={{ color: themeColors.accent.buy }} /> :
                  <TrendingDown size={12} style={{ color: themeColors.accent.sell }} />
                }
                <span className="text-xs font-mono font-medium" style={{
                  color: ticker.changePercent >= 0 ? themeColors.accent.buy : themeColors.accent.sell,
                }}>
                  {ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== TRADING CHART ====================
function TradingChart({ theme, symbol, fullscreen }: { theme: 'dark' | 'light'; symbol: string; fullscreen?: boolean }) {
  const { candles, isLoading } = useHistoricalData(symbol, '1h', 100);
  const themeColors = colors[theme];
  const [timeframe, setTimeframe] = useState('1h');
  const { tickers } = useMarketData();
  
  const currentTicker = tickers.find(t => t.symbol === symbol);
  const priceChange = currentTicker?.changePercent || 0;

  const chartData = useMemo(() => {
    if (candles.length === 0) return [];
    return candles.map((candle, index) => ({
      time: new Date(candle.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      close: candle.close,
      ma20: index > 19 ? candles.slice(index - 19, index + 1).reduce((sum, c) => sum + c.close, 0) / 20 : null,
    }));
  }, [candles]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl" style={{ backgroundColor: themeColors.card }}>
        <RefreshCw className="animate-spin" size={32} style={{ color: themeColors.accent.blue }} />
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col rounded-xl ${fullscreen ? '' : ''}`} style={{ backgroundColor: themeColors.card }}>
      <div className="p-4 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-2xl" style={{ color: themeColors.text }}>{symbol}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-mono font-bold" style={{ color: themeColors.text }}>
                {currentTicker?.price?.toFixed(symbol.includes('JPY') ? 2 : 5) || '0.00000'}
              </span>
              <span className="text-sm px-3 py-1 rounded-lg font-medium" style={{ 
                backgroundColor: priceChange >= 0 ? 'rgba(0, 210, 106, 0.15)' : 'rgba(255, 59, 92, 0.15)',
                color: priceChange >= 0 ? themeColors.accent.buy : themeColors.accent.sell,
              }}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: timeframe === tf ? themeColors.accent.blue : themeColors.border,
                  color: timeframe === tf ? 'white' : themeColors.textSecondary,
                }}>
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${theme}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColors.accent.blue} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={themeColors.accent.blue} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} opacity={0.5} />
            <XAxis dataKey="time" stroke={themeColors.textSecondary} fontSize={10} tickLine={false} />
            <YAxis stroke={themeColors.textSecondary} fontSize={10} tickLine={false} domain={['auto', 'auto']} orientation="right" />
            <Tooltip contentStyle={{ 
              backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}`,
              borderRadius: '8px', color: themeColors.text 
            }} />
            <Area type="monotone" dataKey="close" stroke={themeColors.accent.blue} fill={`url(#gradient-${theme})`} strokeWidth={2} />
            <Line type="monotone" dataKey="ma20" stroke={themeColors.accent.orange} strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== SIGNAL CENTER ====================
function SignalCenter({ theme, symbol }: { theme: 'dark' | 'light'; symbol: string }) {
  const { analysis, isLoading } = useAISignal(symbol);
  const themeColors = colors[theme];

  if (isLoading || !analysis) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl" style={{ backgroundColor: themeColors.card }}>
        <Brain className="animate-pulse" size={40} style={{ color: themeColors.accent.purple }} />
      </div>
    );
  }

  const signal = analysis.signal;
  const signalColor = signal.type === 'BUY' ? themeColors.accent.buy :
                      signal.type === 'SELL' ? themeColors.accent.sell :
                      themeColors.accent.orange;

  return (
    <div className="h-full flex flex-col rounded-xl" style={{ backgroundColor: themeColors.card }}>
      <div className="p-4 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: themeColors.text }}>
            <Brain size={16} style={{ color: themeColors.accent.purple }} />
            AI SIGNAL
          </h2>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: themeColors.border }}>
            <Activity size={12} style={{ color: themeColors.accent.purple }} />
            <span className="text-xs font-medium" style={{ color: themeColors.accent.purple }}>ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        <div className="text-center mb-4">
          <div className="inline-block px-8 py-4 rounded-xl text-3xl font-bold mb-2" style={{ 
            backgroundColor: `${signalColor}20`,
            color: signalColor,
            boxShadow: `0 0 40px ${signalColor}40`,
          }}>
            {signal.type}
          </div>
          <div className="text-lg font-medium" style={{ color: themeColors.textSecondary }}>
            Confidence: <span className="font-mono font-bold text-xl" style={{ color: themeColors.text }}>{signal.confidence.toFixed(0)}%</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: themeColors.border }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ 
              width: `${signal.probability}%`, backgroundColor: signalColor 
            }} />
          </div>
        </div>

        {signal.entry && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
              <div className="text-xs font-medium mb-1" style={{ color: themeColors.textSecondary }}>ENTRY</div>
              <div className="font-mono text-base font-bold" style={{ color: themeColors.text }}>{signal.entry.toFixed(5)}</div>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
              <div className="text-xs font-medium mb-1" style={{ color: themeColors.accent.sell }}>STOP LOSS</div>
              <div className="font-mono text-base font-bold" style={{ color: themeColors.accent.sell }}>{signal.stopLoss?.toFixed(5)}</div>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
              <div className="text-xs font-medium mb-1" style={{ color: themeColors.accent.buy }}>TAKE PROFIT</div>
              <div className="font-mono text-base font-bold" style={{ color: themeColors.accent.buy }}>{signal.takeProfit?.toFixed(5)}</div>
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: themeColors.border }}>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span style={{ color: themeColors.textSecondary }}>Trend: </span>
              <span className="font-bold" style={{ 
                color: analysis.marketStructure.trend === 'bullish' ? themeColors.accent.buy : 
                       analysis.marketStructure.trend === 'bearish' ? themeColors.accent.sell : themeColors.accent.orange 
              }}>{analysis.marketStructure.trend.toUpperCase()}</span>
            </div>
            <div>
              <span style={{ color: themeColors.textSecondary }}>Phase: </span>
              <span className="font-bold" style={{ color: themeColors.accent.cyan }}>{analysis.marketStructure.phase.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {signal.reasoning.slice(0, 3).map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg" style={{ backgroundColor: themeColors.border }}>
              <Zap size={12} className="mt-0.5 shrink-0" style={{ color: themeColors.accent.blue }} />
              <span style={{ color: themeColors.text }}>{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== QUANT CALCULATORS (FULL PAGE) ====================
function QuantCalculatorsFull({ theme }: { theme: 'dark' | 'light' }) {
  const themeColors = colors[theme];
  const [activeCalc, setActiveCalc] = useState<'position' | 'var' | 'kelly' | 'monte'>('position');
  
  const [posInputs, setPosInputs] = useState({ balance: 10000, riskPercent: 2, entry: 1.0850, stopLoss: 1.0800 });
  const [kellyInputs, setKellyInputs] = useState({ winProbability: 0.55, winLossRatio: 1.5 });
  const [varInputs, setVarInputs] = useState({ portfolioValue: 100000, confidence: 95, days: 1, volatility: 15 });
  const [monteInputs, setMonteInputs] = useState({ capital: 10000, expectedReturn: 12, volatility: 20, simulations: 1000 });

  const positionResult = calculatePositionSize({
    accountBalance: posInputs.balance, riskPercent: posInputs.riskPercent,
    entryPrice: posInputs.entry, stopLoss: posInputs.stopLoss, instrumentType: 'forex',
  });

  const kellyResult = calculateKellyCriterion(kellyInputs);

  const varResult = useMemo(() => {
    return calculateVaR({
      portfolioValue: varInputs.portfolioValue,
      confidenceLevel: varInputs.confidence / 100,
      timeHorizon: varInputs.days,
      volatility: varInputs.volatility / 100,
    });
  }, [varInputs]);

  const monteResult = useMemo(() => {
    return calculateMonteCarlo({
      initialCapital: monteInputs.capital,
      expectedReturn: monteInputs.expectedReturn / 100,
      volatility: monteInputs.volatility / 100,
      timeHorizon: 252,
      simulations: monteInputs.simulations,
      trades: 252,
    });
  }, [monteInputs]);

  const calculatorTabs = [
    { id: 'position', label: 'Position Size', icon: Target },
    { id: 'var', label: 'Value at Risk', icon: Shield },
    { id: 'kelly', label: 'Kelly Criterion', icon: Percent },
    { id: 'monte', label: 'Monte Carlo', icon: RefreshCw },
  ];

  return (
    <div className="p-4 lg:p-6 min-h-screen" style={{ backgroundColor: themeColors.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: themeColors.text }}>
            <Calculator size={28} style={{ color: themeColors.accent.purple }} />
            Quantitative Calculators
          </h1>
          <p style={{ color: themeColors.textSecondary }}>Professional risk management and position sizing tools</p>
        </div>

        {/* Calculator Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {calculatorTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveCalc(tab.id as typeof activeCalc)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
                style={{
                  backgroundColor: activeCalc === tab.id ? themeColors.accent.purple : themeColors.card,
                  color: activeCalc === tab.id ? 'white' : themeColors.textSecondary,
                  border: `1px solid ${activeCalc === tab.id ? themeColors.accent.purple : themeColors.border}`,
                }}>
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="rounded-xl p-6" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: themeColors.text }}>Input Parameters</h2>

            {activeCalc === 'position' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Account Balance ($)</label>
                  <input type="number" value={posInputs.balance}
                    onChange={(e) => setPosInputs({ ...posInputs, balance: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg text-lg font-mono font-medium transition-all focus:ring-2"
                    style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Risk Percentage (%)</label>
                    <input type="number" value={posInputs.riskPercent}
                      onChange={(e) => setPosInputs({ ...posInputs, riskPercent: Number(e.target.value) })}
                      className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                      style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Entry Price</label>
                    <input type="number" step="0.00001" value={posInputs.entry}
                      onChange={(e) => setPosInputs({ ...posInputs, entry: Number(e.target.value) })}
                      className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                      style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Stop Loss Price</label>
                  <input type="number" step="0.00001" value={posInputs.stopLoss}
                    onChange={(e) => setPosInputs({ ...posInputs, stopLoss: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                    style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                </div>
              </div>
            )}

            {activeCalc === 'kelly' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Win Rate (%)</label>
                  <input type="number" value={kellyInputs.winProbability * 100}
                    onChange={(e) => setKellyInputs({ ...kellyInputs, winProbability: Number(e.target.value) / 100 })}
                    className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                    style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Win/Loss Ratio</label>
                  <input type="number" step="0.1" value={kellyInputs.winLossRatio}
                    onChange={(e) => setKellyInputs({ ...kellyInputs, winLossRatio: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                    style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                </div>
              </div>
            )}

            {activeCalc === 'var' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Portfolio Value ($)</label>
                  <input type="number" value={varInputs.portfolioValue}
                    onChange={(e) => setVarInputs({ ...varInputs, portfolioValue: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                    style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Confidence Level (%)</label>
                    <input type="number" value={varInputs.confidence}
                      onChange={(e) => setVarInputs({ ...varInputs, confidence: Number(e.target.value) })}
                      className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                      style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Time Horizon (days)</label>
                    <input type="number" value={varInputs.days}
                      onChange={(e) => setVarInputs({ ...varInputs, days: Number(e.target.value) })}
                      className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                      style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Annual Volatility (%)</label>
                  <input type="number" value={varInputs.volatility}
                    onChange={(e) => setVarInputs({ ...varInputs, volatility: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                    style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                </div>
              </div>
            )}

            {activeCalc === 'monte' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Initial Capital ($)</label>
                  <input type="number" value={monteInputs.capital}
                    onChange={(e) => setMonteInputs({ ...monteInputs, capital: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                    style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Expected Return (%)</label>
                    <input type="number" value={monteInputs.expectedReturn}
                      onChange={(e) => setMonteInputs({ ...monteInputs, expectedReturn: Number(e.target.value) })}
                      className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                      style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Volatility (%)</label>
                    <input type="number" value={monteInputs.volatility}
                      onChange={(e) => setMonteInputs({ ...monteInputs, volatility: Number(e.target.value) })}
                      className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                      style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: themeColors.textSecondary }}>Simulations</label>
                  <input type="number" value={monteInputs.simulations}
                    onChange={(e) => setMonteInputs({ ...monteInputs, simulations: Number(e.target.value) })}
                    className="w-full p-3 rounded-lg text-lg font-mono font-medium"
                    style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="rounded-xl p-6" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: themeColors.text }}>Results</h2>

            {activeCalc === 'position' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                  <div className="text-sm font-medium mb-2" style={{ color: themeColors.textSecondary }}>Position Size</div>
                  <div className="text-4xl font-mono font-bold" style={{ color: themeColors.accent.blue }}>
                    {positionResult.positionSize.toFixed(0)} units
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>Lots</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: themeColors.text }}>{positionResult.lots.toFixed(2)}</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>Risk Amount</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: themeColors.accent.sell }}>${positionResult.riskAmount.toFixed(2)}</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>Pip Distance</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: themeColors.text }}>{positionResult.pipDistance.toFixed(1)}</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>Pip Value</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: themeColors.text }}>${positionResult.pipValue.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            {activeCalc === 'kelly' && (
              <div className="space-y-4">
                <div className="p-6 rounded-xl text-center" style={{ backgroundColor: themeColors.border }}>
                  <div className="text-sm font-medium mb-2" style={{ color: themeColors.textSecondary }}>Kelly Criterion</div>
                  <div className="text-5xl font-mono font-bold" style={{ color: kellyResult > 0 ? themeColors.accent.buy : themeColors.accent.sell }}>
                    {(kellyResult * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm mt-4" style={{ color: themeColors.textSecondary }}>
                    Half Kelly: <span className="font-mono font-bold text-xl" style={{ color: themeColors.accent.cyan }}>{(kellyResult * 50).toFixed(1)}%</span>
                  </div>
                  <div className="text-xs mt-2" style={{ color: themeColors.textSecondary }}>
                    Quarter Kelly: <span className="font-mono font-medium" style={{ color: themeColors.accent.purple }}>{(kellyResult * 25).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                  <div className="text-xs font-medium mb-2" style={{ color: themeColors.accent.orange }}>Note</div>
                  <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                    Kelly Criterion calculates the optimal position size based on your win rate and win/loss ratio. 
                    Most traders use Half Kelly for more conservative risk management.
                  </p>
                </div>
              </div>
            )}

            {activeCalc === 'var' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                  <div className="text-sm font-medium mb-2" style={{ color: themeColors.accent.sell }}>Value at Risk ({varInputs.confidence}% confidence)</div>
                  <div className="text-4xl font-mono font-bold" style={{ color: themeColors.accent.sell }}>
                    -${varResult.varParametric.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>Historical VaR</div>
                    <div className="text-xl font-mono font-bold" style={{ color: themeColors.accent.sell }}>-${varResult.varHistorical.toFixed(2)}</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>Monte Carlo VaR</div>
                    <div className="text-xl font-mono font-bold" style={{ color: themeColors.accent.sell }}>-${varResult.varMonteCarlo.toFixed(2)}</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                  <div className="text-sm font-medium mb-1" style={{ color: themeColors.accent.orange }}>Expected Shortfall (CVaR)</div>
                  <div className="text-2xl font-mono font-bold" style={{ color: themeColors.accent.sell }}>-${varResult.expectedShortfall.toFixed(2)}</div>
                </div>
              </div>
            )}

            {activeCalc === 'monte' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>Probability of Ruin</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: themeColors.accent.sell }}>{(monteResult.probabilityOfRuin * 100).toFixed(2)}%</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>Expected Value</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: themeColors.accent.buy }}>${monteResult.expectedValue.toFixed(2)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>5th Percentile</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: themeColors.accent.sell }}>${monteResult.percentile5.toFixed(2)}</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>95th Percentile</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: themeColors.accent.buy }}>${monteResult.percentile95.toFixed(2)}</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.border }}>
                  <div className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>Monte Carlo VaR</div>
                  <div className="text-2xl font-mono font-bold" style={{ color: themeColors.accent.sell }}>-${monteResult.valueAtRisk.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== PORTFOLIO FULL PAGE ====================
function PortfolioFull({ theme }: { theme: 'dark' | 'light' }) {
  const { portfolio, positions } = usePortfolio();
  const riskMetrics = useRiskMetrics();
  const themeColors = colors[theme];

  const pieData = [
    { name: 'Forex', value: 45, color: themeColors.accent.blue },
    { name: 'Crypto', value: 25, color: themeColors.accent.purple },
    { name: 'Metals', value: 20, color: themeColors.accent.orange },
    { name: 'Stocks', value: 10, color: themeColors.accent.cyan },
  ];

  const equityCurve = [
    { date: 'Jan', value: 95000 },
    { date: 'Feb', value: 98000 },
    { date: 'Mar', value: 102000 },
    { date: 'Apr', value: 99000 },
    { date: 'May', value: 105000 },
    { date: 'Jun', value: 102500 },
  ];

  return (
    <div className="p-4 lg:p-6 min-h-screen" style={{ backgroundColor: themeColors.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: themeColors.text }}>
            <Briefcase size={28} style={{ color: themeColors.accent.blue }} />
            Portfolio Dashboard
          </h1>
          <p style={{ color: themeColors.textSecondary }}>Real-time portfolio overview and risk metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Balance', value: `$${portfolio.totalBalance.toLocaleString()}`, icon: DollarSign, color: themeColors.accent.blue },
            { label: 'Equity', value: `$${portfolio.equity.toLocaleString()}`, icon: TrendingUp, color: themeColors.accent.buy },
            { label: 'Daily P/L', value: `$${portfolio.dailyPnl.toFixed(0)}`, icon: portfolio.dailyPnl >= 0 ? ArrowUpRight : ArrowDownRight, color: portfolio.dailyPnl >= 0 ? themeColors.accent.buy : themeColors.accent.sell },
            { label: 'Weekly P/L', value: `$${portfolio.weeklyPnl.toFixed(0)}`, icon: portfolio.weeklyPnl >= 0 ? ArrowUpRight : ArrowDownRight, color: portfolio.weeklyPnl >= 0 ? themeColors.accent.buy : themeColors.accent.sell },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: themeColors.textSecondary }}>{stat.label}</span>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-mono font-bold" style={{ color: themeColors.text }}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Equity Curve */}
          <div className="lg:col-span-2 rounded-xl p-4" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: themeColors.text }}>Equity Curve</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
                <XAxis dataKey="date" stroke={themeColors.textSecondary} fontSize={12} />
                <YAxis stroke={themeColors.textSecondary} fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}`, borderRadius: '8px' }} />
                <Area type="monotone" dataKey="value" stroke={themeColors.accent.blue} fill={`${themeColors.accent.blue}20`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Allocation */}
          <div className="rounded-xl p-4" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: themeColors.text }}>Asset Allocation</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          {[
            { label: 'Sharpe Ratio', value: riskMetrics.sharpeRatio.toFixed(2), color: themeColors.accent.buy },
            { label: 'Sortino Ratio', value: riskMetrics.sortinoRatio.toFixed(2), color: themeColors.accent.buy },
            { label: 'Max Drawdown', value: `${riskMetrics.maxDrawdown.toFixed(1)}%`, color: themeColors.accent.sell },
            { label: 'Win Rate', value: `${riskMetrics.winRate.toFixed(0)}%`, color: themeColors.accent.buy },
            { label: 'Profit Factor', value: riskMetrics.profitFactor.toFixed(2), color: themeColors.accent.cyan },
          ].map((metric, i) => (
            <div key={i} className="p-4 rounded-xl text-center" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
              <div className="text-xs font-medium mb-1" style={{ color: themeColors.textSecondary }}>{metric.label}</div>
              <div className="text-xl font-mono font-bold" style={{ color: metric.color }}>{metric.value}</div>
            </div>
          ))}
        </div>

        {/* Positions */}
        <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: themeColors.text }}>Open Positions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${themeColors.border}` }}>
                  <th className="text-left p-3 text-xs font-medium" style={{ color: themeColors.textSecondary }}>Symbol</th>
                  <th className="text-left p-3 text-xs font-medium" style={{ color: themeColors.textSecondary }}>Type</th>
                  <th className="text-right p-3 text-xs font-medium" style={{ color: themeColors.textSecondary }}>Size</th>
                  <th className="text-right p-3 text-xs font-medium" style={{ color: themeColors.textSecondary }}>Entry</th>
                  <th className="text-right p-3 text-xs font-medium" style={{ color: themeColors.textSecondary }}>Current</th>
                  <th className="text-right p-3 text-xs font-medium" style={{ color: themeColors.textSecondary }}>P/L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr key={pos.id} style={{ borderBottom: `1px solid ${themeColors.border}` }}>
                    <td className="p-3 font-medium" style={{ color: themeColors.text }}>{pos.symbol}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs font-bold" style={{ 
                        backgroundColor: pos.type === 'long' ? `${themeColors.accent.buy}20` : `${themeColors.accent.sell}20`,
                        color: pos.type === 'long' ? themeColors.accent.buy : themeColors.accent.sell,
                      }}>{pos.type.toUpperCase()}</span>
                    </td>
                    <td className="p-3 text-right font-mono" style={{ color: themeColors.text }}>{pos.size}</td>
                    <td className="p-3 text-right font-mono" style={{ color: themeColors.text }}>{pos.entryPrice}</td>
                    <td className="p-3 text-right font-mono" style={{ color: themeColors.text }}>{pos.currentPrice}</td>
                    <td className="p-3 text-right font-mono font-bold" style={{ color: pos.pnl >= 0 ? themeColors.accent.buy : themeColors.accent.sell }}>
                      ${pos.pnl.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== AI SIGNALS FULL PAGE ====================
function AISignalsFull({ theme }: { theme: 'dark' | 'light' }) {
  const themeColors = colors[theme];
  const { tickers } = useMarketData();
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const { analysis, isLoading } = useAISignal(selectedSymbol);

  const signals = [
    { symbol: 'EURUSD', type: 'BUY', confidence: 78, change: 0.45 },
    { symbol: 'GBPUSD', type: 'SELL', confidence: 65, change: -0.32 },
    { symbol: 'XAUUSD', type: 'BUY', confidence: 82, change: 1.25 },
    { symbol: 'BTCUSD', type: 'WAIT', confidence: 55, change: 0.15 },
    { symbol: 'ETHUSD', type: 'BUY', confidence: 71, change: 0.88 },
  ];

  return (
    <div className="p-4 lg:p-6 min-h-screen" style={{ backgroundColor: themeColors.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: themeColors.text }}>
            <Bot size={28} style={{ color: themeColors.accent.purple }} />
            AI Trading Signals
          </h1>
          <p style={{ color: themeColors.textSecondary }}>Machine learning powered market analysis and trade signals</p>
        </div>

        {/* Signal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {signals.map((signal, i) => {
            const signalColor = signal.type === 'BUY' ? themeColors.accent.buy :
                               signal.type === 'SELL' ? themeColors.accent.sell :
                               themeColors.accent.orange;
            return (
              <div key={i} 
                className="p-4 rounded-xl cursor-pointer transition-all hover:scale-105"
                onClick={() => setSelectedSymbol(signal.symbol)}
                style={{ 
                  backgroundColor: themeColors.card, 
                  border: `2px solid ${selectedSymbol === signal.symbol ? signalColor : themeColors.border}`,
                }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold" style={{ color: themeColors.text }}>{signal.symbol}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold`} style={{ 
                    backgroundColor: `${signalColor}20`, color: signalColor 
                  }}>{signal.type}</span>
                </div>
                <div className="text-2xl font-mono font-bold mb-1" style={{ color: signalColor }}>
                  {signal.confidence}%
                </div>
                <div className="text-xs" style={{ color: signal.change >= 0 ? themeColors.accent.buy : themeColors.accent.sell }}>
                  {signal.change >= 0 ? '+' : ''}{signal.change}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Signal Panel */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl p-6" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold" style={{ color: themeColors.text }}>{selectedSymbol}</h3>
                <p style={{ color: themeColors.textSecondary }}>AI Analysis</p>
              </div>
              {isLoading ? (
                <Brain className="animate-pulse" size={40} style={{ color: themeColors.accent.purple }} />
              ) : (
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-1`} style={{ 
                    color: analysis?.signal.type === 'BUY' ? themeColors.accent.buy :
                           analysis?.signal.type === 'SELL' ? themeColors.accent.sell :
                           themeColors.accent.orange
                  }}>
                    {analysis?.signal.type}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                    {analysis?.signal.confidence.toFixed(0)}% Confidence
                  </div>
                </div>
              )}
            </div>

            {!isLoading && analysis && (
              <>
                {/* Trade Levels */}
                {analysis.signal.entry && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
                      <div className="text-xs font-medium mb-1" style={{ color: themeColors.textSecondary }}>ENTRY</div>
                      <div className="font-mono font-bold" style={{ color: themeColors.text }}>{analysis.signal.entry.toFixed(5)}</div>
                    </div>
                    <div className="p-3 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
                      <div className="text-xs font-medium mb-1" style={{ color: themeColors.accent.sell }}>STOP LOSS</div>
                      <div className="font-mono font-bold" style={{ color: themeColors.accent.sell }}>{analysis.signal.stopLoss?.toFixed(5)}</div>
                    </div>
                    <div className="p-3 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
                      <div className="text-xs font-medium mb-1" style={{ color: themeColors.accent.buy }}>TAKE PROFIT</div>
                      <div className="font-mono font-bold" style={{ color: themeColors.accent.buy }}>{analysis.signal.takeProfit?.toFixed(5)}</div>
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                <div className="space-y-2">
                  <div className="text-xs font-bold mb-2" style={{ color: themeColors.textSecondary }}>AI REASONING</div>
                  {analysis.signal.reasoning.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: themeColors.border }}>
                      <Zap size={14} className="mt-0.5 shrink-0" style={{ color: themeColors.accent.blue }} />
                      <span className="text-sm" style={{ color: themeColors.text }}>{reason}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Technical Indicators */}
          <div className="rounded-xl p-6" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: themeColors.text }}>Technical Indicators</h3>
            {analysis && (
              <div className="space-y-4">
                {/* RSI */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm" style={{ color: themeColors.textSecondary }}>RSI</span>
                    <span className="font-mono font-bold" style={{ 
                      color: analysis.indicators.rsi > 70 ? themeColors.accent.sell :
                             analysis.indicators.rsi < 30 ? themeColors.accent.buy :
                             themeColors.text
                    }}>{analysis.indicators.rsi.toFixed(1)}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: themeColors.border }}>
                    <div className="h-full rounded-full" style={{ 
                      width: `${analysis.indicators.rsi}%`,
                      backgroundColor: analysis.indicators.rsi > 70 ? themeColors.accent.sell :
                                      analysis.indicators.rsi < 30 ? themeColors.accent.buy :
                                      themeColors.accent.blue
                    }} />
                  </div>
                </div>

                {/* MACD */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-xs mb-1" style={{ color: themeColors.textSecondary }}>MACD</div>
                    <div className="font-mono font-bold" style={{ color: themeColors.text }}>{analysis.indicators.macd.value.toFixed(4)}</div>
                  </div>
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-xs mb-1" style={{ color: themeColors.textSecondary }}>Signal</div>
                    <div className="font-mono font-bold" style={{ color: themeColors.text }}>{analysis.indicators.macd.signal.toFixed(4)}</div>
                  </div>
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-xs mb-1" style={{ color: themeColors.textSecondary }}>Histogram</div>
                    <div className="font-mono font-bold" style={{ 
                      color: analysis.indicators.macd.histogram >= 0 ? themeColors.accent.buy : themeColors.accent.sell 
                    }}>{analysis.indicators.macd.histogram.toFixed(4)}</div>
                  </div>
                </div>

                {/* Moving Averages */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-xs mb-1" style={{ color: themeColors.textSecondary }}>SMA 20</div>
                    <div className="font-mono font-bold" style={{ color: themeColors.text }}>{analysis.indicators.sma20.toFixed(5)}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.border }}>
                    <div className="text-xs mb-1" style={{ color: themeColors.textSecondary }}>SMA 50</div>
                    <div className="font-mono font-bold" style={{ color: themeColors.text }}>{analysis.indicators.sma50.toFixed(5)}</div>
                  </div>
                </div>

                {/* Market Structure */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: themeColors.border }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs" style={{ color: themeColors.textSecondary }}>Trend: </span>
                      <span className="font-bold" style={{ 
                        color: analysis.marketStructure.trend === 'bullish' ? themeColors.accent.buy : 
                               analysis.marketStructure.trend === 'bearish' ? themeColors.accent.sell : themeColors.accent.orange 
                      }}>{analysis.marketStructure.trend.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: themeColors.textSecondary }}>Phase: </span>
                      <span className="font-bold" style={{ color: themeColors.accent.cyan }}>{analysis.marketStructure.phase.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Sentiment */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm" style={{ color: themeColors.textSecondary }}>Market Sentiment</span>
                    <span className="font-bold" style={{ 
                      color: analysis.sentiment.overall > 20 ? themeColors.accent.buy :
                             analysis.sentiment.overall < -20 ? themeColors.accent.sell :
                             themeColors.accent.orange
                    }}>
                      {analysis.sentiment.overall > 20 ? 'BULLISH' :
                       analysis.sentiment.overall < -20 ? 'BEARISH' : 'NEUTRAL'}
                    </span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: themeColors.border }}>
                    <div className="h-full rounded-full transition-all" style={{ 
                      width: `${(analysis.sentiment.overall + 100) / 2}%`,
                      backgroundColor: analysis.sentiment.overall > 0 ? themeColors.accent.buy : themeColors.accent.sell
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== HEATMAP ====================
function Heatmap({ theme }: { theme: 'dark' | 'light' }) {
  const { tickers } = useMarketData();
  const themeColors = colors[theme];

  const data = useMemo(() => tickers.slice(0, 12).map(t => ({
    s: t.symbol, c: t.changePercent,
    color: t.changePercent >= 1 ? themeColors.accent.buy :
           t.changePercent >= 0 ? '#69f0ae' :
           t.changePercent >= -1 ? '#ff8a80' : themeColors.accent.sell,
  })), [tickers, themeColors]);

  return (
    <div className="h-full flex flex-col rounded-xl" style={{ backgroundColor: themeColors.card }}>
      <div className="p-4 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <h2 className="text-sm font-bold" style={{ color: themeColors.text }}>🔥 MARKET HEATMAP</h2>
      </div>
      <div className="flex-1 p-4 min-h-0">
        <div className="grid grid-cols-4 gap-2">
          {data.map((item, i) => (
            <div key={i} className="p-2 rounded-lg text-center" style={{ backgroundColor: item.color + '25', border: `1px solid ${item.color}50` }}>
              <div className="text-xs font-bold truncate" style={{ color: themeColors.text }}>{item.s}</div>
              <div className="text-xs font-mono font-medium" style={{ color: item.c >= 0 ? themeColors.accent.buy : themeColors.accent.sell }}>
                {item.c >= 0 ? '+' : ''}{item.c.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== SENTIMENT ====================
function Sentiment({ theme }: { theme: 'dark' | 'light' }) {
  const { analysis } = useAISignal('EURUSD');
  const themeColors = colors[theme];

  const sentiment = analysis?.sentiment.overall || 0;
  const angle = ((sentiment + 100) / 200) * 180 - 90;

  return (
    <div className="h-full flex flex-col rounded-xl" style={{ backgroundColor: themeColors.card }}>
      <div className="p-4 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <h2 className="text-sm font-bold" style={{ color: themeColors.text }}>📊 SENTIMENT</h2>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-center items-center min-h-0">
        <svg viewBox="0 0 200 100" className="w-full max-w-xs">
          <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke={themeColors.border} strokeWidth="14" strokeLinecap="round" />
          <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke={`url(#g${theme})`} strokeWidth="14" strokeLinecap="round" />
          <line x1="100" y1="90" x2={100 + 50 * Math.cos((angle - 90) * Math.PI / 180)} y2={90 + 50 * Math.sin((angle - 90) * Math.PI / 180)} stroke={themeColors.text} strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="90" r="8" fill={themeColors.accent.blue} />
          <defs>
            <linearGradient id={`g${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={themeColors.accent.sell} />
              <stop offset="50%" stopColor={themeColors.accent.orange} />
              <stop offset="100%" stopColor={themeColors.accent.buy} />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-center mt-2">
          <span className="text-lg font-bold" style={{ color: sentiment > 20 ? themeColors.accent.buy : sentiment < -20 ? themeColors.accent.sell : themeColors.accent.orange }}>
            {sentiment > 20 ? 'BULLISH' : sentiment < -20 ? 'BEARISH' : 'NEUTRAL'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==================== DASHBOARD PAGE ====================
function DashboardPage({ theme, selectedSymbol, onSelectSymbol }: { 
  theme: 'dark' | 'light'; 
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}) {
  const themeColors = colors[theme];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ backgroundColor: themeColors.bg }}>
      <div className="flex-1 flex min-h-0 p-4 gap-4">
        {/* Left - Market Watch */}
        <div className="w-64 shrink-0 hidden xl:flex flex-col">
          <MarketWatch theme={theme} selectedSymbol={selectedSymbol} onSelectSymbol={onSelectSymbol} />
        </div>

        {/* Center */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-4">
          <div className="flex-1 flex min-h-0 gap-4">
            {/* Chart */}
            <div className="flex-1 min-w-0">
              <TradingChart theme={theme} symbol={selectedSymbol} />
            </div>
            {/* Signal */}
            <div className="w-80 shrink-0 hidden lg:flex flex-col">
              <SignalCenter theme={theme} symbol={selectedSymbol} />
            </div>
          </div>

          {/* Bottom - 3 sections */}
          <div className="h-48 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 h-full gap-4">
              <Heatmap theme={theme} />
              <Sentiment theme={theme} />
              <div className="rounded-xl" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
                <div className="p-4 border-b" style={{ borderColor: themeColors.border }}>
                  <h2 className="text-sm font-bold" style={{ color: themeColors.text }}>💼 QUICK STATS</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span style={{ color: themeColors.textSecondary }}>Trades: </span>
                      <span className="font-bold" style={{ color: themeColors.text }}>247</span>
                    </div>
                    <div>
                      <span style={{ color: themeColors.textSecondary }}>Win Rate: </span>
                      <span className="font-bold" style={{ color: themeColors.accent.buy }}>68%</span>
                    </div>
                    <div>
                      <span style={{ color: themeColors.textSecondary }}>Profit: </span>
                      <span className="font-bold" style={{ color: themeColors.accent.buy }}>+$12,450</span>
                    </div>
                    <div>
                      <span style={{ color: themeColors.textSecondary }}>DD: </span>
                      <span className="font-bold" style={{ color: themeColors.accent.sell }}>-3.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== CHARTS PAGE ====================
function ChartsPage({ theme, selectedSymbol, onSelectSymbol }: { 
  theme: 'dark' | 'light'; 
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}) {
  const themeColors = colors[theme];
  const { tickers } = useMarketData();

  return (
    <div className="p-4 lg:p-6 min-h-screen" style={{ backgroundColor: themeColors.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: themeColors.text }}>
            <LineChart size={28} style={{ color: themeColors.accent.blue }} />
            Advanced Charts
          </h1>
          <p style={{ color: themeColors.textSecondary }}>Multi-asset technical analysis and charting</p>
        </div>

        {/* Symbol Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tickers.slice(0, 8).map((ticker) => (
            <button key={ticker.symbol} onClick={() => onSelectSymbol(ticker.symbol)}
              className="px-4 py-2 rounded-xl font-medium transition-all"
              style={{
                backgroundColor: selectedSymbol === ticker.symbol ? themeColors.accent.blue : themeColors.card,
                color: selectedSymbol === ticker.symbol ? 'white' : themeColors.textSecondary,
                border: `1px solid ${selectedSymbol === ticker.symbol ? themeColors.accent.blue : themeColors.border}`,
              }}>
              {ticker.symbol}
            </button>
          ))}
        </div>

        {/* Main Chart */}
        <div className="h-[500px] rounded-xl overflow-hidden" style={{ border: `1px solid ${themeColors.border}` }}>
          <TradingChart theme={theme} symbol={selectedSymbol} fullscreen />
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN ====================
export default function TradingPlatform() {
  const { theme, toggleTheme } = useTheme();
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const themeColors = colors[theme];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage theme={theme} selectedSymbol={selectedSymbol} onSelectSymbol={setSelectedSymbol} />;
      case 'charts':
        return <ChartsPage theme={theme} selectedSymbol={selectedSymbol} onSelectSymbol={setSelectedSymbol} />;
      case 'calculators':
        return <QuantCalculatorsFull theme={theme} />;
      case 'portfolio':
        return <PortfolioFull theme={theme} />;
      case 'ai-signals':
        return <AISignalsFull theme={theme} />;
      default:
        return <DashboardPage theme={theme} selectedSymbol={selectedSymbol} onSelectSymbol={setSelectedSymbol} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: themeColors.bg, color: themeColors.text }}>
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {renderPage()}

      {/* Footer */}
      <footer className="mt-auto border-t shrink-0" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
        <div className="flex items-center justify-between px-4 py-2 text-xs" style={{ color: themeColors.textSecondary }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColors.accent.buy }} />
              <span>Live Feed</span>
            </div>
            <span className="hidden sm:inline">Latency: 12ms</span>
            <span className="hidden md:inline">| Prime API</span>
          </div>
          <span className="font-medium">Elite AI Trading Platform v3.0</span>
        </div>
      </footer>
    </div>
  );
}
