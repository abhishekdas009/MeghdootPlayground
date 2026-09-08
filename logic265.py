with open("frontend/app/formula-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()
if "use client" in content:
    print("Found use client")
    print(content[:200])
