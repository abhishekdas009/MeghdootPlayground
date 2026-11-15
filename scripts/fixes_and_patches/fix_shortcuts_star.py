import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "CheckCircle2 className" in line and "h-7 w-7" in line:
        lines.insert(i+1, '              {shortcut.icon === "Star" && <Star className="h-7 w-7 text-amber-400 fill-amber-400/20 drop-shadow-sm" />}\n')
        break

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("Success")
