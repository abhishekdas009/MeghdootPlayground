with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

import re

old_code = """              {/* Massive Watermark Step 1 */}
              <div className="absolute top-2 left-4 md:left-6 pointer-events-none select-none z-0 overflow-hidden">
                <span className="whitespace-nowrap text-[85px] md:text-[100px] xl:text-[110px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                  STEP 1
                </span>
              </div>

              <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-16 md:mt-20">"""

new_code = """              {/* Massive Watermark Step 1 */}
              <div className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden">
                <span className="whitespace-nowrap text-[70px] md:text-[80px] lg:text-[90px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                  STEP 1
                </span>
              </div>

              <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-12 md:mt-14">"""

if old_code in page:
    page = page.replace(old_code, new_code)
    print("Replaced successfully")
else:
    print("Could not find old code!")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)

