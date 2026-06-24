import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Home,
  UserCheck,
  MessageCircle,
  CalendarDays,
  TrendingUp,
  Heart,
  Building2,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import {
  fetchAdminBI,
  getRoleCount,
  type AdminBIData,
  type HealthPeriod,
} from "../services/admin-analytics.service";
import { pageShellStyle, pageScrollStyle } from "../../../components/layout/layout-styles";

const COLORS = {
  primary: "#4417E6",
  secondary: "#3B82F6",
  accent: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
  muted: "#94A3B8",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#10B981",
  PAUSED: "#F59E0B",
  RESERVED: "#3B82F6",
  FINALIZED: "#6B7280",
  UNPUBLISHED: "#94A3B8",
  SCHEDULED: "#3B82F6",
  CONFIRMED: "#10B981",
  COMPLETED: "#4417E6",
  CANCELLED: "#EF4444",
  RESCHEDULED: "#F59E0B",
  SALE: "#4417E6",
  RENT: "#3B82F6",
  TEMPORARY: "#F59E0B",
  CLIENT: "#3B82F6",
  OWNER: "#10B981",
  AGENT: "#F59E0B",
  ADMIN: "#4417E6",
};

const PERIOD_LABELS: Record<HealthPeriod, string> = {
  "7d": "7 días",
  "30d": "30 días",
  "90d": "90 días",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function formatPct(value: number | null | undefined, fallback = "—") {
  if (value == null) return fallback;
  return `${value.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;
}

type KpiCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
  sub?: string;
};

function KpiCard({ label, value, icon, accent = COLORS.primary, sub }: KpiCardProps) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
      data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm font-medium text-slate-500 leading-tight">{label}</span>
        <span
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accent}12`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
        {typeof value === "number" ? value.toLocaleString("es-AR") : value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function Section({
  id,
  title,
  icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24" data-testid={`section-${id}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-purple-600">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">{children}</div>;
}

function ChartCard({ title, children, empty }: { title: string; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      {empty ? (
        <p className="text-sm text-slate-400 py-12 text-center" data-testid="empty-state">
          Sin datos en el período
        </p>
      ) : (
        children
      )}
    </div>
  );
}

function PeriodSelector({
  period,
  onChange,
}: {
  period: HealthPeriod;
  onChange: (p: HealthPeriod) => void;
}) {
  const options: HealthPeriod[] = ["7d", "30d", "90d"];
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg" data-testid="period-selector">
      {options.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            period === p
              ? "bg-white text-purple-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<HealthPeriod>("30d");
  const [data, setData] = useState<AdminBIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: HealthPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminBI(p);
      setData(result);
    } catch {
      setError("No se pudieron cargar las métricas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  if (loading && !data) {
    return (
      <div
        style={pageShellStyle}
        className="flex items-center justify-center bg-slate-50"
        data-testid="dashboard-loading"
      >
        <div className="animate-pulse text-slate-400 text-sm">Cargando dashboard...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-3"
        data-testid="dashboard-error"
      >
        <p className="text-sm text-red-500">{error}</p>
        <button
          type="button"
          onClick={() => load(period)}
          className="text-sm text-purple-600 font-medium hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const roleChartData = data.users.byRole.map((r) => ({
    ...r,
    fill: STATUS_COLORS[r.role] || COLORS.muted,
  }));

  return (
    <div style={pageShellStyle} className="bg-slate-50" data-testid="admin-dashboard">
      <header className="shrink-0 sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Business Intelligence</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Período: {PERIOD_LABELS[period]} · Actualizado {new Date().toLocaleString("es-AR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PeriodSelector period={period} onChange={setPeriod} />
            {loading && (
              <span className="text-xs text-slate-400 animate-pulse" data-testid="dashboard-refreshing">
                Actualizando…
              </span>
            )}
          </div>
        </div>
      </header>

      <div style={pageScrollStyle}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-10 pb-12">
        {/* 1. Executive Summary */}
        <Section id="executive" title="Resumen ejecutivo" icon={<BarChart3 size={16} />}>
          <StatGrid>
            <KpiCard label="Usuarios totales" value={data.executive.total_users} icon={<Users size={18} />} />
            <KpiCard
              label="Nuevos registros"
              value={data.executive.new_registrations}
              icon={<UserCheck size={18} />}
              accent={COLORS.success}
              sub={PERIOD_LABELS[period]}
            />
            <KpiCard label="Propiedades" value={data.executive.total_properties} icon={<Home size={18} />} accent={COLORS.secondary} />
            <KpiCard label="Activas" value={data.executive.active_properties} icon={<Building2 size={18} />} accent={COLORS.success} />
            <KpiCard label="Conversaciones" value={data.executive.total_conversations} icon={<MessageCircle size={18} />} />
            <KpiCard label="Visitas" value={data.executive.total_visits} icon={<CalendarDays size={18} />} accent={COLORS.accent} />
          </StatGrid>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Registros por día" empty={data.registrations.length === 0}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.registrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                  <Tooltip labelFormatter={formatDate} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke={COLORS.primary} fill={`${COLORS.primary}20`} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm opacity-50">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Engagement (PostHog)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <KpiCard label="DAU" value="—" icon={<TrendingUp size={16} />} accent={COLORS.muted} />
                <KpiCard label="WAU" value="—" icon={<TrendingUp size={16} />} accent={COLORS.muted} />
                <KpiCard label="MAU" value="—" icon={<TrendingUp size={16} />} accent={COLORS.muted} />
              </div>
            </div>
          </div>
        </Section>

        {/* 2. Marketplace Health */}
        <Section id="marketplace" title="Salud del marketplace" icon={<Activity size={16} />}>
          <StatGrid>
            <KpiCard label="Propietarios activos" value={data.marketplaceHealth.active_owners} icon={<Users size={18} />} accent={COLORS.success} />
            <KpiCard label="Agentes activos" value={data.marketplaceHealth.active_agents} icon={<UserCheck size={18} />} accent={COLORS.accent} />
            <KpiCard label="Propiedades activas" value={data.marketplaceHealth.active_properties} icon={<Home size={18} />} accent={COLORS.secondary} />
            <KpiCard label="Conversaciones activas" value={data.marketplaceHealth.active_conversations} icon={<MessageCircle size={18} />} />
            <KpiCard label="Visitas completadas" value={data.marketplaceHealth.completed_visits} icon={<CalendarDays size={18} />} accent={COLORS.primary} />
            <KpiCard label="Nuevos registros" value={data.marketplaceHealth.new_registrations} icon={<TrendingUp size={18} />} accent={COLORS.success} />
          </StatGrid>
        </Section>

        {/* 3. Users */}
        <Section id="users" title="Usuarios" icon={<Users size={16} />}>
          <StatGrid>
            <KpiCard label="Clientes" value={getRoleCount(data.users.byRole, "CLIENT")} icon={<Users size={18} />} accent={STATUS_COLORS.CLIENT} />
            <KpiCard label="Propietarios" value={getRoleCount(data.users.byRole, "OWNER")} icon={<Users size={18} />} accent={STATUS_COLORS.OWNER} />
            <KpiCard label="Agentes" value={getRoleCount(data.users.byRole, "AGENT")} icon={<UserCheck size={18} />} accent={STATUS_COLORS.AGENT} />
            <KpiCard label="Admins" value={getRoleCount(data.users.byRole, "ADMIN")} icon={<UserCheck size={18} />} accent={STATUS_COLORS.ADMIN} />
          </StatGrid>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Usuarios por rol" empty={roleChartData.length === 0}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={roleChartData} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={70} label={({ role, count }) => `${role}: ${count}`}>
                    {roleChartData.map((entry) => (
                      <Cell key={entry.role} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Propietarios</h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-slate-400">Total</dt><dd className="font-semibold text-slate-900">{data.owners.total_owners}</dd></div>
                  <div><dt className="text-slate-400">Con publicadas</dt><dd className="font-semibold text-slate-900">{data.owners.with_published}</dd></div>
                  <div><dt className="text-slate-400">Sin publicadas</dt><dd className="font-semibold text-slate-900">{data.owners.without_published}</dd></div>
                  <div><dt className="text-slate-400">Con agente asignado</dt><dd className="font-semibold text-slate-900">{data.owners.with_assigned_agents}</dd></div>
                  <div><dt className="text-slate-400">Autogestionados</dt><dd className="font-semibold text-slate-900">{data.owners.self_managed}</dd></div>
                  <div><dt className="text-slate-400">Prom. propiedades</dt><dd className="font-semibold text-slate-900">{data.owners.avg_properties_per_owner}</dd></div>
                </dl>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Agentes</h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-slate-400">Total</dt><dd className="font-semibold text-slate-900">{data.agents.total_agents}</dd></div>
                  <div><dt className="text-slate-400">Con asignaciones</dt><dd className="font-semibold text-slate-900">{data.agents.with_assignments}</dd></div>
                  <div><dt className="text-slate-400">Sin asignaciones</dt><dd className="font-semibold text-slate-900">{data.agents.without_assignments}</dd></div>
                  <div><dt className="text-slate-400">Con publicaciones activas</dt><dd className="font-semibold text-slate-900">{data.agents.with_active_publications}</dd></div>
                  <div><dt className="text-slate-400">Sin publicaciones activas</dt><dd className="font-semibold text-slate-900">{data.agents.without_active_publications}</dd></div>
                  <div><dt className="text-slate-400">Activos ({PERIOD_LABELS[period]})</dt><dd className="font-semibold text-purple-700">{data.agents.activeInPeriod}</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </Section>

        {/* 4. Properties */}
        <Section id="properties" title="Propiedades" icon={<Home size={16} />}>
          <StatGrid>
            <KpiCard label="Publicadas" value={data.properties.publication.published} icon={<Home size={18} />} accent={COLORS.success} />
            <KpiCard label="Sin publicar" value={data.properties.publication.unpublished} icon={<Home size={18} />} accent={COLORS.muted} />
            <KpiCard
              label="Tasa de publicación"
              value={formatPct(data.properties.publication.publication_rate)}
              icon={<TrendingUp size={18} />}
              accent={COLORS.primary}
            />
          </StatGrid>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Por estado" empty={data.properties.statusBreakdown.length === 0}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.properties.statusBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#64748B" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.properties.statusBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || COLORS.muted} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Por tipo de operación" empty={data.properties.operationBreakdown.length === 0}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.properties.operationBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="operation_type" tick={{ fontSize: 11, fill: "#64748B" }} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {data.properties.operationBreakdown.map((entry) => (
                      <Cell key={entry.operation_type} fill={STATUS_COLORS[entry.operation_type] || COLORS.muted} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </Section>

        {/* 5. Conversations */}
        <Section id="conversations" title="Conversaciones" icon={<MessageCircle size={16} />}>
          <StatGrid>
            <KpiCard label="Total" value={data.conversations.total} icon={<MessageCircle size={18} />} />
            <KpiCard label="Cliente" value={data.conversations.client_conversations} icon={<MessageCircle size={18} />} accent={COLORS.secondary} />
            <KpiCard label="Internas" value={data.conversations.internal_conversations} icon={<MessageCircle size={18} />} accent={COLORS.accent} />
            <KpiCard label="Con mensajes" value={data.conversations.with_messages} icon={<MessageCircle size={18} />} accent={COLORS.success} />
            <KpiCard label="Sin mensajes" value={data.conversations.without_messages} icon={<MessageCircle size={18} />} accent={COLORS.muted} />
            <KpiCard label="Sin responder" value={data.conversations.unanswered} icon={<MessageCircle size={18} />} accent={COLORS.danger} sub="1 mensaje exacto" />
            <KpiCard label="Prom. mensajes" value={data.conversations.avg_messages_per_conversation} icon={<BarChart3 size={18} />} />
            <KpiCard label="Activas (30d)" value={data.conversations.active_30d} icon={<Activity size={18} />} accent={COLORS.primary} />
          </StatGrid>
        </Section>

        {/* 6. Visits */}
        <Section id="visits" title="Visitas" icon={<CalendarDays size={16} />}>
          <StatGrid>
            <KpiCard label="Programadas" value={data.visits.scheduled} icon={<CalendarDays size={18} />} accent={STATUS_COLORS.SCHEDULED} />
            <KpiCard label="Confirmadas" value={data.visits.confirmed} icon={<CalendarDays size={18} />} accent={STATUS_COLORS.CONFIRMED} />
            <KpiCard label="Completadas" value={data.visits.completed} icon={<CalendarDays size={18} />} accent={STATUS_COLORS.COMPLETED} />
            <KpiCard label="Canceladas" value={data.visits.cancelled} icon={<CalendarDays size={18} />} accent={STATUS_COLORS.CANCELLED} />
            <KpiCard label="Reprogramadas" value={data.visits.rescheduled} icon={<CalendarDays size={18} />} accent={STATUS_COLORS.RESCHEDULED} />
            <KpiCard
              label="Tasa de completitud"
              value={formatPct(data.visits.completion_rate)}
              icon={<TrendingUp size={18} />}
              accent={COLORS.primary}
              sub="Completadas / Confirmadas"
            />
          </StatGrid>

          <div className="mt-4">
            <ChartCard title="Distribución por estado" empty={data.visits.scheduled + data.visits.confirmed + data.visits.completed + data.visits.cancelled + data.visits.rescheduled === 0}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { status: "SCHEDULED", count: data.visits.scheduled },
                    { status: "CONFIRMED", count: data.visits.confirmed },
                    { status: "COMPLETED", count: data.visits.completed },
                    { status: "CANCELLED", count: data.visits.cancelled },
                    { status: "RESCHEDULED", count: data.visits.rescheduled },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#64748B" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "RESCHEDULED"].map((s) => (
                      <Cell key={s} fill={STATUS_COLORS[s]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </Section>

        {/* 7. Favorites */}
        <Section id="favorites" title="Favoritos" icon={<Heart size={16} />}>
          <StatGrid>
            <KpiCard label="Total favoritos" value={data.favorites.total_favorites} icon={<Heart size={18} />} accent={COLORS.danger} />
            <KpiCard label="Usuarios únicos" value={data.favorites.unique_users} icon={<Users size={18} />} accent={COLORS.secondary} />
          </StatGrid>

          <div className="mt-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Top propiedades favoritas</h3>
              {data.favorites.top_properties.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center" data-testid="empty-state">
                  Sin favoritos registrados
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.favorites.top_properties.map((p, i) => (
                    <li key={p.property_id} className="flex items-center justify-between py-3 text-sm">
                      <span className="flex items-center gap-2 text-slate-700 min-w-0">
                        <span className="text-slate-400 font-mono text-xs w-5">{i + 1}.</span>
                        <span className="truncate">{p.title || p.property_id.slice(0, 8)}</span>
                      </span>
                      <span className="font-semibold text-purple-700 shrink-0 ml-2">
                        {p.favorite_count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Section>
      </main>
      </div>
    </div>
  );
}
