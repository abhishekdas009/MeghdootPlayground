import re

file_path = r'e:\MeghdootPlayground\frontend\app\soql-generator\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

shortcut_jsx = '''      {/* Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
        {[
          { id: "14", name: "CANCELLATION EXCEPTION", icon: "FileWarning" },
          { id: "3", name: "ASSET TRANSFER", icon: "ArrowRightLeft" },
          { id: "17", name: "DUE DATE FIX", icon: "CalendarClock" },
          { id: "20", name: "PRODUCT RECORD TYPE UPDATE", icon: "Database" }
        ].map((shortcut) => (
          <button
            key={shortcut.id}
            onClick={() => handleTemplateChange(shortcut.id)}
            className={p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 border backdrop-blur-md shadow-sm hover:shadow-md \}
          >
            {shortcut.icon === "FileWarning" && <FileWarning className={h-6 w-6 \} />}
            {shortcut.icon === "ArrowRightLeft" && <ArrowRightLeft className={h-6 w-6 \} />}
            {shortcut.icon === "CalendarClock" && <CalendarClock className={h-6 w-6 \} />}
            {shortcut.icon === "Database" && <Database className={h-6 w-6 \} />}
            <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
              {shortcut.name}
            </span>
          </button>
        ))}
      </div>
'''

content = content.replace('<div className="grid gap-6 grid-cols-1 xl:grid-cols-12 lg:gap-8">', shortcut_jsx + '\n      <div className="grid gap-6 grid-cols-1 xl:grid-cols-12 lg:gap-8">')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Added shortcuts')
