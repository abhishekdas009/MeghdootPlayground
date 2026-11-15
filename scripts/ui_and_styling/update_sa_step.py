with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
# Change STEP 4 to STEP 3 for SA card
# The code has step="STEP 4" exactly for SA.
content = re.sub(
    r'step="STEP 4"\s+title="SA \(Service Appointment\)"',
    'step="STEP 3"\n                title="SA (Service Appointment)"',
    content
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
