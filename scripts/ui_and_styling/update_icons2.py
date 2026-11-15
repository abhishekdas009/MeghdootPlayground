import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "key={shortcut.id}" in line and "onClick={() => handleTemplateChange" in lines[i+1]:
        start = i - 1
        # Find the end by looking for <span className="text-[9px]"
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
              {shortcut.icon === "FileWarning" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                  <FileWarning className="h-5 w-5" />
                </div>
              )}
              {shortcut.icon === "ArrowRightLeft" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
              )}
              {shortcut.icon === "CalendarClock" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                  <CalendarClock className="h-5 w-5" />
                </div>
              )}
              {shortcut.icon === "Users" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5" />
                </div>
              )}
              {shortcut.icon === "Database" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Database className="h-5 w-5" />
                </div>
              )}
              {shortcut.icon === "CheckCircle2" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
              {shortcut.icon === "Star" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-5 w-5 fill-white" />
                </div>
              )}
              <'''
              
        lines[start:end] = [replacement]
        break

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("Success")
