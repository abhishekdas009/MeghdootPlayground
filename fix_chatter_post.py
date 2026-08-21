with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

old_post_1 = """                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-black tracking-tight text-foreground">Chatter / Post Template</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(POST_TEMPLATE)}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </CardHeader>"""

new_post_1 = """                {/* Massive Watermark FOR POST */}
                <div className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden">
                  <span className="whitespace-nowrap text-[60px] md:text-[70px] lg:text-[80px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                    FOR POST
                  </span>
                </div>

                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-10 md:mt-12">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(POST_TEMPLATE)}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                      </div>
                      <CardTitle className="text-3xl md:text-4xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                        Chatter / Post<br />Template
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>"""

if old_post_1 in page:
    page = page.replace(old_post_1, new_post_1)
    print("Replaced Chatter Post successfully")
else:
    print("Could not find old code!")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
