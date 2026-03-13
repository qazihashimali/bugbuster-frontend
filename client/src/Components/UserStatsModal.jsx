import React, { useState, useEffect, useCallback } from "react";
import {
  FaTimes,
  FaChartPie,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaListAlt,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// ── Palette ───────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  pending: "#f59e0b",
  "in-progress": "#6366f1",
  resolved: "#10b981",
};
const PRIORITY_COLORS = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };

// ── Stat Card ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm border border-gray-100">
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
    >
      <Icon size={18} className={iconColor} />
    </div>
    <div>
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest m-0">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 leading-tight m-0">
        {value ?? "—"}
      </p>
    </div>
  </div>
);

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg">
      <strong>{name}</strong>: {value}
    </div>
  );
};

// ── Donut Label ───────────────────────────────────────────────────────────────
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Chart Card wrapper ────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, legend }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <p className="text-sm font-semibold text-gray-700 mb-0.5">{title}</p>
    <p className="text-[11px] text-gray-400 mb-3">{subtitle}</p>
    {children}
    {legend && (
      <div className="flex flex-wrap justify-center gap-4 mt-3">{legend}</div>
    )}
  </div>
);

// ── Main Modal ────────────────────────────────────────────────────────────────
const UserStatsModal = ({ userId, userName, onClose }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/team/stats/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statusChartData = (data?.statusStats || []).map((s) => ({
    name: s.status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: s.count,
    color: STATUS_COLORS[s.status] || "#9ca3af",
  }));

  const priorityChartData = (data?.priorityStats || []).map((p) => ({
    name: p.priority,
    value: p.count,
    color: PRIORITY_COLORS[p.priority] || "#9ca3af",
  }));

  const {
    pending = 0,
    inProgress = 0,
    resolved = 0,
    total = 0,
  } = data?.summary || {};
  const resolutionPct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-primary flex items-center justify-between px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <FaChartPie size={16} className="text-white" />
            <div>
              <h2 className="text-white font-bold text-base m-0 leading-tight">
                User Statistics
              </h2>
              <p className="text-white/60 text-[11px] m-0">{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-white transition-colors"
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-72 gap-3 text-gray-400">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-primary rounded-full animate-spin" />
              <p className="text-sm">Loading stats…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center justify-center h-72 gap-2">
              <p className="text-red-500 font-semibold">Failed to load stats</p>
              <p className="text-sm text-gray-400">{error}</p>
              <button
                onClick={fetchStats}
                className="text-sm text-indigo-600 underline cursor-pointer bg-transparent border-none mt-2"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !error && data && (
            <>
              {/* ── Summary Cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={FaListAlt}
                  label="Total"
                  value={total}
                  iconBg="bg-indigo-50"
                  iconColor="text-indigo-500"
                />
                <StatCard
                  icon={FaClock}
                  label="Pending"
                  value={pending}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-500"
                />
                <StatCard
                  icon={FaSpinner}
                  label="In Progress"
                  value={inProgress}
                  iconBg="bg-indigo-50"
                  iconColor="text-indigo-500"
                />
                <StatCard
                  icon={FaCheckCircle}
                  label="Resolved"
                  value={resolved}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-500"
                />
              </div>

              {/* ── Charts Row ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Donut — Status */}
                <ChartCard
                  title="Ticket Status"
                  subtitle="Distribution by current status"
                  legend={statusChartData.map((s) => (
                    <span
                      key={s.name}
                      className="flex items-center gap-1.5 text-[11px] text-gray-500"
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                        style={{ background: s.color }}
                      />
                      {s.name} ({s.value})
                    </span>
                  ))}
                >
                  {statusChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          labelLine={false}
                          label={renderCustomLabel}
                        >
                          {statusChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-300 text-sm">
                      No data
                    </div>
                  )}
                </ChartCard>

                {/* Bar — Priority */}
                <ChartCard
                  title="Ticket Priority"
                  subtitle="Breakdown by priority level"
                  legend={priorityChartData.map((p) => (
                    <span
                      key={p.name}
                      className="flex items-center gap-1.5 text-[11px] text-gray-500"
                    >
                      <span
                        className="w-2 h-2 rounded-sm inline-block flex-shrink-0"
                        style={{ background: p.color }}
                      />
                      {p.name} ({p.value})
                    </span>
                  ))}
                >
                  {priorityChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={priorityChartData} barSize={34}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f3f4f6"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#9ca3af" }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: "#f9fafb" }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {priorityChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-300 text-sm">
                      No data
                    </div>
                  )}
                </ChartCard>
              </div>

              {/* ── Resolution Rate Bar ── */}
              <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2.5">
                  <p className="text-sm font-semibold text-gray-700 m-0">
                    Resolution Rate
                  </p>
                  <span className="text-sm font-bold text-emerald-500">
                    {resolutionPct}%
                  </span>
                </div>
                <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-700"
                    style={{ width: `${resolutionPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[11px] text-gray-400">
                  <span>
                    {resolved} resolved of {total} total tickets
                  </span>
                  <span>{total - resolved} remaining</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="bg-black text-white border-none rounded-lg px-5 py-2 text-sm cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserStatsModal;
