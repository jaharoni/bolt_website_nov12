import React, { useState, useEffect } from 'react';
import { Brain, AlertCircle, DollarSign, Clock, TrendingUp, Shield, Ban, CheckCircle } from 'lucide-react';

interface AdminStats {
  today: {
    date: string;
    requests: number;
    tokens: number;
    cost: number;
    budgetLimit: number;
    isShutdown: boolean;
    alertSent: boolean;
    remainingBudget: number;
    percentUsed: string;
  };
  lastHour: {
    requests: number;
    tokens: number;
    cost: number;
  };
  weekHistory: Array<{
    date: string;
    cost: number;
    requests: number;
    tokens: number;
  }>;
  topConsumers: Array<{
    ip: string;
    requests: number;
    tokens: number;
    lastSeen: string;
  }>;
  recentModerations: Array<{
    id: string;
    ip: string;
    categories: string[];
    maxScore: number;
    timestamp: string;
    preview: string;
  }>;
  blockedIps: Array<{
    ip: string;
    reason: string;
    blockedBy: string;
    blockedUntil: string | null;
    violations: number;
    timestamp: string;
  }>;
}

const AIUsageMonitor: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockingIp, setBlockingIp] = useState<string | null>(null);

  const apiUrl = import.meta.env.DEV
    ? 'http://localhost:8888//api'
    : '//api';

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin-stats`);
      if (!response.ok) throw new Error('Failed to load stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIp = async (ip: string, duration: number = 0, reason: string = 'Manual block by admin') => {
    if (!confirm(`Block IP ${ip}?`)) return;

    setBlockingIp(ip);
    try {
      const response = await fetch(`${apiUrl}/admin-block-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, duration, reason }),
      });

      if (!response.ok) throw new Error('Failed to block IP');

      alert(`IP ${ip} has been blocked`);
      loadStats();
    } catch (err: any) {
      alert(`Failed to block IP: ${err.message}`);
    } finally {
      setBlockingIp(null);
    }
  };

  const handleUnblockIp = async (ip: string) => {
    if (!confirm(`Unblock IP ${ip}?`)) return;

    setBlockingIp(ip);
    try {
      const response = await fetch(`${apiUrl}/admin-block-ip`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });

      if (!response.ok) throw new Error('Failed to unblock IP');

      alert(`IP ${ip} has been unblocked`);
      loadStats();
    } catch (err: any) {
      alert(`Failed to unblock IP: ${err.message}`);
    } finally {
      setBlockingIp(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="glass-card p-6 border-red-500/50">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>Error loading AI usage stats: {error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const budgetPercentage = (stats.today.cost / stats.today.budgetLimit) * 100;
  const isWarning = budgetPercentage >= 66;
  const isDanger = budgetPercentage >= 90 || stats.today.isShutdown;

  return (
    <div className="space-y-6">
      {stats.today.isShutdown && (
        <div className="glass-card p-6 border-red-500/50 bg-red-500/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-400">AI Chat Shutdown</h3>
              <p className="text-white/70 text-sm">
                Daily budget limit reached. Service will automatically resume at midnight UTC.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className={`text-xs font-semibold ${
              isDanger ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {stats.today.percentUsed}%
            </span>
          </div>
          <p className="text-2xl font-bold text-white">${stats.today.cost.toFixed(4)}</p>
          <p className="text-sm text-white/60">Today's Cost</p>
          <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isDanger ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2">
            ${stats.today.remainingBudget.toFixed(4)} remaining of ${stats.today.budgetLimit}
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.lastHour.requests}</p>
          <p className="text-sm text-white/60">Requests (Last Hour)</p>
          <p className="text-xs text-white/40 mt-2">
            {stats.lastHour.tokens.toLocaleString()} tokens
          </p>
          <p className="text-xs text-white/40">
            ${stats.lastHour.cost.toFixed(4)} cost
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.today.requests}</p>
          <p className="text-sm text-white/60">Total Requests Today</p>
          <p className="text-xs text-white/40 mt-2">
            {stats.today.tokens.toLocaleString()} tokens used
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.recentModerations.length}</p>
          <p className="text-sm text-white/60">Moderation Blocks</p>
          <p className="text-xs text-white/40 mt-2">
            {stats.blockedIps.length} IPs blocked
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            7-Day Cost Trend
          </h3>
          <div className="space-y-2">
            {stats.weekHistory.map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm text-white/60">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${(day.cost / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-white w-16 text-right">
                    ${day.cost.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Consumers</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stats.topConsumers.map((consumer, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-mono text-white">{consumer.ip}</p>
                  <p className="text-xs text-white/40">
                    {consumer.requests} requests · {consumer.tokens.toLocaleString()} tokens
                  </p>
                </div>
                <button
                  onClick={() => handleBlockIp(consumer.ip)}
                  disabled={blockingIp === consumer.ip}
                  className="btn-secondary text-xs py-1 px-3"
                >
                  {blockingIp === consumer.ip ? 'Blocking...' : 'Block'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Recent Moderations
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.recentModerations.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-400/30 mx-auto mb-2" />
                <p className="text-white/40 text-sm">No moderation flags recently</p>
              </div>
            ) : (
              stats.recentModerations.map((mod) => (
                <div key={mod.id} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-mono text-white/60">{mod.ip}</span>
                    <span className="text-xs text-white/40">
                      {new Date(mod.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {mod.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-white/60 line-clamp-2">{mod.preview}...</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-400" />
            Blocked IPs
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.blockedIps.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-400/30 mx-auto mb-2" />
                <p className="text-white/40 text-sm">No IPs currently blocked</p>
              </div>
            ) : (
              stats.blockedIps.map((block, idx) => (
                <div key={idx} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-mono text-white">{block.ip}</span>
                    <button
                      onClick={() => handleUnblockIp(block.ip)}
                      disabled={blockingIp === block.ip}
                      className="text-xs text-green-400 hover:text-green-300"
                    >
                      {blockingIp === block.ip ? 'Unblocking...' : 'Unblock'}
                    </button>
                  </div>
                  <p className="text-xs text-white/60 mb-1">{block.reason}</p>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span>{block.violations} violations</span>
                    <span>·</span>
                    <span>by {block.blockedBy}</span>
                    {block.blockedUntil && (
                      <>
                        <span>·</span>
                        <span>until {new Date(block.blockedUntil).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIUsageMonitor;
