import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove the 4 buttons from Step 2 CardHeader
step2_buttons = """                        <div className="grid grid-cols-4 gap-2 bg-slate-50/50 dark:bg-white/[0.03] dark:border-white/[0.05] p-1.5 rounded-xl border border-slate-200/50 shadow-inner mt-4 md:mt-5 mb-2 relative z-20">
                          <Button size="sm" variant={cancellationType === "CCO" ? "default" : "ghost"} onClick={() => setCancellationType("CCO")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "CCO" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>CCO</Button>
                          <Button size="sm" variant={cancellationType === "NAMO" ? "default" : "ghost"} onClick={() => setCancellationType("NAMO")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "NAMO" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>NAMO</Button>
                          <Button size="sm" variant={cancellationType === "NON NAMO" ? "default" : "ghost"} onClick={() => setCancellationType("NON NAMO")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "NON NAMO" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>NON NAMO</Button>
                          <Button size="sm" variant={cancellationType === "CASE" ? "default" : "ghost"} onClick={() => setCancellationType("CASE")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "CASE" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>CASE</Button>
                        </div>\n"""
content = content.replace(step2_buttons, "")


# 2. Replace the Query Template CardContent
old_card_content = """              <CardContent className="space-y-4 p-6 pt-5 relative z-10">
                <TemplatePicker
                  templates={templates}
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                />

                <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/50 px-4 py-3 border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-black uppercase tracking-widest shrink-0 text-[10px] text-slate-500 dark:text-slate-400">
                      {activeTemplate?.category || "SOQL"}
                    </span>
                    {activeTemplate?.source === "library" && activeTemplate.usageCount !== undefined && (
                      <span className="text-[11px] font-bold text-slate-400 truncate">
                        Used {activeTemplate.usageCount} time{activeTemplate.usageCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFav(selectedTemplate)}
                    className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-xs font-bold"
                    aria-label={`Toggle favourite for ${activeTemplate?.name ?? ""}`}
                    title={activeTemplate?.favourite || favourites.has(selectedTemplate) ? "Remove Bookmark" : "Bookmark Template"}
                  >
                    <Star
                      className={`h-4.5 w-4.5 transition-all duration-500 ease-out hover:scale-125 hover:-rotate-12 ${
                        activeTemplate?.source === "library"
                          ? activeTemplate.favourite
                            ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            : "text-slate-400 hover:text-amber-500"
                          : favourites.has(selectedTemplate)
                          ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "text-slate-400 hover:text-amber-500"
                      }`}
                    />
                    <span className="text-[11px] font-black text-slate-500">
                      {activeTemplate?.source === "library"
                        ? activeTemplate.favourite
                          ? "Saved"
                          : "Favorite"
                        : favourites.has(selectedTemplate)
                        ? "Saved"
                        : "Favorite"}
                    </span>
                  </button>
                </div>
              </CardContent>"""

new_card_content = """              <CardContent className="space-y-4 p-6 pt-5 relative z-10">
                <div className="flex items-stretch gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <TemplatePicker
                      templates={templates}
                      value={selectedTemplate}
                      onChange={handleTemplateChange}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFav(selectedTemplate)}
                    className="flex-shrink-0 flex items-center justify-center w-[60px] rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all shadow-sm"
                    aria-label={`Toggle favourite for ${activeTemplate?.name ?? ""}`}
                    title={activeTemplate?.favourite || favourites.has(selectedTemplate) ? "Remove Bookmark" : "Bookmark Template"}
                  >
                    <Star
                      className={`h-5 w-5 transition-all duration-500 ease-out hover:scale-125 hover:-rotate-12 ${
                        activeTemplate?.source === "library"
                          ? activeTemplate.favourite
                            ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            : "text-slate-400 hover:text-amber-500"
                          : favourites.has(selectedTemplate)
                          ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "text-slate-400 hover:text-amber-500"
                      }`}
                    />
                  </button>
                </div>

                {isCancellation && (
                  <div className="grid grid-cols-4 gap-2 bg-slate-50/50 dark:bg-slate-950/50 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                    <Button size="sm" variant={cancellationType === "CCO" ? "default" : "ghost"} onClick={() => setCancellationType("CCO")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "CCO" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>CCO</Button>
                    <Button size="sm" variant={cancellationType === "NAMO" ? "default" : "ghost"} onClick={() => setCancellationType("NAMO")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "NAMO" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>NAMO</Button>
                    <Button size="sm" variant={cancellationType === "NON NAMO" ? "default" : "ghost"} onClick={() => setCancellationType("NON NAMO")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "NON NAMO" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>NON NAMO</Button>
                    <Button size="sm" variant={cancellationType === "CASE" ? "default" : "ghost"} onClick={() => setCancellationType("CASE")} className={cn("text-[10px] md:text-xs h-9 font-bold rounded-lg transition-all", cancellationType === "CASE" ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" : "text-slate-500 hover:text-rose-600")}>CASE</Button>
                  </div>
                )}
              </CardContent>"""

content = content.replace(old_card_content, new_card_content)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 3")
