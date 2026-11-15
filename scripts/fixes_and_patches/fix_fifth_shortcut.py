import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_jsx = '''      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-6 relative z-10">
        {[
          { id: "14", name: "CANCELLATION EXCEPTION", icon: "FileWarning" },
          { id: "3", name: "ASSET TRANSFER", icon: "ArrowRightLeft" },
          { id: "17", name: "DUE DATE FIX", icon: "CalendarClock" },
          { id: "20", name: "PRODUCT RECORD TYPE UPDATE", icon: "Database" }
        ].map((shortcut) => (
          <button
            key={shortcut.id}
            onClick={() => handleTemplateChange(shortcut.id)}
            className="p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 border backdrop-blur-md shadow-sm hover:shadow-md border-white/20 bg-white/40 dark:bg-slate-900/40 dark:border-white/10 dark:hover:bg-slate-800/60"
          >
            {shortcut.icon === "FileWarning" && <FileWarning className="h-7 w-7 text-amber-500" />}
            {shortcut.icon === "ArrowRightLeft" && <ArrowRightLeft className="h-7 w-7 text-blue-500" />}
            {shortcut.icon === "CalendarClock" && <CalendarClock className="h-7 w-7 text-emerald-500" />}
            {shortcut.icon === "Database" && <Database className="h-7 w-7 text-indigo-500" />}'''

new_jsx = '''      <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 mb-6 relative z-10">
        {[
          { id: "14", name: "CANCELLATION EXCEPTION", icon: "FileWarning" },
          { id: "3", name: "ASSET TRANSFER", icon: "ArrowRightLeft" },
          { id: "17", name: "DUE DATE FIX", icon: "CalendarClock" },
          { id: "20", name: "PRODUCT RECORD TYPE UPDATE", icon: "Database" },
          { id: "1", name: "UPDATE ACCEPTED & NONE", icon: "CheckCircle2" }
        ].map((shortcut) => (
          <button
            key={shortcut.id}
            onClick={() => handleTemplateChange(shortcut.id)}
            className="p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 border backdrop-blur-md shadow-sm hover:shadow-md border-white/20 bg-white/40 dark:bg-slate-900/40 dark:border-white/10 dark:hover:bg-slate-800/60"
          >
            {shortcut.icon === "FileWarning" && <FileWarning className="h-7 w-7 text-amber-500" />}
            {shortcut.icon === "ArrowRightLeft" && <ArrowRightLeft className="h-7 w-7 text-blue-500" />}
            {shortcut.icon === "CalendarClock" && <CalendarClock className="h-7 w-7 text-emerald-500" />}
            {shortcut.icon === "Database" && <Database className="h-7 w-7 text-indigo-500" />}
            {shortcut.icon === "CheckCircle2" && <CheckCircle2 className="h-7 w-7 text-rose-500" />}'''

if old_jsx in content:
    content = content.replace(old_jsx, new_jsx)
    print("Successfully updated shortcuts")
else:
    print("Could not find old JSX")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
