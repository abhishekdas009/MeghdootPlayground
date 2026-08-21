import re
with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

# Only replace inside isAssetTransfer cards (which starts around line 3480 and ends around 4030)
# Instead of complex regex, let's just replace `min-h-[140px]` with `min-h-[100px]` globally where it makes sense.
page = page.replace("min-h-[140px]", "min-h-[100px]")

print("Changed min-h-[140px] to min-h-[100px]")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
