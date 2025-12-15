import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function PersonalRiskPlanDownload() {
  return (
    <div className="my-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-xl shadow-black/30 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">
        Printable Toolkit
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        Personal Risk Management Plan (PDF)
      </h3>
      <p className="mt-2 text-base text-slate-200">
        Download the fillable worksheet version to document your strategy,
        circuit breakers, and accountability commitments. Keep a printed copy
        next to your trading desk.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-300">
        <span>Format: PDF</span>
        <span>Pages: 3</span>
        <span>Updated: v1.0</span>
      </div>
      <div className="mt-6">
        <Button
          asChild
          className="h-11 gap-2 rounded-xl bg-emerald-500/80 px-6 text-base font-semibold text-white hover:bg-emerald-500"
        >
          <a
            href="/downloads/personal-risk-management-plan.pdf"
            download
            target="_blank"
            rel="noreferrer"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </Button>
      </div>
    </div>
  );
}
