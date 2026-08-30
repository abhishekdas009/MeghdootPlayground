import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = r'\{isCancellation && \(\s*<div className="grid grid-cols-4 gap-2 bg-slate-50/50 dark:bg-slate-950/50 p-1\.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-inner">\s*<Button size="sm" variant=\{cancellationType === "CCO".*?</div>\s*\)\}'

new_block = """{isCancellation && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button size="sm" variant={cancellationType === "CCO" ? "default" : "outline"} onClick={() => setCancellationType("CCO")} className={cn("text-[10px] md:text-xs h-8 px-4 font-black tracking-widest uppercase rounded-full transition-all duration-300", cancellationType === "CCO" ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)] border-transparent scale-105" : "bg-transparent text-slate-400 border-slate-700 hover:border-sky-500/50 hover:text-sky-400 hover:bg-sky-500/10")}>CCO</Button>
                    <Button size="sm" variant={cancellationType === "NAMO" ? "default" : "outline"} onClick={() => setCancellationType("NAMO")} className={cn("text-[10px] md:text-xs h-8 px-4 font-black tracking-widest uppercase rounded-full transition-all duration-300", cancellationType === "NAMO" ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)] border-transparent scale-105" : "bg-transparent text-slate-400 border-slate-700 hover:border-sky-500/50 hover:text-sky-400 hover:bg-sky-500/10")}>NAMO</Button>
                    <Button size="sm" variant={cancellationType === "NON NAMO" ? "default" : "outline"} onClick={() => setCancellationType("NON NAMO")} className={cn("text-[10px] md:text-xs h-8 px-4 font-black tracking-widest uppercase rounded-full transition-all duration-300", cancellationType === "NON NAMO" ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)] border-transparent scale-105" : "bg-transparent text-slate-400 border-slate-700 hover:border-sky-500/50 hover:text-sky-400 hover:bg-sky-500/10")}>NON NAMO</Button>
                    <Button size="sm" variant={cancellationType === "CASE" ? "default" : "outline"} onClick={() => setCancellationType("CASE")} className={cn("text-[10px] md:text-xs h-8 px-4 font-black tracking-widest uppercase rounded-full transition-all duration-300", cancellationType === "CASE" ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)] border-transparent scale-105" : "bg-transparent text-slate-400 border-slate-700 hover:border-sky-500/50 hover:text-sky-400 hover:bg-sky-500/10")}>CASE</Button>
                  </div>
                )}"""

content = re.sub(old_block, new_block, content, flags=re.DOTALL)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 6")
