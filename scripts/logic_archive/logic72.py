with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "lucide-react" in line:
            print(f"Line {i}: {line.strip()}")
            # Print a few lines after to see the imports
            for j in range(i+1, i+15):
                print(next(f).strip())
            break
