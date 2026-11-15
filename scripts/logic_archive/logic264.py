with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'import { trackDashboardEvent } from "@/lib/dashboard-tracker";\n\ufeff"use client";',
    '"use client";\nimport { trackDashboardEvent } from "@/lib/dashboard-tracker";'
)

# Also handle if it doesn't have BOM
content = content.replace(
    'import { trackDashboardEvent } from "@/lib/dashboard-tracker";\n"use client";',
    '"use client";\nimport { trackDashboardEvent } from "@/lib/dashboard-tracker";'
)

with open("frontend/app/warranty-finder/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed use client directive")
