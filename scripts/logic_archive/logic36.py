import re
with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for line in f:
        if "2xl:col-span-9" in line or "xl:col-span-8" in line:
            print(line.strip())
