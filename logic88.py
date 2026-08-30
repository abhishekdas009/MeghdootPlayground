with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "const isChildDetailsToParent =" in line:
            print(f"Line {i}: {line.strip()}")
            for j in range(i+1, i+3):
                print(f"Line {j}: {next(f).strip()}")
            break
