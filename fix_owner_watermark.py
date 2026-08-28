import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group flex-1 min-h-0">
                <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                        <Users className="h-4.5 w-4.5" />
                      </div>
                      <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Owner Management ({caseOwners.length})</CardTitle>
                    </div>'''

replacement = '''              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group flex-1 min-h-0">
                  {/* Massive Watermark */}
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="text-[25px] md:text-[35px] lg:text-[45px] leading-[0.9] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent flex flex-col">
                      <span>OWNER</span>
                      <span>LIST</span>
                    </span>
                  </div>
                <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 mt-8 md:mt-12">
                      <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Owner Management ({caseOwners.length})</CardTitle>
                    </div>'''

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Added watermark and adjusted title for Owner Management")
else:
    print("Failed to find exact target")
