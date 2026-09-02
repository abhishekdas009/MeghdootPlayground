with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "selectedTemplate === \"20\"" in line or "isChildDetailsToParent" in line:
        pass
    if "childDetailsInput" in line and "Textarea" in line:
        print(f"Line {i}: {line.strip()}")
    if "childDetailsSOQLResult" in line and "Textarea" in line:
        print(f"Line {i}: {line.strip()}")
