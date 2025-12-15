
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type ChecklistItem = {
  id: string;
  label: string;
};

type ChecklistGroup = {
  title: string;
  items: ChecklistItem[];
};

const GROUPS: ChecklistGroup[] = [
  {
    title: 'Capital Structure Health Check',
    items: [
      { id: 'cash-runway-gt-12m', label: 'Cash runway > 12 months?' },
      { id: 'burn-decreasing', label: 'Quarterly burn rate decreasing?' },
      { id: 'path-to-profit', label: 'Path to profitability visible?' },
      { id: 'debt-manageable', label: 'Existing debt manageable?' },
    ],
  },
  {
    title: 'Share Structure Analysis',
    items: [
      {
        id: 'float-appropriate',
        label: 'Float size appropriate for market cap?',
      },
      {
        id: 'warrants-lt-10-float',
        label: 'Outstanding warrants < 10% of float?',
      },
      {
        id: 'convertible-lt-20-mcap',
        label: 'Convertible debt < 20% of market cap?',
      },
      {
        id: 'employee-equity-lt-15-out',
        label: 'Employee equity plans < 15% of outstanding shares?',
      },
    ],
  },
  {
    title: 'Recent Financing History',
    items: [
      { id: 'last-offering-gt-12m', label: 'Last offering > 12 months ago?' },
      { id: 'avg-discount-lt-15', label: 'Average offering discount < 15%?' },
      { id: 'no-toxic-lenders', label: 'No toxic lenders (check Form D)?' },
      {
        id: 'use-of-proceeds-strategic',
        label: 'Use of proceeds was strategic, not operational?',
      },
    ],
  },
  {
    title: 'Forward-Looking Signals',
    items: [
      {
        id: 'active-s3-shelf',
        label: 'Active S-3 shelf registration? (Red flag if yes)',
      },
      {
        id: 'recent-def14a-share-increase',
        label: 'Recent DEF 14A proposing share increase? (Red flag if yes)',
      },
      {
        id: 'atm-not-fully-used',
        label: 'ATM program announced but not fully used? (Caution)',
      },
      {
        id: 'warrants-expiring',
        label: 'Warrant expiration dates approaching? (Dilution trigger)',
      },
    ],
  },
  {
    title: 'Insider Confidence',
    items: [
      {
        id: 'form4-buying-90d',
        label: 'Form 4 showing insider buying last 90 days? (Bullish)',
      },
      {
        id: 'no-heavy-insider-selling',
        label: 'No heavy insider selling? (Red flag if recent selling)',
      },
      {
        id: 'ceo-cfo-buying',
        label: 'CEO/CFO buying around last offering? (Very bullish)',
      },
    ],
  },
];

export default function DilutionChecklist({
  className,
}: {
  className?: string;
}) {
  const [checkedById, setCheckedById] = React.useState<Record<string, boolean>>(
    {}
  );

  const totals = React.useMemo(() => {
    const perGroup = GROUPS.map((group) => {
      const total = group.items.length;
      const checked = group.items.reduce(
        (sum, item) => sum + (checkedById[item.id] ? 1 : 0),
        0
      );
      return { title: group.title, checked, total };
    });
    const overallChecked = perGroup.reduce((s, g) => s + g.checked, 0);
    const overallTotal = perGroup.reduce((s, g) => s + g.total, 0);
    return { perGroup, overallChecked, overallTotal };
  }, [checkedById]);

  const onToggle = (id: string, next: boolean) => {
    setCheckedById((prev) => ({ ...prev, [id]: next }));
  };

  return (
    <section
      className={cn(
        'mt-4 rounded-lg border border-[var(--text-color-primary-300)] bg-[var(--bg-color)]',
        className
      )}
      aria-label="Comprehensive Dilution Checklist"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[var(--text-color-primary-300)] px-4 py-3">
        <h4 className="text-base font-semibold">Checklist Progress</h4>
        <div className="text-sm text-[var(--text-color-primary-700)]">
          {totals.overallChecked} / {totals.overallTotal} completed
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">
        {GROUPS.map((group) => (
          <div
            key={group.title}
            className="rounded-md border border-[var(--text-color-primary-200)] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h5 className="text-sm font-semibold">{group.title}</h5>
              <span className="text-xs text-[var(--text-color-primary-700)]">
                {totals.perGroup.find((g) => g.title === group.title)
                  ?.checked ?? 0}
                {' / '}
                {group.items.length}
              </span>
            </div>
            <ul className="space-y-3">
              {group.items.map((item) => {
                const isChecked = !!checkedById[item.id];
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <Checkbox
                      id={item.id}
                      checked={isChecked}
                      onCheckedChange={(v) => onToggle(item.id, Boolean(v))}
                      className="mt-0.5"
                    />
                    <Label htmlFor={item.id} className="cursor-pointer">
                      {item.label}
                    </Label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
