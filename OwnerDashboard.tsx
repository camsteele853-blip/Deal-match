import { useAppStore, type OwnerAlert } from "@/store/appStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  Activity,
  BarChart3,
  Droplets,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserX,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OwnerDashboardProps {
  onLogout: () => void;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  highlight?: "green" | "yellow" | "red" | "blue";
}) {
  const highlightClasses: Record<string, string> = {
    green: "border-emerald-500/40 bg-emerald-950/30",
    yellow: "border-amber-500/40 bg-amber-950/30",
    red: "border-red-500/40 bg-red-950/30",
    blue: "border-blue-500/40 bg-blue-950/30",
  };

  const iconClasses: Record<string, string> = {
    green: "text-emerald-400",
    yellow: "text-amber-400",
    red: "text-red-400",
    blue: "text-blue-400",
  };

  return (
    <Card
      className={cn(
        "border bg-zinc-900 transition-colors",
        highlight ? highlightClasses[highlight] : "border-zinc-800"
      )}
    >
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              {title}
            </p>
            <p
              className={cn(
                "text-3xl font-bold tabular-nums",
                highlight ? iconClasses[highlight] : "text-zinc-100"
              )}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-zinc-500 mt-1 truncate">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "p-2 rounded-lg ml-3 shrink-0",
              highlight ? `bg-${highlight === "green" ? "emerald" : highlight === "yellow" ? "amber" : highlight === "red" ? "red" : "blue"}-500/10` : "bg-zinc-800"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                highlight ? iconClasses[highlight] : "text-zinc-400"
              )}
            />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : trend === "down" ? (
              <TrendingDown className="w-3 h-3 text-red-400" />
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RateGauge({
  label,
  value,
  healthyMin,
  healthyMax,
  description,
}: {
  label: string;
  value: number;
  healthyMin: number;
  healthyMax: number;
  description: string;
}) {
  const isHealthy = value >= healthyMin;
  const isExcellent = value >= healthyMax;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-300">{label}</span>
        <span
          className={cn(
            "text-lg font-bold tabular-nums",
            isExcellent
              ? "text-emerald-400"
              : isHealthy
              ? "text-amber-400"
              : "text-red-400"
          )}
        >
          {value}%
        </span>
      </div>
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        {/* healthy zone indicator */}
        <div
          className="absolute top-0 h-full bg-emerald-500/20"
          style={{
            left: `${healthyMin}%`,
            width: `${Math.min(100 - healthyMin, healthyMax - healthyMin + 20)}%`,
          }}
        />
        {/* actual value bar */}
        <div
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
            isExcellent
              ? "bg-emerald-500"
              : isHealthy
              ? "bg-amber-500"
              : "bg-red-500"
          )}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <p className="text-xs text-zinc-600">
        {description} — healthy: {healthyMin}%–{healthyMax}%+
      </p>
    </div>
  );
}

function AlertBanner({ alert }: { alert: OwnerAlert }) {
  const isCritical = alert.severity === "critical";
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-lg border text-sm",
        isCritical
          ? "bg-red-950/40 border-red-500/40 text-red-200"
          : "bg-amber-950/40 border-amber-500/40 text-amber-200"
      )}
    >
      {isCritical ? (
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
      ) : (
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
      )}
      <span>{alert.message}</span>
    </div>
  );
}

function LiquidityMeter({
  score,
  threshold,
  avgOffersPerPro,
  activePros,
  activeSellers,
}: {
  score: number;
  threshold: number;
  avgOffersPerPro: number;
  activePros: number;
  activeSellers: number;
}) {
  const isAbove = score >= threshold;
  const pct = Math.min((score / (threshold * 2)) * 100, 100);

  return (
    <Card className="border border-zinc-800 bg-zinc-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          Liquidity Score
          <Badge
            variant="outline"
            className="text-xs ml-auto border-zinc-700 text-zinc-500"
          >
            Internal Only
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <span
            className={cn(
              "text-5xl font-black tabular-nums",
              isAbove ? "text-emerald-400" : "text-red-400"
            )}
          >
            {score.toFixed(2)}
          </span>
          <div className="mb-1">
            <p className="text-xs text-zinc-500">threshold</p>
            <p className="text-lg font-bold text-zinc-400">{threshold}</p>
          </div>
        </div>

        <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
          {/* threshold marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-zinc-500 z-10"
            style={{ left: `${(threshold / (threshold * 2)) * 100}%` }}
          />
          <div
            className={cn(
              "absolute top-0 left-0 h-full rounded-full transition-all duration-700",
              isAbove ? "bg-emerald-500" : "bg-red-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="text-center">
            <p className="text-xs text-zinc-600">Active Pros</p>
            <p className="text-base font-bold text-zinc-300">{activePros}</p>
          </div>
          <div className="text-center border-x border-zinc-800">
            <p className="text-xs text-zinc-600">Avg Offers/Pro</p>
            <p className="text-base font-bold text-zinc-300">
              {avgOffersPerPro.toFixed(1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-600">Active Sellers</p>
            <p className="text-base font-bold text-zinc-300">{activeSellers}</p>
          </div>
        </div>

        <div
          className={cn(
            "rounded-lg px-3 py-2 text-xs font-medium",
            isAbove
              ? "bg-emerald-950/50 text-emerald-300"
              : "bg-red-950/50 text-red-300"
          )}
        >
          {isAbove ? (
            <>
              <span className="font-bold">Scale seller acquisition.</span>{" "}
              Enough buyers to absorb more inventory.
            </>
          ) : (
            <>
              <span className="font-bold">Pause seller marketing.</span>{" "}
              Not enough professional buyers to match existing listings.
            </>
          )}
        </div>

        <p className="text-xs text-zinc-700">
          Formula: (Active Pros × Avg Offers/Pro) ÷ Active Sellers
        </p>
      </CardContent>
    </Card>
  );
}

export function OwnerDashboard({ onLogout }: OwnerDashboardProps) {
  const { getOwnerDashboardMetrics, seedDemoData } = useAppStore();

  // Ensure demo data is seeded so metrics are non-zero
  seedDemoData();

  const m = getOwnerDashboardMetrics();

  const sellerBuyerRatio =
    m.activeProfessionalBuyers > 0
      ? (m.activeSellers / m.activeProfessionalBuyers).toFixed(1)
      : "∞";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h1 className="text-sm font-bold text-zinc-100">Owner Dashboard</h1>
              <p className="text-xs text-zinc-500">Internal — not visible to users</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 h-8 px-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 h-8 px-2"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Alerts */}
        {m.alerts.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Imbalance Alerts
            </h2>
            {m.alerts.map((alert) => (
              <AlertBanner key={alert.id} alert={alert} />
            ))}
          </section>
        )}

        {/* Top KPIs */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Supply &amp; Demand
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Sellers"
              value={m.activeSellers}
              subtitle="Active + verified, last 30 days"
              icon={Users}
              highlight="blue"
            />
            <MetricCard
              title="Active Prof. Buyers"
              value={m.activeProfessionalBuyers}
              subtitle="Paid investors &amp; agents only"
              icon={UserCheck}
              highlight={
                m.activeProfessionalBuyers === 0
                  ? "red"
                  : m.activeSellers > m.activeProfessionalBuyers * 2
                  ? "yellow"
                  : "green"
              }
            />
            <MetricCard
              title="Seller:Buyer Ratio"
              value={`${sellerBuyerRatio}:1`}
              subtitle="Should stay below 2:1"
              icon={BarChart3}
              highlight={
                m.activeSellers > m.activeProfessionalBuyers * 2
                  ? "red"
                  : "green"
              }
            />
            <MetricCard
              title="Active Matches"
              value={m.totalMatches}
              subtitle={`${m.totalSellers} total sellers · ${m.totalBuyers} total buyers`}
              icon={Activity}
              highlight="blue"
            />
          </div>
        </section>

        {/* Funnel Rates + Liquidity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel */}
          <div className="lg:col-span-2">
            <Card className="border border-zinc-800 bg-zinc-900 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-blue-400" />
                  Marketplace Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <RateGauge
                  label="Inquiry Rate"
                  value={m.inquiryRate}
                  healthyMin={25}
                  healthyMax={50}
                  description="Listings receiving at least one serious inquiry"
                />
                <RateGauge
                  label="Offer Rate"
                  value={m.offerRate}
                  healthyMin={15}
                  healthyMax={25}
                  description="Listings receiving an actual offer (score ≥ 70)"
                />
                <RateGauge
                  label="Close Rate"
                  value={m.closeRate}
                  healthyMin={10}
                  healthyMax={20}
                  description="Listings reaching high-probability close (score ≥ 85)"
                />
              </CardContent>
            </Card>
          </div>

          {/* Liquidity */}
          <div>
            <LiquidityMeter
              score={m.liquidityScore}
              threshold={m.liquidityThreshold}
              avgOffersPerPro={m.avgOffersPerPro}
              activePros={m.activeProfessionalBuyers}
              activeSellers={m.activeSellers}
            />
          </div>
        </div>

        {/* Seller Health */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Seller Health
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Profile Completion"
              value={`${m.profileCompletionRate}%`}
              subtitle="Sellers who finished their listing"
              icon={TrendingUp}
              highlight={
                m.profileCompletionRate >= 80
                  ? "green"
                  : m.profileCompletionRate >= 60
                  ? "yellow"
                  : "red"
              }
            />
            <MetricCard
              title="Drop-off Rate"
              value={`${m.dropOffRate}%`}
              subtitle="Registered but never completed listing"
              icon={UserX}
              highlight={
                m.dropOffRate <= 20
                  ? "green"
                  : m.dropOffRate <= 40
                  ? "yellow"
                  : "red"
              }
            />
            <MetricCard
              title="Total Sellers"
              value={m.totalSellers}
              subtitle={`${m.activeSellers} active in last 30 days`}
              icon={Users}
            />
          </div>
        </section>

        {/* Decision Guide */}
        <section>
          <Card className="border border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-300">
                Marketplace Control Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-400">
                <div className="space-y-2">
                  <p className="font-semibold text-zinc-300">Liquidity Score signals</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>
                      <span className="text-emerald-400 font-medium">Above {m.liquidityThreshold}</span> — scale seller acquisition
                    </li>
                    <li>
                      <span className="text-red-400 font-medium">Below {m.liquidityThreshold}</span> — pause seller marketing
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-zinc-300">Healthy targets</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Inquiry rate: 25%+</li>
                    <li>Offer rate: 15–25%</li>
                    <li>Close rate: 10–20%</li>
                    <li>Seller:Buyer ratio: &lt; 2:1</li>
                    <li>Profile completion: 80%+</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
