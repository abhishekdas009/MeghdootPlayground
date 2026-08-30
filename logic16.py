import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function QueryPreviewCard(" in line:
        for j in range(i, i+200):
            if "CardContent" in lines[j] and "pre" in lines[j+5]:
                for k in range(j-5, j+20):
                    print(lines[k].rstrip())
                break
        break
