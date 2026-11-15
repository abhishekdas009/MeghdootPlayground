with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "isAssetTransfer &&" in line or "isChildDetailsToParent &&" in line or "!isChildDetailsToParent &&" in line:
            print(f"Line {i}: {line.strip()}")
