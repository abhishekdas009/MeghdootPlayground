with open("frontend/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import_statement = 'import { TodayHighlightCard } from "@/components/ui/today-highlight-card";\n'
content = content.replace('import { TypewriterQuotes } from "@/components/ui/typewriter-quotes";', 'import { TypewriterQuotes } from "@/components/ui/typewriter-quotes";\n' + import_statement)

# Replace the quickActions grid
old_grid = """            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {quickActions.map((action) => (
                <QuickActionCard key={action.title} {...action} />
              ))}
            </div>"""

new_grid = """            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              <div className="lg:col-span-1">
                <TodayHighlightCard className="h-full" />
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.title} {...action} />
                ))}
              </div>
            </div>"""

content = content.replace(old_grid, new_grid)

with open("frontend/app/dashboard/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
