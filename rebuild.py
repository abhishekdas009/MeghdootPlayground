import os
import subprocess

for i in range(1, 76):
    filename = f"fix_ui_{i}.py"
    if not os.path.exists(filename):
        continue
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # replace the filepath
    content = content.replace(r"frontend\app\soql-generator\page.tsx", "page_rebuilt.tsx")
    content = content.replace(r"frontend/app/soql-generator/page.tsx", "page_rebuilt.tsx")
    
    with open(f"temp_{filename}", 'w', encoding='utf-8') as f:
        f.write(content)
    
    # run it
    print(f"Running {filename}...")
    res = subprocess.run(["python", f"temp_{filename}"], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  Failed: {res.stderr.strip()}")
    else:
        print(f"  Success")
