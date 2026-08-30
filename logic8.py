import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = r'\{isCancellation && \(\s*<div className="flex flex-wrap items-center gap-2 pt-1">.*?</div>\s*\)\}'

new_block = """{isCancellation && (
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl w-full border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden">
                    {["CCO", "NAMO", "NON NAMO", "CASE"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setCancellationType(type as any)}
                        className={cn(
                          "relative px-2 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap flex-1 text-center",
                          cancellationType === type ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                      >
                        {cancellationType === type && (
                          <motion.div
                            layoutId="cancellation-type-slider"
                            className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700"
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{type}</span>
                      </button>
                    ))}
                  </div>
                )}"""

content = re.sub(old_block, new_block, content, flags=re.DOTALL)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 8")
