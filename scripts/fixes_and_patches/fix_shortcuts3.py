import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "CANCELLATION EXCEPTION" in line and "FileWarning" in line:
        start = i - 1
        end = i + 5
        
        replacement = '''          {(() => {
            const baseShortcuts = [
              { id: "14", name: "CANCELLATION EXCEPTION", icon: "FileWarning" },
              { id: "3", name: "ASSET TRANSFER", icon: "ArrowRightLeft" },
              { id: "4", name: "CASE ASSIGN", icon: "Users" },
              { id: "20", name: "PRODUCT RECORD TYPE UPDATE", icon: "Database" },
              { id: "1", name: "UPDATE ACCEPTED & NONE", icon: "CheckCircle2" }
            ];
            
            const dynamicShortcuts = [...baseShortcuts];
            for (const favId of Array.from(favourites)) {
              if (!dynamicShortcuts.some(s => s.id === favId)) {
                const t = templates.find(temp => temp.id === favId);
                if (t) {
                  dynamicShortcuts.push({ id: t.id, name: t.name.toUpperCase(), icon: "Star" });
                }
              }
            }
            return dynamicShortcuts;
          })().'''
          
        lines[start:end+1] = [replacement + "map((shortcut) => (\n"]
        break

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("Success")
