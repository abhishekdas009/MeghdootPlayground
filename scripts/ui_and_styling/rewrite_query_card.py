import sys

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

start = -1
end = -1
for i, line in enumerate(lines):
    if "function QueryPreviewCard({" in line:
        start = i
    if start != -1 and line.strip() == "}" and lines[i-1].strip() == ");":
        end = i + 1
        break

if start != -1 and end != -1:
    new_func = """function QueryPreviewCard({
  title,
  subtitle,
  batches,
  batchIndex,
  setBatchIndex,
  onCopy,
    isExample,
    step,
  }: {
  title: string;
  subtitle: string;
  batches: string[];
  batchIndex: number;
  setBatchIndex: React.Dispatch<React.SetStateAction<number>>;
  onCopy: (value: string) => void;
    isExample?: boolean;
    step?: string;
  }) {
  const currentBatch = batches[batchIndex] ?? "";

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 group relative h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]">
      {step && (
        <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
          <span className="whitespace-nowrap text-[35px] md:text-[45px] lg:text-[55px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
            STEP {step}
          </span>
        </div>
      )}

      <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${step ? "mt-6 md:mt-8" : ""}`}>
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-base font-black tracking-tight text-foreground">{title}</CardTitle>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
              {batches.length} batch{batches.length === 1 ? "" : "es"}
            </span>

            {batches.length > 1 && (
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/[0.05] rounded-lg p-0.5 shadow-sm border border-slate-200 dark:border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-md"
                  disabled={batchIndex <= 0}
                  onClick={() => setBatchIndex((value) => Math.max(0, value - 1))}
                  title="Previous Batch"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-[10px] font-mono font-black px-2 text-slate-600 dark:text-slate-300">
                  {batchIndex + 1} / {batches.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-md"
                  disabled={batchIndex >= batches.length - 1}
                  onClick={() => setBatchIndex((value) => Math.min(batches.length - 1, value + 1))}
                  title="Next Batch"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 shadow-sm"
                onClick={() => onCopy(currentBatch)}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>

              {batches.length > 1 && (
                <MagneticButton
                  className="h-8 px-3 gap-2 text-xs font-bold bg-indigo-500/10 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg shadow-sm"
                  onClick={() => onCopy(batches.join("\\n\\n"))}
                  glowColor="rgba(99, 102, 241, 0.15)"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy All
                </MagneticButton>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
        {batches.length > 0 ? (
          <div className="rounded-2xl text-foreground flex flex-col min-h-0 flex-1 overflow-hidden relative bg-transparent border-transparent shadow-none transition-all duration-300 group/glass">
            <div className="relative flex-1 min-h-0">
              <pre className="h-full overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-[13px] leading-relaxed text-slate-700 selection:bg-indigo-500/20 selection:text-indigo-900 dark:text-sky-200/90 dark:selection:text-indigo-100 custom-scrollbar">
                {currentBatch}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl bg-slate-50/50 dark:bg-white/[0.02]">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {isExample ? "No valid tickets parsed" : "No queries generated"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
"""
    new_lines = lines[:start] + [new_func] + lines[end:]
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Success")
else:
    print(f"Could not find function bounds. Start={start} End={end}")
