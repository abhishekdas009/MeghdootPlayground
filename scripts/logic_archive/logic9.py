import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = r'\{isCancellation && \(\s*<div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl w-full border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden">.*?</div>\s*\)\}'

new_block = """{isCancellation && (
                  <div className="flex flex-wrap items-center gap-4 w-full pt-3 pb-2 px-1">
                    {["CCO", "NAMO", "NON NAMO", "CASE"].map((type) => {
                      const isSelected = cancellationType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setCancellationType(type as any)}
                          className={cn(
                            "px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex-1 min-w-fit text-center",
                            "bg-slate-50 dark:bg-slate-900",
                            isSelected
                              ? "text-violet-500 shadow-[-1px_-1px_5px_rgba(255,255,255,0.6),1px_1px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[-1px_-1px_5px_rgba(255,255,255,0.03),1px_1px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(0,0,0,0.6)]"
                              : "text-slate-500 hover:text-violet-400 shadow-[-5px_-5px_10px_rgba(255,255,255,0.8),5px_5px_10px_rgba(0,0,0,0.15)] dark:shadow-[-5px_-5px_10px_rgba(255,255,255,0.03),5px_5px_10px_rgba(0,0,0,0.6)] hover:shadow-[-1px_-1px_5px_rgba(255,255,255,0.6),1px_1px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(0,0,0,0.2)] dark:hover:shadow-[-1px_-1px_5px_rgba(255,255,255,0.03),1px_1px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(0,0,0,0.6)]"
                          )}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                )}"""

content = re.sub(old_block, new_block, content, flags=re.DOTALL)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 9")
