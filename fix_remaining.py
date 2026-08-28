import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add flex-1 to Or Paste Manually and add watermark
target_paste = '''                {/* 2. Paste Manually (Case Assign Mode) */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group shrink-0">
                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center gap-3 w-full">'''

rep_paste = '''                {/* 2. Paste Manually (Case Assign Mode) */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col flex-1 min-h-0 transition-all duration-300 relative group">
                  {/* Massive Watermark */}
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                      ADD MANUALLY
                    </span>
                  </div>

                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center gap-3 w-full mt-6 md:mt-8">'''

if target_paste in content:
    content = content.replace(target_paste, rep_paste)
    print("Success: Updated Paste Manually")
else:
    print("Failed to find Paste Manually target")

# 2. Add flex-1 to Owner Management
target_owner = '''            {/* === MERGED COLUMN 3: ROSTER === */}
            {/* Owner Roster Box */}
            <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group shrink-0">'''

rep_owner = '''            {/* === MERGED COLUMN 3: ROSTER === */}
            {/* Owner Roster Box */}
            <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col flex-1 min-h-0 transition-all duration-300 relative group">'''

if target_owner in content:
    content = content.replace(target_owner, rep_owner)
    print("Success: Updated Owner Management")
else:
    print("Failed to find Owner Management target")

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
