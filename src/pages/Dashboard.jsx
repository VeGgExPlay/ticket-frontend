import { useState, useEffect, useMemo } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { fetchMetrics } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  STATUS_MAP,
  CATEGORY_MAP,
  PRIORITY_MAP,
  SLA_TARGETS_HOURS,
} from "../constants/ticket.js";
import {
  formatDuration,
  formatPercent,
  formatDayLabel,
} from "../utils/format.js";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
);

const STATUS_CHART_COLORS = {
  abierto: "#fde047",
  en_progreso: "#93c5fd",
  resuelto: "#86efac",
  cerrado: "#fca5a5",
};

const BAR_COLORS = [
  "#fde047",
  "#93c5fd",
  "#86efac",
  "#fca5a5",
  "#c4b5fd",
  "#fdba74",
  "#67e8f9",
  "#f9a8d4",
  "#a3e635",
  "#facc15",
];

function StatusPieChart({ byStatus }) {
  const data = useMemo(
    () => ({
      labels: (byStatus || []).map(
        (item) => STATUS_MAP[item.status]?.label || item.status,
      ),
      datasets: [
        {
          data: (byStatus || []).map((item) => item.count),
          backgroundColor: (byStatus || []).map(
            (item) => STATUS_CHART_COLORS[item.status] || "#e2e8f0",
          ),
          borderWidth: 1,
        },
      ],
    }),
    [byStatus],
  );

  return (
    <div className="max-w-xs mx-auto">
      <Pie
        data={data}
        options={{
          responsive: true,
          plugins: { legend: { position: "bottom" } },
        }}
      />
    </div>
  );
}

function AgentBarChart({ byAgent }) {
  const agentData = useMemo(() => {
    const list = (byAgent || [])
      .slice()
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    return list;
  }, [byAgent]);

  const data = useMemo(
    () => ({
      labels: agentData.map((item) => item.name || `Agente #${item.agent_id}`),
      datasets: [
        {
          data: agentData.map((item) => item.count),
          backgroundColor: agentData.map(
            (_, idx) => BAR_COLORS[idx % BAR_COLORS.length],
          ),
          borderRadius: 6,
          maxBarThickness: 48,
        },
      ],
    }),
    [agentData],
  );

  const chartKey = useMemo(
    () => agentData.map((item) => `${item.agent_id}-${item.count}`).join("|"),
    [agentData],
  );

  if (agentData.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500">
        No hay datos de agentes.
      </p>
    );
  }

  return (
    <div className="h-72">
      <Bar
        key={chartKey}
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              ticks: {
                color: "#64748b",
                maxRotation: 45,
                minRotation: 0,
              },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: "#64748b",
                stepSize: 1,
              },
              grid: {
                color: "#e2e8f0",
              },
            },
          },
        }}
      />
    </div>
  );
}

function ResolutionLineChart({ daily }) {
  const data = useMemo(
    () => ({
      labels: (daily || []).map((d) => formatDayLabel(d.date)),
      datasets: [
        {
          label: "Tickets resueltos",
          data: (daily || []).map((d) => d.count),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: "#3b82f6",
        },
      ],
    }),
    [daily],
  );

  return (
    <div className="h-64">
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              ticks: {
                color: "#64748b",
              },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: "#64748b",
                stepSize: 1,
              },
              grid: {
                color: "#e2e8f0",
              },
            },
          },
        }}
      />
    </div>
  );
}

function ResolutionByPriorityBar({ perPriority }) {
  const labels = (perPriority || []).map(
    (p) => PRIORITY_MAP[p.priority]?.label || p.priority,
  );
  const values = (perPriority || []).map((p) => Math.round(p.avg_seconds));
  const colors = ["#f97316", "#a855f7", "#0ea5e9"];

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Promedio (s)",
          data: values,
          backgroundColor: labels.map((_, idx) => colors[idx % colors.length]),
          borderRadius: 6,
          maxBarThickness: 64,
        },
      ],
    }),
    [labels, values],
  );

  if (perPriority.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500">
        No hay datos por prioridad.
      </p>
    );
  }

  return (
    <div className="h-64">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Promedio: ${formatDuration(ctx.raw)}`,
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: "#64748b",
                callback: (val) => formatDuration(val),
              },
              grid: {
                color: "#e2e8f0",
              },
            },
            y: {
              ticks: {
                color: "#64748b",
              },
              grid: { display: false },
            },
          },
        }}
      />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err.message || "Error al cargar métricas");
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return <p className="text-slate-400 text-sm">Cargando métricas...</p>;
  if (error)
    return (
      <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
    );
  if (!metrics) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total tickets
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
            {metrics.total_tickets}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Archivados
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
            {metrics.archived_tickets}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tiempo promedio de resolución
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
            {metrics.resolved_count > 0
              ? formatDuration(metrics.avg_resolution_seconds)
              : "—"}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mediana de resolución
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
            {metrics.resolved_count > 0
              ? formatDuration(metrics.median_resolution_seconds)
              : "—"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tickets resueltos
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
            {metrics.resolved_count}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cumplimiento SLA
          </p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
            {metrics.resolved_count > 0
              ? formatPercent(metrics.overall_compliance_rate)
              : "—"}
          </p>
        </div>
      </div>
      <div className="space-y-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full row-start-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 mx-auto lg:mx-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Por estado
          </h2>
          <StatusPieChart byStatus={metrics.by_status} />
          <div className="mt-4 space-y-2">
            {(metrics.by_status || []).map((item) => {
              const info = STATUS_MAP[item.status] || {
                label: item.status,
                color: "bg-slate-100 text-slate-800",
              };
              return (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}
                  >
                    {info.label}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-span-full row-start-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Tickets por agente
          </h2>
          <AgentBarChart byAgent={metrics.by_agent} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Por categoría
          </h2>
          <div className="space-y-2">
            {(metrics.by_category || []).map((item) => {
              const info = CATEGORY_MAP[item.category] || {
                label: item.category,
                color: "bg-slate-100 text-slate-800",
              };
              return (
                <div
                  key={item.category}
                  className="flex items-center justify-between"
                >
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}
                  >
                    {info.label}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Por prioridad
          </h2>
          <div className="space-y-2">
            {(metrics.by_priority || []).map((item) => {
              const info = PRIORITY_MAP[item.priority] || {
                label: item.priority,
                color: "bg-slate-100 text-slate-800",
              };
              return (
                <div
                  key={item.priority}
                  className="flex items-center justify-between"
                >
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}
                  >
                    {info.label}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {user?.role === "agente" && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Por agente
            </h2>
            <div className="space-y-2">
              {(metrics.by_agent || []).map((item) => (
                <div
                  key={item.agent_id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {item.name || `Agente #${item.agent_id}`}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item.count}
                  </span>
                </div>
              ))}
              {(!metrics.by_agent || metrics.by_agent.length === 0) && (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  No hay datos de agentes.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {metrics.resolved_count > 0 ? (
        <div className="space-y-6 mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="col-span-full lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Tiempo de resolución / SLA
            </h2>
            <ResolutionLineChart daily={metrics.daily} />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Resueltos por prioridad
            </h2>
            <ResolutionByPriorityBar perPriority={metrics.per_priority} />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Cumplimiento por prioridad
            </h2>
            <div className="grid grid-cols-1 grid-rows-[auto_auto] gap-y-3">
              {(metrics.per_priority || []).map((p) => {
                const info = PRIORITY_MAP[p.priority] || {
                  label: p.priority,
                  color: "bg-slate-100 text-slate-800",
                };
                const target = SLA_TARGETS_HOURS[p.priority] ?? "—";
                return (
                  <div
                    key={p.priority}
                    className="grid grid-cols-6 gap-2 items-center"
                  >
                    <span
                      className={`col-start-1 col-end-2 inline-flex items-center justify-center py-0.5 rounded-full text-xs font-medium ${info.color}`}
                    >
                      {info.label}
                    </span>
                    <div className="flex col-start-2 col-end-3 flex-col">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Objetivo:
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        {target}h
                      </span>
                    </div>
                    <div className="flex flex-col col-start-3 col-end-4">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Resueltos:
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        {p.resolved_count}
                      </span>
                    </div>
                    <div className="flex flex-col col-start-4 col-end-5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Prom:
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        {formatDuration(p.avg_seconds)}
                      </span>
                    </div>
                    <div className="flex flex-col col-start-5 col-end-6">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Brechas:
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        {p.breached_count}
                      </span>
                    </div>
                    <span className="col-start-6 col-end-7 font-medium text-slate-900 dark:text-slate-100">
                      {formatPercent(p.compliance_rate)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 mb-6">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Aún no hay tickets resueltos para calcular tiempos.
          </p>
        </div>
      )}
    </div>
  );
}
