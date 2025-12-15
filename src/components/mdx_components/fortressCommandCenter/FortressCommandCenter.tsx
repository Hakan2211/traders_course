import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  GaugeCircle,
  ShieldCheck,
} from 'lucide-react';

type StatusLevel = 'clear' | 'alert';

const accountStats = [
  { label: 'Starting Capital', value: '$10,000' },
  { label: 'Current Equity', value: '$11,240' },
  { label: 'Peak Equity', value: '$11,450' },
  { label: 'Drawdown', value: '-1.8%' },
];

const capacityStats = [
  { label: 'Current Positions', value: '3 / 6' },
  { label: 'Portfolio Heat', value: '4.2% / 8%' },
];

const performancePrimary = [
  { label: 'Today', value: '+1.5R' },
  { label: 'This Week', value: '+3.2R' },
  { label: 'This Month', value: '+8.7R' },
  { label: 'This Year', value: '+34.5R' },
];

const performanceSecondary = [
  { label: 'Win Rate (30d)', value: '52%' },
  { label: 'Expectancy', value: '+0.58R' },
  { label: 'Avg Win', value: '+2.1R' },
  { label: 'Avg Loss', value: '-0.95R' },
];

const positions = [
  {
    name: 'EUR/USD Long',
    entry: '1.1000',
    risk: '1.5%',
    current: '1.1045',
    rMultiple: '+0.75R',
    stop: '1.0940',
  },
  {
    name: 'Gold Long',
    entry: '2020',
    risk: '1.2%',
    current: '2035',
    rMultiple: '+0.90R',
    stop: '2005',
  },
  {
    name: 'AAPL Long',
    entry: '180',
    risk: '1.5%',
    current: '182',
    rMultiple: '+0.50R',
    stop: '176',
  },
];

const circuitBreakers: { label: string; value: string; status: StatusLevel }[] =
  [
    { label: 'Daily Loss', value: '-0% / -3%', status: 'clear' },
    { label: 'Weekly Loss', value: '-1.2% / -6%', status: 'clear' },
    { label: 'Monthly Loss', value: '+8.7%', status: 'clear' },
  ];

const regimeStatus = [
  { label: 'EUR/USD ATR', value: '58 (Normal)' },
  { label: 'VIX', value: '18 (Normal)' },
  { label: 'Regime', value: 'Normal' },
  { label: 'Action', value: 'Standard params' },
];

const correlations = [
  { pair: 'EUR-GBP', value: '0.42' },
  { pair: 'EUR-Gold', value: '0.31' },
  { pair: 'EUR-AAPL', value: '0.15' },
];

const watchlistAlerts = [
  { title: 'GBP/USD approaching 1.2800' },
  { title: 'Gold testing 2040 resistance' },
];

const ruleAdherence = [
  { label: 'Pre-trade checklist', value: '100%' },
  { label: 'Position size correct', value: '100%' },
  { label: 'Stops placed pre-entry', value: '100%' },
  { label: 'Stops never widened', value: '100%' },
  { label: 'Portfolio heat check', value: '100%' },
];

const nextActions = [
  'Trail Gold stop to breakeven',
  'Review EUR/USD setup at 1.1080',
  'Weekly review scheduled Sunday',
  'Update trading journal',
];

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-inner shadow-black/30 backdrop-blur">
      <div className="mb-3 flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-300">
        {Icon ? <Icon className="h-4 w-4 text-emerald-300" /> : null}
        {title}
      </div>
      <div className="space-y-3 text-sm text-slate-100">{children}</div>
    </div>
  );
}

function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/5 bg-black/20 px-3 py-2"
        >
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
            {item.label}
          </p>
          <p className="text-lg font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function StatusRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: StatusLevel;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="flex items-center gap-2 font-semibold text-white">
        {value}
        {status === 'alert' ? (
          <AlertTriangle className="h-4 w-4 text-amber-300" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        )}
      </span>
    </div>
  );
}

export function FortressCommandCenter() {
  return (
    <Card className="border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 shadow-2xl">
      <CardHeader className="border-b border-white/10 bg-white/5">
        <Badge className="mb-3 w-fit bg-emerald-500/15 text-[0.65rem] uppercase tracking-[0.5em] text-emerald-200">
          Fortress Command Center
        </Badge>
        <CardTitle className="text-3xl font-black tracking-tight text-white">
          Your Trading Dashboard
        </CardTitle>
        <p className="text-sm text-slate-300">
          Snapshot of capital health, risk limits, performance, and next moves.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Section title="Account Status" icon={ShieldCheck}>
              <StatGrid items={accountStats} />
              <StatGrid items={capacityStats} />
            </Section>

            <Section title="Current Positions" icon={Activity}>
              <div className="space-y-3">
                {positions.map((position) => (
                  <div
                    key={position.name}
                    className="rounded-2xl border border-emerald-400/20 bg-black/30 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {position.name}
                        </p>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Risk: {position.risk}
                        </p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-200">
                        {position.rMultiple}
                      </Badge>
                    </div>
                    <dl className="mt-3 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
                      <div>
                        <dt className="text-slate-400">Entry</dt>
                        <dd className="font-semibold">{position.entry}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Current</dt>
                        <dd className="font-semibold">{position.current}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Stop</dt>
                        <dd className="font-semibold">{position.stop}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Watchlist Alerts" icon={AlertTriangle}>
              <div className="space-y-2">
                {watchlistAlerts.map((alert) => (
                  <div
                    key={alert.title}
                    className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-200" />
                    <span>{alert.title}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Rule Adherence (This Week)" icon={ShieldCheck}>
              <div className="space-y-2">
                {ruleAdherence.map((item) => (
                  <StatusRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    status="clear"
                  />
                ))}
              </div>
              <div className="rounded-xl border border-white/10 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 px-4 py-3 text-center text-sm font-semibold text-emerald-200">
                Overall Score: 100% (A+) 🏆
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Performance Metrics" icon={BarChart3}>
              <Table>
                <TableBody>
                  {performancePrimary.map((metric) => (
                    <TableRow key={metric.label} className="border-white/5">
                      <TableCell className="font-medium text-slate-400">
                        {metric.label}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {metric.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="grid gap-3 sm:grid-cols-2">
                {performanceSecondary.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  >
                    <p className="text-xs text-slate-400">{metric.label}</p>
                    <p className="text-base font-semibold text-white">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Circuit Breaker Status" icon={ShieldCheck}>
              <div className="space-y-2">
                {circuitBreakers.map((item) => (
                  <StatusRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    status={item.status}
                  />
                ))}
              </div>
            </Section>

            <Section title="Regime Status" icon={GaugeCircle}>
              <div className="grid gap-3 sm:grid-cols-2">
                {regimeStatus.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      'rounded-xl border px-3 py-2',
                      item.label === 'Regime'
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100'
                        : 'border-white/10 bg-black/20 text-slate-200'
                    )}
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="text-base font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Correlation Check" icon={Activity}>
              <div className="space-y-2 text-sm">
                {correlations.map((pair) => (
                  <StatusRow
                    key={pair.pair}
                    label={pair.pair}
                    value={pair.value + ' ✅'}
                    status="clear"
                  />
                ))}
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs uppercase tracking-[0.3em] text-emerald-200">
                  All pairs safe
                </div>
              </div>
            </Section>

            <Section title="Next Actions" icon={Activity}>
              <div className="space-y-2 text-sm text-slate-200">
                {nextActions.map((action) => (
                  <div
                    key={action}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/40 text-xs text-emerald-200">
                      ☐
                    </div>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
