import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '{shortcut.icon === "CalendarClock" && <CalendarClock className="h-7 w-7 text-emerald-500" />}'
replacement = '{shortcut.icon === "CalendarClock" && <CalendarClock className="h-7 w-7 text-emerald-500" />}\n              {shortcut.icon === "Users" && <Users className="h-7 w-7 text-purple-500" />}'

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Added Users icon mapping.")
else:
    print("Target not found.")
