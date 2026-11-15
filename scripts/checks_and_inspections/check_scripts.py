import glob
for i in range(1, 80):
    filename = f"fix_ui_{i}.py"
    try:
        with open(filename, "r", encoding="utf-8") as f:
            content = f.read()
            if "frontend" in content and "page.tsx" in content and ("write" in content or "writelines" in content):
                pass
            else:
                print(f"{filename} does not modify page.tsx")
    except Exception as e:
        print(f"Missing {filename}")
