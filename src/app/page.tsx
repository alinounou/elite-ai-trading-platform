'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Brain, Zap, Target, Shield,
  RefreshCw, Sun, Moon, DollarSign, Percent
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line, PieChart as RechartsPie, Pie, Cell
} from 'recharts';
import { useMarketData, useHistoricalData, useAISignal, useTheme, usePortfolio, useRiskMetrics } from '@/hooks/use-market-data';
import { calculatePositionSize, calculateKellyCriterion } from '@/lib/quant';

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

// ==================== HEADER ====================
function Header({ theme, toggleTheme }: { theme: 'dark' | 'light'; toggleTheme: () => void }) {
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
    <header className="flex items-center justify-between px-4 py-2 border-b shrink-0" style={{ 
      backgroundColor: themeColors.card, 
      borderColor: themeColors.border 
    }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ 
          background: `linear-gradient(135deg, ${themeColors.accent.blue}, ${themeColors.accent.purple})` 
        }}>
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-lg" style={{ color: themeColors.text }}>ELITE AI TRADING</span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ 
              backgroundColor: 'rgba(0, 210, 106, 0.15)',
              color: themeColors.accent.buy
            }}>
              <Activity size={10} />
              <span>LIVE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
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

  const filteredTickers = useMemo(() => getTickersByType(activeTab).slice(0, 10), [getTickersByType, activeTab]);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('JPY')) return price.toFixed(2);
    if (symbol.includes('BTC')) return price.toFixed(0);
    if (price >= 1000) return price.toFixed(2);
    return price.toFixed(5);
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: themeColors.card }}>
      <div className="p-3 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <h2 className="text-sm font-bold mb-2" style={{ color: themeColors.text }}>📊 MARKET WATCH</h2>
        <div className="flex flex-wrap gap-1">
          {(['forex', 'crypto', 'stock', 'metal'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-2 py-1 text-xs rounded font-medium transition-all"
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
            className="flex items-center justify-between p-3 cursor-pointer transition-all"
            style={{
              backgroundColor: selectedSymbol === ticker.symbol ? themeColors.border : 'transparent',
              borderBottom: `1px solid ${themeColors.border}`,
            }}>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm" style={{ color: themeColors.text }}>{ticker.name}</div>
              <span className="text-xs" style={{ color: themeColors.textSecondary }}>{ticker.symbol}</span>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="font-mono text-sm font-medium" style={{ color: themeColors.text }}>
                {formatPrice(ticker.price, ticker.symbol)}
              </div>
              <div className="flex items-center justify-end gap-1">
                {ticker.changePercent >= 0 ? 
                  <TrendingUp size={12} style={{ color: themeColors.accent.buy }} /> :
                  <TrendingDown size={12} style={{ color: themeColors.accent.sell }} />
                }
                <span className="text-xs font-mono" style={{
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
function TradingChart({ theme, symbol }: { theme: 'dark' | 'light'; symbol: string }) {
  const { candles, isLoading } = useHistoricalData(symbol, '1h', 100);
  const themeColors = colors[theme];
  const [timeframe, setTimeframe] = useState('1h');
  const { tickers } = useMarketData();
  
  const currentTicker = tickers.find(t => t.symbol === symbol);
  const priceChange = currentTicker?.changePercent || 0;

  const chartData = useMemo(() => {
    return candles.map((candle, index) => ({
      time: new Date(candle.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      close: candle.close,
      ma20: index > 19 ? candles.slice(index - 19, index + 1).reduce((sum, c) => sum + c.close, 0) / 20 : null,
    }));
  }, [candles]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: themeColors.card }}>
        <RefreshCw className="animate-spin" size={32} style={{ color: themeColors.accent.blue }} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: themeColors.card }}>
      <div className="p-3 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xl" style={{ color: themeColors.text }}>{symbol}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-mono font-bold" style={{ color: themeColors.text }}>
                {currentTicker?.price?.toFixed(symbol.includes('JPY') ? 2 : 5) || '0.00000'}
              </span>
              <span className="text-sm px-2 py-1 rounded font-medium" style={{ 
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
                className="px-2 py-1 text-xs rounded font-medium transition-all"
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

      <div className="flex-1 p-2 min-h-0">
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
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: themeColors.card }}>
        <Brain className="animate-pulse" size={40} style={{ color: themeColors.accent.purple }} />
      </div>
    );
  }

  const signal = analysis.signal;
  const signalColor = signal.type === 'BUY' ? themeColors.accent.buy :
                      signal.type === 'SELL' ? themeColors.accent.sell :
                      themeColors.accent.orange;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: themeColors.card }}>
      <div className="p-3 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold" style={{ color: themeColors.text }}>🤖 AI SIGNAL</h2>
          <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: themeColors.border }}>
            <Brain size={12} style={{ color: themeColors.accent.purple }} />
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
            <div key={i} className="flex items-start gap-2 text-xs p-2 rounded" style={{ backgroundColor: themeColors.border }}>
              <Zap size={12} className="mt-0.5 shrink-0" style={{ color: themeColors.accent.blue }} />
              <span style={{ color: themeColors.text }}>{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== QUANT CALCULATORS ====================
function QuantCalculators({ theme }: { theme: 'dark' | 'light' }) {
  const themeColors = colors[theme];
  const [activeCalc, setActiveCalc] = useState<'position' | 'var' | 'kelly'>('position');
  
  const [posInputs, setPosInputs] = useState({ balance: 10000, riskPercent: 2, entry: 1.0850, stopLoss: 1.0800 });
  const [kellyInputs, setKellyInputs] = useState({ winProbability: 0.55, winLossRatio: 1.5 });

  const positionResult = calculatePositionSize({
    accountBalance: posInputs.balance, riskPercent: posInputs.riskPercent,
    entryPrice: posInputs.entry, stopLoss: posInputs.stopLoss, instrumentType: 'forex',
  });

  const kellyResult = calculateKellyCriterion(kellyInputs);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: themeColors.card }}>
      <div className="p-3 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <h2 className="text-sm font-bold mb-2" style={{ color: themeColors.text }}>🧮 QUANT CALCULATORS</h2>
        <div className="flex gap-1">
          {[{ id: 'position', label: '📊 Size' }, { id: 'var', label: '⚠️ VaR' }, { id: 'kelly', label: '📈 Kelly' }].map((c) => (
            <button key={c.id} onClick={() => setActiveCalc(c.id as typeof activeCalc)}
              className="flex-1 py-2 text-xs rounded font-medium transition-all"
              style={{
                backgroundColor: activeCalc === c.id ? themeColors.accent.blue : themeColors.border,
                color: activeCalc === c.id ? 'white' : themeColors.textSecondary,
              }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto min-h-0">
        {activeCalc === 'position' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: themeColors.textSecondary }}>Account Balance ($)</label>
              <input type="number" value={posInputs.balance}
                onChange={(e) => setPosInputs({ ...posInputs, balance: Number(e.target.value) })}
                className="w-full p-2 rounded text-sm font-mono font-medium"
                style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: themeColors.textSecondary }}>Risk %</label>
                <input type="number" value={posInputs.riskPercent}
                  onChange={(e) => setPosInputs({ ...posInputs, riskPercent: Number(e.target.value) })}
                  className="w-full p-2 rounded text-sm font-mono font-medium"
                  style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: themeColors.textSecondary }}>Entry</label>
                <input type="number" step="0.00001" value={posInputs.entry}
                  onChange={(e) => setPosInputs({ ...posInputs, entry: Number(e.target.value) })}
                  className="w-full p-2 rounded text-sm font-mono font-medium"
                  style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.border }}>
              <div className="text-xs font-bold mb-2" style={{ color: themeColors.accent.blue }}>RESULTS</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span style={{ color: themeColors.textSecondary }}>Position:</span>
                  <div className="font-mono font-bold" style={{ color: themeColors.text }}>{positionResult.positionSize.toFixed(0)} units</div>
                </div>
                <div>
                  <span style={{ color: themeColors.textSecondary }}>Lots:</span>
                  <div className="font-mono font-bold" style={{ color: themeColors.text }}>{positionResult.lots.toFixed(2)}</div>
                </div>
                <div>
                  <span style={{ color: themeColors.textSecondary }}>Risk:</span>
                  <div className="font-mono font-bold" style={{ color: themeColors.accent.sell }}>${positionResult.riskAmount.toFixed(2)}</div>
                </div>
                <div>
                  <span style={{ color: themeColors.textSecondary }}>Pips:</span>
                  <div className="font-mono font-bold" style={{ color: themeColors.text }}>{positionResult.pipDistance.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCalc === 'kelly' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: themeColors.textSecondary }}>Win Rate (%)</label>
              <input type="number" value={kellyInputs.winProbability * 100}
                onChange={(e) => setKellyInputs({ ...kellyInputs, winProbability: Number(e.target.value) / 100 })}
                className="w-full p-2 rounded text-sm font-mono font-medium"
                style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: themeColors.textSecondary }}>Win/Loss Ratio</label>
              <input type="number" step="0.1" value={kellyInputs.winLossRatio}
                onChange={(e) => setKellyInputs({ ...kellyInputs, winLossRatio: Number(e.target.value) })}
                className="w-full p-2 rounded text-sm font-mono font-medium"
                style={{ backgroundColor: themeColors.border, color: themeColors.text, border: 'none', outline: 'none' }} />
            </div>
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
              <div className="text-xs font-bold mb-1" style={{ color: themeColors.accent.purple }}>KELLY CRITERION</div>
              <div className="text-4xl font-mono font-bold" style={{ color: kellyResult > 0 ? themeColors.accent.buy : themeColors.accent.sell }}>
                {(kellyResult * 100).toFixed(1)}%
              </div>
              <div className="text-sm mt-2" style={{ color: themeColors.textSecondary }}>
                Half Kelly: <span className="font-mono font-bold" style={{ color: themeColors.accent.cyan }}>{(kellyResult * 50).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {activeCalc === 'var' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.border }}>
              <div className="text-xs font-bold mb-2" style={{ color: themeColors.accent.orange }}>VALUE AT RISK</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: themeColors.textSecondary }}>95% VaR (1 Day)</span>
                  <span className="font-mono font-bold" style={{ color: themeColors.accent.sell }}>-$2,450</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.textSecondary }}>99% VaR (1 Day)</span>
                  <span className="font-mono font-bold" style={{ color: themeColors.accent.sell }}>-$3,520</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.textSecondary }}>Expected Shortfall</span>
                  <span className="font-mono font-bold" style={{ color: themeColors.accent.sell }}>-$4,180</span>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.border }}>
              <div className="text-xs font-bold mb-2" style={{ color: themeColors.accent.blue }}>STRESS TESTS</div>
              <div className="space-y-2 text-sm">
                {[{ n: 'Market Crash (-20%)', v: -8500 }, { n: 'Flash Crash (-10%)', v: -4250 }, { n: 'Volatility Spike', v: -2100 }].map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>{s.n}</span>
                    <span className="font-mono font-bold" style={{ color: themeColors.accent.sell }}>${s.v.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== PORTFOLIO ====================
function Portfolio({ theme }: { theme: 'dark' | 'light' }) {
  const { portfolio, positions } = usePortfolio();
  const riskMetrics = useRiskMetrics();
  const themeColors = colors[theme];

  const pieData = [
    { name: 'Forex', value: 45, color: themeColors.accent.blue },
    { name: 'Crypto', value: 25, color: themeColors.accent.purple },
    { name: 'Metals', value: 20, color: themeColors.accent.orange },
    { name: 'Stocks', value: 10, color: themeColors.accent.cyan },
  ];

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: themeColors.card }}>
      <div className="p-3 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <h2 className="text-sm font-bold" style={{ color: themeColors.text }}>💼 PORTFOLIO</h2>
      </div>

      <div className="flex-1 p-3 overflow-y-auto min-h-0">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { l: 'Balance', v: `$${portfolio.totalBalance.toLocaleString()}` },
            { l: 'Equity', v: `$${portfolio.equity.toLocaleString()}` },
            { l: 'P/L Day', v: `$${portfolio.dailyPnl.toFixed(0)}`, c: portfolio.dailyPnl >= 0 ? themeColors.accent.buy : themeColors.accent.sell },
            { l: 'P/L Week', v: `$${portfolio.weeklyPnl.toFixed(0)}`, c: portfolio.weeklyPnl >= 0 ? themeColors.accent.buy : themeColors.accent.sell },
          ].map((item, i) => (
            <div key={i} className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
              <div className="text-xs" style={{ color: themeColors.textSecondary }}>{item.l}</div>
              <div className="font-mono font-bold text-sm" style={{ color: item.c || themeColors.text }}>{item.v}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { l: 'Sharpe', v: riskMetrics.sharpeRatio.toFixed(2), c: themeColors.accent.buy },
            { l: 'Max DD', v: `${riskMetrics.maxDrawdown.toFixed(1)}%`, c: themeColors.accent.sell },
            { l: 'Win %', v: `${riskMetrics.winRate.toFixed(0)}%`, c: themeColors.accent.buy },
          ].map((item, i) => (
            <div key={i} className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.border }}>
              <div className="text-xs" style={{ color: themeColors.textSecondary }}>{item.l}</div>
              <div className="font-mono font-bold" style={{ color: item.c }}>{item.v}</div>
            </div>
          ))}
        </div>

        <div className="text-xs font-bold mb-2" style={{ color: themeColors.textSecondary }}>POSITIONS</div>
        <div className="space-y-1 mb-3">
          {positions.map((pos) => (
            <div key={pos.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: themeColors.border }}>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ 
                  backgroundColor: pos.type === 'long' ? `${themeColors.accent.buy}20` : `${themeColors.accent.sell}20`,
                  color: pos.type === 'long' ? themeColors.accent.buy : themeColors.accent.sell,
                }}>{pos.type.toUpperCase()}</span>
                <span className="font-medium text-sm" style={{ color: themeColors.text }}>{pos.symbol}</span>
              </div>
              <div className="font-mono text-sm font-bold" style={{ color: pos.pnl >= 0 ? themeColors.accent.buy : themeColors.accent.sell }}>
                ${pos.pnl.toFixed(0)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-20 h-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={35} dataKey="value" stroke="none">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span style={{ color: themeColors.textSecondary }}>{item.name}</span>
                </div>
                <span className="font-mono font-medium" style={{ color: themeColors.text }}>{item.value}%</span>
              </div>
            ))}
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
    <div className="h-full flex flex-col" style={{ backgroundColor: themeColors.card }}>
      <div className="p-3 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <h2 className="text-sm font-bold" style={{ color: themeColors.text }}>🔥 MARKET HEATMAP</h2>
      </div>
      <div className="flex-1 p-3 min-h-0">
        <div className="grid grid-cols-4 gap-1.5">
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
    <div className="h-full flex flex-col" style={{ backgroundColor: themeColors.card }}>
      <div className="p-3 border-b shrink-0" style={{ borderColor: themeColors.border }}>
        <h2 className="text-sm font-bold" style={{ color: themeColors.text }}>📊 SENTIMENT</h2>
      </div>
      <div className="flex-1 p-3 flex flex-col justify-center items-center min-h-0">
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

// ==================== MAIN ====================
export default function TradingPlatform() {
  const { theme, toggleTheme } = useTheme();
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const themeColors = colors[theme];

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: themeColors.bg, color: themeColors.text }}>
      <Header theme={theme} toggleTheme={toggleTheme} />

      <div className="flex-1 flex min-h-0">
        {/* Left - Market Watch */}
        <div className="w-56 border-r shrink-0 hidden lg:flex flex-col" style={{ borderColor: themeColors.border }}>
          <MarketWatch theme={theme} selectedSymbol={selectedSymbol} onSelectSymbol={setSelectedSymbol} />
        </div>

        {/* Center */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 flex min-h-0">
            {/* Chart */}
            <div className="flex-1 min-w-0" style={{ minWidth: 320 }}>
              <TradingChart theme={theme} symbol={selectedSymbol} />
            </div>
            {/* Signal */}
            <div className="w-80 border-l shrink-0 hidden md:flex flex-col" style={{ borderColor: themeColors.border }}>
              <SignalCenter theme={theme} symbol={selectedSymbol} />
            </div>
          </div>

          {/* Bottom - 3 sections */}
          <div className="h-52 border-t shrink-0" style={{ borderColor: themeColors.border }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 h-full">
              <Heatmap theme={theme} />
              <Sentiment theme={theme} />
              <Portfolio theme={theme} />
            </div>
          </div>
        </div>

        {/* Right - Calculators */}
        <div className="w-72 border-l shrink-0 hidden xl:flex flex-col" style={{ borderColor: themeColors.border }}>
          <QuantCalculators theme={theme} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 text-xs border-t shrink-0"
        style={{ backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.textSecondary }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColors.accent.buy }} />
            <span>Live Feed</span>
          </div>
          <span className="hidden sm:inline">Latency: 12ms</span>
          <span className="hidden md:inline">| Prime API</span>
        </div>
        <span className="font-medium">Elite AI Trading Platform v2.0</span>
      </div>
    </div>
  );
}
