import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "key={shortcut.id}" in line and "onClick={() => handleTemplateChange" in lines[i+1]:
        start = i - 1
        end = i
        for j in range(i, len(lines)):
            if 'span className="text-[9px]' in lines[j]:
                end = j
                break
                
        replacement = '''            <button
              key={shortcut.id}
              onClick={() => handleTemplateChange(shortcut.id)}
              className="group p-2.5 rounded-2xl flex flex-col items-center justify-between h-full gap-2 transition-all duration-300 border backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-0.5 border-white/20 bg-white/40 dark:bg-slate-900/40 dark:border-white/10 dark:hover:bg-slate-800/60"
            >
              {shortcut.icon === "FileWarning" && <FileWarning className="h-7 w-7 text-amber-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />}
              {shortcut.icon === "ArrowRightLeft" && <ArrowRightLeft className="h-7 w-7 text-blue-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />}
              {shortcut.icon === "CalendarClock" && <CalendarClock className="h-7 w-7 text-emerald-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]" />}
              {shortcut.icon === "Users" && <Users className="h-7 w-7 text-purple-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" />}
              {shortcut.icon === "Database" && <Database className="h-7 w-7 text-indigo-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]" />}
              {shortcut.icon === "CheckCircle2" && <CheckCircle2 className="h-7 w-7 text-rose-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]" />}
              {shortcut.icon === "Star" && <Star className="h-7 w-7 text-amber-400 fill-amber-400/20 transition-all duration-500 ease-out group-hover:scale-125 group-hover:-rotate-12 group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />}
              <'''
              
        lines[start:end] = [replacement]
        break

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("Success")
