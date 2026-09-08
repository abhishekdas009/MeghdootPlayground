with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import_statement = 'import { trackDashboardEvent } from "@/lib/dashboard-tracker";\n'

# Add import at the top
content = import_statement + content

old_code = """      if (res.ok && data.success) {
        setSearchResult(data.conditions);
      }"""

new_code = """      if (res.ok && data.success) {
        setSearchResult(data.conditions);
        trackDashboardEvent({
          metricKey: "warranty_checks",
          incrementBy: 1,
          event: {
            type: "warranty-check",
            label: "Warranty check",
            meta: modelNumber,
            module: "warranty-finder",
          }
        });
      }"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open("frontend/app/warranty-finder/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated warranty-finder tracking.")
else:
    print("Could not find code to replace.")
