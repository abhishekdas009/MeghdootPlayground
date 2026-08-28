import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''          {[
            { id: "14", name: "CANCELLATION EXCEPTION", icon: "FileWarning" },
            { id: "3", name: "ASSET TRANSFER", icon: "ArrowRightLeft" },
            { id: "4", name: "CASE ASSIGN", icon: "Users" },
            { id: "20", name: "PRODUCT RECORD TYPE UPDATE", icon: "Database" },
            { id: "1", name: "UPDATE ACCEPTED & NONE", icon: "CheckCircle2" }
          ].map((shortcut) => ('''

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
          })().map((shortcut) => ('''

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Made shortcuts dynamic")
else:
    print("Failed to find shortcuts array")
