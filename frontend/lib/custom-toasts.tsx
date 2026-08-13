import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function showDataFeedbackToast(title: string, value: string, actionType: 'copy' | 'download' = 'copy') {
  if (!value) return;
  const lines = value.split('\n');
  const preview = lines.slice(0, 3).join('\n') + (lines.length > 3 ? '\n...' : '');
  
  toast.custom((t) => (
    <div className="w-full sm:w-[356px] relative overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-900 p-4 shadow-2xl backdrop-blur-xl">
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-xl opacity-50 pointer-events-none" />
      <div className="relative z-10 flex items-start gap-3">
        <div className="relative flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-5 w-5 animate-[pulse_2s_ease-in-out_infinite] drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <p className="text-sm font-bold text-slate-100 truncate">{title}</p>
          <p className="text-xs text-slate-400 font-medium truncate">{lines.length} rows {actionType === 'copy' ? 'copied' : 'downloaded'}</p>
          <div className="mt-2 rounded-md bg-black/40 p-2 border border-white/5 overflow-hidden">
            <pre className="font-mono text-[10px] leading-relaxed text-emerald-200/70 max-h-16 overflow-hidden break-all whitespace-pre-wrap">
              {preview}
            </pre>
          </div>
        </div>
      </div>
    </div>
  ), { duration: 4000 });
}
