import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

pattern = re.compile(r'\{isAssetTransfer && \(\s*<Card className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden">\s*<CardHeader className="pb-4 bg-transparent p-6 relative">.*?</div>\s*</CardHeader>', re.DOTALL)

new_data = """{isAssetTransfer && (
            <Card className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative">
              {/* Massive Watermark Step 1 */}
              <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                  STEP 1
                </span>
              </div>
              <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">
                  <div className="flex flex-col gap-1 w-full relative">
                    <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white">
                      Asset Transfer<br />Data
                    </CardTitle>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      Component ID   New CID mapping
                    </p>
                  </div>
                </div>
              </CardHeader>"""

if pattern.search(page):
    page = pattern.sub(new_data, page, 1)
    print("Replaced Asset Transfer Data successfully")
else:
    print("Could not find Asset Transfer Data")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
