
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type ChecklistItem = {
  id: string;
  label: string;
};

type ScoreRange = {
  min: number;
  max: number;
  label: string;
};

type ChecklistProps = {
  title?: string;
  description?: string;
  items: ChecklistItem[];
  scoreRanges?: ScoreRange[];
  className?: string;
};

export default function Checklist({
  title,
  description,
  items,
  scoreRanges,
  className,
}: ChecklistProps) {
  const [checkedById, setCheckedById] = React.useState<Record<string, boolean>>(
    {}
  );

  const checkedCount = React.useMemo(() => {
    return items.reduce((sum, item) => sum + (checkedById[item.id] ? 1 : 0), 0);
  }, [checkedById, items]);

  const onToggle = (id: string, next: boolean) => {
    setCheckedById((prev) => ({ ...prev, [id]: next }));
  };

  const getScoreLabel = () => {
    if (!scoreRanges || scoreRanges.length === 0) return null;

    const range = scoreRanges.find(
      (r) => checkedCount >= r.min && checkedCount <= r.max
    );
    return range?.label || null;
  };

  return (
    <section
      className={cn(
        'mt-4 rounded-lg border border-[var(--text-color-primary-300)] bg-[var(--bg-color)]',
        className
      )}
      aria-label={title || 'Checklist'}
    >
      {(title || description) && (
        <div className="border-b border-[var(--text-color-primary-300)] px-4 py-3">
          {title && <h4 className="text-base font-semibold mb-1">{title}</h4>}
          {description && (
            <p className="text-sm text-[var(--text-color-primary-700)]">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="p-4">
        <ul className="space-y-3">
          {items.map((item) => {
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

        {scoreRanges && scoreRanges.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[var(--text-color-primary-300)]">
            <div className="text-sm font-semibold mb-2">
              Score: {checkedCount} checks
            </div>
            <div className="space-y-1">
              {scoreRanges.map((range, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'text-sm',
                    checkedCount >= range.min && checkedCount <= range.max
                      ? 'font-semibold text-[var(--text-color-primary)]'
                      : 'text-[var(--text-color-primary-700)]'
                  )}
                >
                  {range.min}-{range.max} checks: {range.label}
                </div>
              ))}
            </div>
            {getScoreLabel() && (
              <div className="mt-3 text-sm font-semibold text-[var(--text-color-primary)]">
                Current: {getScoreLabel()}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
