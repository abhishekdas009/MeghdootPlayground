with open("frontend/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import_statement = 'import { TodayHighlightCard } from "@/components/ui/today-highlight-card";\n'
if import_statement not in content:
    content = content.replace('import { TypewriterQuotes } from "@/components/ui/typewriter-quotes";', 'import { TypewriterQuotes } from "@/components/ui/typewriter-quotes";\n' + import_statement)

target = """      {/* "?"?"? Primary KPI Row "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"? */}"""

insertion = """      {/* Today's Highlight */}
      <TodayHighlightCard className="w-full" />

""" + target

if "TodayHighlightCard className" not in content:
    content = content.replace(target, insertion)

with open("frontend/app/dashboard/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
