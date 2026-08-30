with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "id: \"20\"" in line:
            for j in range(i-2, i+10):
                print(next(f).strip())
            break
