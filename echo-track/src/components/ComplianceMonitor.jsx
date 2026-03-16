import { useState, useEffect, useCallback } from 'react';

const STATUS_CONFIG = {
  green:  { label: 'Compliant',        bg: 'bg-green-100 dark:bg-green-900/30',  border: 'border-green-400', text: 'text-green-700 dark:text-green-300',  dot: 'bg-green-500',  icon: '✅' },
  yellow: { label: 'Near Threshold',   bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-400', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500', icon: '⚠️' },
  red:    { label: 'Threshold Exceeded', bg: 'bg-red-100 dark:bg-red-900/30',    border: 'border-red-400',   text: 'text-red-700 dark:text-red-300',     dot: 'bg-red-500',    icon: '🚨' },
};

function ProgressBar({ value, limit, status }) {
  const pct = limit > 0 ? Math.min((value / limit) * 100, 100) : 0;
  const barColor = status === 'red' ? 'bg-red-500' : status === 'yellow' ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
      <div className={`${barColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function PeriodCard({ title, data }) {
  if (!data) return null;
  const cfg = STATUS_CONFIG[data.compliance_status] || STATUS_CONFIG.green;
  const pct = data.allowed_limit_kg > 0 ? ((data.measured_co2_kg / data.allowed_limit_kg) * 100).toFixed(1) : 0;

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-700 dark:text-gray-200">{title}</span>
        <span className={`flex items-center gap-1.5 text-sm font-medium ${cfg.text}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Measured</p>
          <p className="font-bold text-gray-800 dark:text-white">{data.measured_co2_kg} kg</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Limit</p>
          <p className="font-bold text-gray-800 dark:text-white">{data.allowed_limit_kg} kg</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Excess</p>
          <p className={`font-bold ${data.excess_emission_kg > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {data.excess_emission_kg > 0 ? `+${data.excess_emission_kg} kg` : '0 kg'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Penalty</p>
          <p className={`font-bold ${data.penalty_amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {data.penalty_amount > 0 ? `₹${data.penalty_amount}` : '₹0'}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-0.5">
          <span>Usage</span><span>{pct}%</span>
        </div>
        <ProgressBar value={data.measured_co2_kg} limit={data.allowed_limit_kg} status={data.compliance_status} />
      </div>
    </div>
  );
}

function AlertBanner({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="space-y-2">
      {alerts.map(alert => (
        <div key={alert.id} className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-xl p-4 flex gap-3">
          <span className="text-xl shrink-0">🚨</span>
          <div className="flex-1 min-w-0">
            <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap font-sans">{alert.message}</pre>
          </div>
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-200 shrink-0 text-lg leading-none"
            aria-label="Dismiss alert"
          >×</button>
        </div>
      ))}
    </div>
  );
}

function ThresholdEditor({ thresholds, onSave, email }) {
  const [form, setForm] = useState({
    daily_limit_kg: thresholds?.daily_limit_kg ?? 50,
    monthly_limit_kg: thresholds?.monthly_limit_kg ?? 1200,
    carbon_tax_rate: thresholds?.carbon_tax_rate ?? 40,
    warning_threshold_percent: thresholds?.warning_threshold_percent ?? 80,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (thresholds) setForm({
      daily_limit_kg: thresholds.daily_limit_kg,
      monthly_limit_kg: thresholds.monthly_limit_kg,
      carbon_tax_rate: thresholds.carbon_tax_rate,
      warning_threshold_percent: thresholds.warning_threshold_percent,
    });
  }, [thresholds]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/compliance/thresholds/?email=${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, unit) => (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <span className="text-xs text-gray-400 whitespace-nowrap">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Configure Thresholds</h4>
      <div className="grid grid-cols-2 gap-3">
        {field('Daily Limit', 'daily_limit_kg', 'kg CO₂')}
        {field('Monthly Limit', 'monthly_limit_kg', 'kg CO₂')}
        {field('Carbon Tax Rate', 'carbon_tax_rate', '₹/kg')}
        {field('Warning at', 'warning_threshold_percent', '%')}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
      >
        {saving ? 'Saving…' : 'Save Thresholds'}
      </button>
    </div>
  );
}

function ViolationHistory({ violations }) {
  if (!violations || violations.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No violations recorded.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <th className="pb-2 pr-3">Date</th>
            <th className="pb-2 pr-3">Period</th>
            <th className="pb-2 pr-3">Measured</th>
            <th className="pb-2 pr-3">Limit</th>
            <th className="pb-2 pr-3">Excess</th>
            <th className="pb-2 pr-3">Penalty</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {violations.map(v => {
            const cfg = STATUS_CONFIG[v.compliance_status] || STATUS_CONFIG.green;
            return (
              <tr key={v.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <td className="py-2 pr-3 text-gray-600 dark:text-gray-300">{v.period_date}</td>
                <td className="py-2 pr-3 capitalize text-gray-600 dark:text-gray-300">{v.period_type}</td>
                <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">{v.measured_co2_kg} kg</td>
                <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">{v.allowed_limit_kg} kg</td>
                <td className="py-2 pr-3 text-red-600 dark:text-red-400">+{v.excess_emission_kg} kg</td>
                <td className="py-2 pr-3 text-red-600 dark:text-red-400">₹{v.penalty_amount}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ComplianceMonitor({ user }) {
  const [status, setStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [violations, setViolations] = useState([]);
  const [thresholds, setThresholds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const email = user?.email;

  const fetchAll = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const [statusRes, alertsRes, violationsRes, thresholdRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/compliance/status/?email=${email}`),
        fetch(`${import.meta.env.VITE_API_URL}/compliance/alerts/?email=${email}&unread=true`),
        fetch(`${import.meta.env.VITE_API_URL}/compliance/violations/?email=${email}`),
        fetch(`${import.meta.env.VITE_API_URL}/compliance/thresholds/?email=${email}`),
      ]);
      if (statusRes.ok) setStatus(await statusRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (violationsRes.ok) setViolations(await violationsRes.json());
      if (thresholdRes.ok) setThresholds(await thresholdRes.json());
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const dismissAlert = async (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    await fetch(`${import.meta.env.VITE_API_URL}/compliance/alerts/?email=${email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert_ids: [alertId], action: 'dismiss', email }),
    });
  };

  const filteredViolations = activeTab === 'all'
    ? violations
    : violations.filter(v => v.period_type === activeTab);

  if (!user) return null;

  const overallCfg = STATUS_CONFIG[status?.overall_status || 'green'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${overallCfg.dot} ${status?.overall_status === 'red' ? 'animate-pulse' : ''}`} />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Compliance Monitor</h3>
          {!loading && status && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${overallCfg.bg} ${overallCfg.text}`}>
              {overallCfg.icon} {overallCfg.label}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowHistory(h => !h); setShowSettings(false); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {showHistory ? 'Hide History' : 'History'}
          </button>
          <button
            onClick={() => { setShowSettings(s => !s); setShowHistory(false); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={fetchAll}
            className="text-xs px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && <AlertBanner alerts={alerts} onDismiss={dismissAlert} />}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Period Cards */}
          {!showSettings && !showHistory && status && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PeriodCard title="Today's Emissions" data={status.daily} />
              <PeriodCard title="This Month's Emissions" data={status.monthly} />
            </div>
          )}

          {/* Threshold summary strip */}
          {!showSettings && !showHistory && thresholds && (
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-xl px-4 py-2.5">
              <span>Daily limit: <strong className="text-gray-700 dark:text-gray-200">{thresholds.daily_limit_kg} kg</strong></span>
              <span>·</span>
              <span>Monthly limit: <strong className="text-gray-700 dark:text-gray-200">{thresholds.monthly_limit_kg} kg</strong></span>
              <span>·</span>
              <span>Tax rate: <strong className="text-gray-700 dark:text-gray-200">₹{thresholds.carbon_tax_rate}/kg</strong></span>
              <span>·</span>
              <span>Warning at: <strong className="text-gray-700 dark:text-gray-200">{thresholds.warning_threshold_percent}%</strong></span>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <ThresholdEditor
              thresholds={thresholds}
              email={email}
              onSave={(updated) => { setThresholds(t => ({ ...t, ...updated })); setShowSettings(false); fetchAll(); }}
            />
          )}

          {/* History Panel */}
          {showHistory && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {['all', 'daily', 'monthly'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${activeTab === tab ? 'bg-teal-500 text-white' : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <ViolationHistory violations={filteredViolations} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
