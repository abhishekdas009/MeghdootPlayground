with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "lucide-react" in line:
        for j in range(max(0, i-25), i+1):
            print(lines[j].rstrip())
        break
