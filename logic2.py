import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """                    <CardHeader className="pb-3 bg-transparent p-6 relative z-10">
                        <div className="flex flex-col w-full relative mt-5 md:mt-6">"""

insertion = """                    <CardHeader className="pb-3 bg-transparent p-6 relative z-10">
                        <div className="grid grid-cols-4 gap-2 bg-slate-50/50 dark:bg-white/[0.03] dark:border-white/[0.05] p-1.5 rounded-xl border border-slate-200/50 shadow-inner mt-4 md:mt-5 mb-2 relative z-20">
                          <Button size="sm" variant={cancellationType === "CCO" ? "default" : "ghost"} onClick={() => setCancellationType("CCO")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "CCO" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>CCO</Button>
                          <Button size="sm" variant={cancellationType === "NAMO" ? "default" : "ghost"} onClick={() => setCancellationType("NAMO")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "NAMO" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>NAMO</Button>
                          <Button size="sm" variant={cancellationType === "NON NAMO" ? "default" : "ghost"} onClick={() => setCancellationType("NON NAMO")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "NON NAMO" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>NON NAMO</Button>
                          <Button size="sm" variant={cancellationType === "CASE" ? "default" : "ghost"} onClick={() => setCancellationType("CASE")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "CASE" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>CASE</Button>
                        </div>
                        <div className="flex flex-col w-full relative mt-1 md:mt-2">"""

content = content.replace(target, insertion)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 2")
