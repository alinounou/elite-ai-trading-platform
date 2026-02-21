'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Brain, Zap, Target, Shield,
  RefreshCw, Sun, Moon, Calculator, AlertTriangle, BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line, PieChart as RechartsPie, Pie, Cell
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

// ==================== MAIN COMPONENT ====================
export default function TradingPlatform() {
  const { theme, toggleTheme } = useTheme();
  const themeColors = colors[theme];
  const { tickers, getTickersByType } = useMarketData();
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [currentTime, setCurrentTime] = useState('');

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

  const forexTickers = useMemo(() => getTickersByType('forex'), [getTickersByType]);
  const cryptoTickers = useMemo(() => getTickersByType('crypto'), [getTickersByType]);
  const stockTickers = useMemo(() => getTickersByType('stock'), [getTickersByType]);
  const metalTickers = useMemo(() => getTickersByType('metal'), [getTickersByType]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.bg }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
              background: `linear-gradient(135deg, ${themeColors.accent.blue}, ${themeColors.accent.purple})` 
            }}>
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg" style={{ color: themeColors.text }}>ELITE AI TRADING</span>
              <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-3">
            <div className="text-sm hidden md:block" style={{ color: themeColors.textSecondary }}>
              {currentTime || '--:--:--'}
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-lg" style={{ backgroundColor: themeColors.border, color: themeColors.text }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - All Cards Stacked */}
      <main className="p-4 space-y-4 max-w-7xl mx-auto">
        
        {/* Row 1: Market Watch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MarketCard title="FOREX" tickers={forexTickers.slice(0, 4)} theme={theme} selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} icon={<BarChart3 size={14} />} />
          <MarketCard title="CRYPTO" tickers={cryptoTickers.slice(0, 4)} theme={theme} selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} icon={<Activity size={14} />} />
          <MarketCard title="STOCKS" tickers={stockTickers.slice(0, 4)} theme={theme} selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} icon={<TrendingUp size={14} />} />
          <MarketCard title="METALS" tickers={metalTickers.slice(0, 4)} theme={theme} selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} icon={<Target size={14} />} />
        </div>

        {/* Row 2: Chart + AI Signal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartCard theme={theme} symbol={selectedSymbol} />
          </div>
          <AISignalCard theme={theme} symbol={selectedSymbol} />
        </div>

        {/* Row 3: Portfolio + Risk Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PortfolioCard theme={theme} />
          <RiskMetricsCard theme={theme} />
        </div>

        {/* Row 4: All Calculators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PositionCalculatorCard theme={theme} />
          <KellyCalculatorCard theme={theme} />
          <VarCalculatorCard theme={theme} />
          <MonteCarloCalculatorCard theme={theme} />
        </div>

      </main>
    </div>
  );
}

// ==================== MARKET CARD ====================
function MarketCard({ title, tickers, theme, selectedSymbol, onSelect, icon }: { 
  title: string; 
  tickers: ReturnType<typeof useMarketData>['tickers']; 
  theme: 'dark' | 'light';
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  icon: React.ReactNode;
}) {
  const themeColors = colors[theme];

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('JPY')) return price.toFixed(2);
    if (symbol.includes('BTC')) return price.toFixed(0);
    if (price >= 1000) return price.toFixed(2);
    return price.toFixed(5);
  };

  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: themeColors.accent.blue }}>{icon}</span>
        <span className="text-xs font-bold" style={{ color: themeColors.text }}>{title}</span>
      </div>
      <div className="space-y-1">
        {tickers.map((ticker) => (
          <div key={ticker.symbol} onClick={() => onSelect(ticker.symbol)}
            className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all"
            style={{ backgroundColor: selectedSymbol === ticker.symbol ? themeColors.border : 'transparent' }}>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs truncate" style={{ color: themeColors.text }}>{ticker.name}</div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="font-mono text-xs font-bold" style={{ color: themeColors.text }} suppressHydrationWarning>
                {formatPrice(ticker.price, ticker.symbol)}
              </div>
              <div className="flex items-center justify-end gap-1">
                {ticker.changePercent >= 0 ? 
                  <TrendingUp size={10} style={{ color: themeColors.accent.buy }} /> :
                  <TrendingDown size={10} style={{ color: themeColors.accent.sell }} />
                }
                <span className="text-[10px] font-mono font-medium" style={{
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

// ==================== CHART CARD ====================
function ChartCard({ theme, symbol }: { theme: 'dark' | 'light'; symbol: string }) {
  const { candles, isLoading } = useHistoricalData(symbol, '1h', 50);
  const themeColors = colors[theme];
  const { tickers } = useMarketData();
  
  const currentTicker = tickers.find(t => t.symbol === symbol);
  const priceChange = currentTicker?.changePercent || 0;

  const chartData = useMemo(() => {
    if (candles.length === 0) return [];
    return candles.map((candle) => ({
      time: new Date(candle.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      close: candle.close,
    }));
  }, [candles]);

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg" style={{ color: themeColors.text }}>{symbol}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono font-bold" style={{ color: themeColors.text }} suppressHydrationWarning>
              {currentTicker?.price?.toFixed(symbol.includes('JPY') ? 2 : 5) || '0.00000'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ 
              backgroundColor: priceChange >= 0 ? 'rgba(0, 210, 106, 0.15)' : 'rgba(255, 59, 92, 0.15)',
              color: priceChange >= 0 ? themeColors.accent.buy : themeColors.accent.sell,
            }}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      <div className="h-40">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <RefreshCw className="animate-spin" size={24} style={{ color: themeColors.accent.blue }} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${theme}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={themeColors.accent.blue} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={themeColors.accent.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} opacity={0.5} />
              <XAxis dataKey="time" stroke={themeColors.textSecondary} fontSize={9} tickLine={false} />
              <YAxis stroke={themeColors.textSecondary} fontSize={9} tickLine={false} domain={['auto', 'auto']} orientation="right" width={50} />
              <Tooltip contentStyle={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}`, borderRadius: '8px', color: themeColors.text }} />
              <Area type="monotone" dataKey="close" stroke={themeColors.accent.blue} fill={`url(#gradient-${theme})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ==================== AI SIGNAL CARD ====================
function AISignalCard({ theme, symbol }: { theme: 'dark' | 'light'; symbol: string }) {
  const { analysis, isLoading } = useAISignal(symbol);
  const themeColors = colors[theme];

  if (isLoading || !analysis) {
    return (
      <div className="rounded-xl p-4 h-full flex items-center justify-center" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
        <Brain className="animate-pulse" size={32} style={{ color: themeColors.accent.purple }} />
      </div>
    );
  }

  const signal = analysis.signal;
  const signalColor = signal.type === 'BUY' ? themeColors.accent.buy :
                      signal.type === 'SELL' ? themeColors.accent.sell :
                      themeColors.accent.orange;

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: themeColors.text }}>
          <Brain size={14} style={{ color: themeColors.accent.purple }} />
          AI SIGNAL
        </h3>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ backgroundColor: themeColors.border, color: themeColors.accent.purple }}>
          <Activity size={10} />
          <span>ACTIVE</span>
        </div>
      </div>

      <div className="text-center mb-3">
        <div className="inline-block px-6 py-2 rounded-lg text-xl font-bold" style={{ 
          backgroundColor: `${signalColor}20`,
          color: signalColor,
          boxShadow: `0 0 30px ${signalColor}40`,
        }}>
          {signal.type}
        </div>
        <div className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
          Confidence: <span className="font-mono font-bold" style={{ color: themeColors.text }}>{signal.confidence.toFixed(0)}%</span>
        </div>
      </div>

      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: themeColors.border }}>
        <div className="h-full rounded-full" style={{ width: `${signal.probability}%`, backgroundColor: signalColor }} />
      </div>

      {signal.entry && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg" style={{ backgroundColor: themeColors.border }}>
            <div className="text-[10px]" style={{ color: themeColors.textSecondary }}>ENTRY</div>
            <div className="font-mono text-xs font-bold" style={{ color: themeColors.text }}>{signal.entry.toFixed(5)}</div>
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: themeColors.border }}>
            <div className="text-[10px]" style={{ color: themeColors.accent.sell }}>SL</div>
            <div className="font-mono text-xs font-bold" style={{ color: themeColors.accent.sell }}>{signal.stopLoss?.toFixed(5)}</div>
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: themeColors.border }}>
            <div className="text-[10px]" style={{ color: themeColors.accent.buy }}>TP</div>
            <div className="font-mono text-xs font-bold" style={{ color: themeColors.accent.buy }}>{signal.takeProfit?.toFixed(5)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== PORTFOLIO CARD ====================
function PortfolioCard({ theme }: { theme: 'dark' | 'light' }) {
  const { portfolio, positions } = usePortfolio();
  const themeColors = colors[theme];

  const pieData = [
    { name: 'Equity', value: portfolio.equity, color: themeColors.accent.buy },
    { name: 'Margin', value: portfolio.margin, color: themeColors.accent.sell },
    { name: 'Free', value: portfolio.freeMargin, color: themeColors.accent.blue },
  ];

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: themeColors.text }}>
        <Target size={14} style={{ color: themeColors.accent.cyan }} />
        PORTFOLIO
      </h3>
      <div className="flex items-center gap-4">
        <div className="h-24 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </RechartsPie>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-xs">
            <span style={{ color: themeColors.textSecondary }}>Balance</span>
            <span className="font-mono font-bold" style={{ color: themeColors.text }}>${portfolio.totalBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: themeColors.textSecondary }}>Equity</span>
            <span className="font-mono font-bold" style={{ color: themeColors.accent.buy }}>${portfolio.equity.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: themeColors.textSecondary }}>P&L</span>
            <span className="font-mono font-bold" style={{ color: portfolio.unrealizedPnl >= 0 ? themeColors.accent.buy : themeColors.accent.sell }}>
              ${portfolio.unrealizedPnl.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: themeColors.textSecondary }}>Daily</span>
            <span className="font-mono font-bold" style={{ color: portfolio.dailyPnl >= 0 ? themeColors.accent.buy : themeColors.accent.sell }}>
              {portfolio.dailyPnl >= 0 ? '+' : ''}${portfolio.dailyPnl.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== RISK METRICS CARD ====================
function RiskMetricsCard({ theme }: { theme: 'dark' | 'light' }) {
  const riskMetrics = useRiskMetrics();
  const themeColors = colors[theme];

  const metrics = [
    { label: 'VaR (95%)', value: `$${riskMetrics.valueAtRisk.toLocaleString()}`, color: themeColors.accent.sell },
    { label: 'Sharpe', value: riskMetrics.sharpeRatio.toFixed(2), color: themeColors.accent.buy },
    { label: 'Max DD', value: `${riskMetrics.maxDrawdown}%`, color: themeColors.accent.orange },
    { label: 'Win Rate', value: `${riskMetrics.winRate}%`, color: themeColors.accent.cyan },
  ];

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: themeColors.text }}>
        <Shield size={14} style={{ color: themeColors.accent.orange }} />
        RISK METRICS
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-2 rounded-lg" style={{ backgroundColor: themeColors.border }}>
            <div className="text-[10px]" style={{ color: themeColors.textSecondary }}>{metric.label}</div>
            <div className="font-mono text-sm font-bold" style={{ color: metric.color }}>{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== POSITION CALCULATOR CARD ====================
function PositionCalculatorCard({ theme }: { theme: 'dark' | 'light' }) {
  const themeColors = colors[theme];
  const [inputs, setInputs] = useState({ balance: 10000, riskPercent: 2, entry: 1.0850, stopLoss: 1.0800 });

  const result = calculatePositionSize({
    accountBalance: inputs.balance,
    riskPercent: inputs.riskPercent,
    entryPrice: inputs.entry,
    stopLoss: inputs.stopLoss,
    instrumentType: 'forex',
  });

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: themeColors.text }}>
        <Calculator size={14} style={{ color: themeColors.accent.purple }} />
        POSITION SIZE
      </h3>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>Balance ($)</label>
          <input type="number" value={inputs.balance}
            onChange={(e) => setInputs({ ...inputs, balance: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-sm font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>Risk (%)</label>
          <input type="number" value={inputs.riskPercent}
            onChange={(e) => setInputs({ ...inputs, riskPercent: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-sm font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>Entry</label>
          <input type="number" step="0.00001" value={inputs.entry}
            onChange={(e) => setInputs({ ...inputs, entry: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-sm font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>Stop Loss</label>
          <input type="number" step="0.00001" value={inputs.stopLoss}
            onChange={(e) => setInputs({ ...inputs, stopLoss: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-sm font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
          <div className="text-[10px]" style={{ color: themeColors.textSecondary }}>Lots</div>
          <div className="font-mono text-lg font-bold" style={{ color: themeColors.accent.blue }}>{result.lots.toFixed(2)}</div>
        </div>
        <div className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
          <div className="text-[10px]" style={{ color: themeColors.textSecondary }}>Risk Amount</div>
          <div className="font-mono text-lg font-bold" style={{ color: themeColors.accent.sell }}>${result.riskAmount.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

// ==================== KELLY CALCULATOR CARD ====================
function KellyCalculatorCard({ theme }: { theme: 'dark' | 'light' }) {
  const themeColors = colors[theme];
  const [inputs, setInputs] = useState({ winProbability: 55, winLossRatio: 1.5 });

  const result = calculateKellyCriterion({
    winProbability: inputs.winProbability / 100,
    winLossRatio: inputs.winLossRatio,
  });

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: themeColors.text }}>
        <Calculator size={14} style={{ color: themeColors.accent.cyan }} />
        KELLY CRITERION
      </h3>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>Win Rate (%)</label>
          <input type="number" value={inputs.winProbability}
            onChange={(e) => setInputs({ ...inputs, winProbability: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-sm font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>W/L Ratio</label>
          <input type="number" step="0.1" value={inputs.winLossRatio}
            onChange={(e) => setInputs({ ...inputs, winLossRatio: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-sm font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
      </div>
      <div className="p-3 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
        <div className="text-[10px]" style={{ color: themeColors.textSecondary }}>Kelly %</div>
        <div className="font-mono text-2xl font-bold" style={{ color: result > 0 ? themeColors.accent.buy : themeColors.accent.sell }}>
          {(result * 100).toFixed(1)}%
        </div>
        <div className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
          Half Kelly: <span className="font-mono font-bold" style={{ color: themeColors.accent.cyan }}>{(result * 50).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

// ==================== VAR CALCULATOR CARD ====================
function VarCalculatorCard({ theme }: { theme: 'dark' | 'light' }) {
  const themeColors = colors[theme];
  const [inputs, setInputs] = useState({ portfolioValue: 100000, confidence: 95, volatility: 15 });

  const result = calculateVaR({
    portfolioValue: inputs.portfolioValue,
    confidenceLevel: inputs.confidence / 100,
    timeHorizon: 1,
    volatility: inputs.volatility / 100,
  });

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: themeColors.text }}>
        <Shield size={14} style={{ color: themeColors.accent.sell }} />
        VALUE AT RISK
      </h3>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>Portfolio ($)</label>
          <input type="number" value={inputs.portfolioValue}
            onChange={(e) => setInputs({ ...inputs, portfolioValue: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-xs font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>Conf. (%)</label>
          <input type="number" value={inputs.confidence}
            onChange={(e) => setInputs({ ...inputs, confidence: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-xs font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>Vol. (%)</label>
          <input type="number" value={inputs.volatility}
            onChange={(e) => setInputs({ ...inputs, volatility: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-xs font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
          <div className="text-[10px]" style={{ color: themeColors.textSecondary }}>VaR</div>
          <div className="font-mono text-lg font-bold" style={{ color: themeColors.accent.sell }}>-${result.varParametric.toFixed(0)}</div>
        </div>
        <div className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
          <div className="text-[10px]" style={{ color: themeColors.textSecondary }}>CVaR</div>
          <div className="font-mono text-lg font-bold" style={{ color: themeColors.accent.orange }}>-${result.expectedShortfall.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}

// ==================== MONTE CARLO CALCULATOR CARD ====================
function MonteCarloCalculatorCard({ theme }: { theme: 'dark' | 'light' }) {
  const themeColors = colors[theme];
  const [inputs, setInputs] = useState({ capital: 10000, expectedReturn: 12, volatility: 20 });

  const result = useMemo(() => calculateMonteCarlo({
    initialCapital: inputs.capital,
    expectedReturn: inputs.expectedReturn / 100,
    volatility: inputs.volatility / 100,
    timeHorizon: 252,
    simulations: 500,
    trades: 252,
  }), [inputs]);

  // Calculate expected gain/loss
  const expectedGain = result.expectedValue - inputs.capital;
  const expectedGainPercent = (expectedGain / inputs.capital) * 100;

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: themeColors.text }}>
        <RefreshCw size={14} style={{ color: themeColors.accent.purple }} />
        MONTE CARLO
      </h3>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>Capital ($)</label>
          <input type="number" value={inputs.capital}
            onChange={(e) => setInputs({ ...inputs, capital: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-xs font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>Return (%)</label>
          <input type="number" value={inputs.expectedReturn}
            onChange={(e) => setInputs({ ...inputs, expectedReturn: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-xs font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: themeColors.textSecondary }}>Vol. (%)</label>
          <input type="number" value={inputs.volatility}
            onChange={(e) => setInputs({ ...inputs, volatility: Number(e.target.value) })}
            className="w-full p-2 rounded-lg text-xs font-mono"
            style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
          <div className="text-[10px]" style={{ color: themeColors.textSecondary }}>Prob. Ruin</div>
          <div className="font-mono text-lg font-bold" style={{ color: themeColors.accent.sell }}>{(result.probabilityOfRuin * 100).toFixed(1)}%</div>
        </div>
        <div className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
          <div className="text-[10px]" style={{ color: themeColors.textSecondary }}>Expected Gain</div>
          <div className="font-mono text-lg font-bold" style={{ color: expectedGain >= 0 ? themeColors.accent.buy : themeColors.accent.sell }}>
            {expectedGain >= 0 ? '+' : ''}{expectedGainPercent.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
