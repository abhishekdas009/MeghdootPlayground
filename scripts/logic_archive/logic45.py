import re
with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for line in f:
        if "isAssetTransfer &&" in line or "isChildDetailsToParent &&" in line:
            print(line.strip())
