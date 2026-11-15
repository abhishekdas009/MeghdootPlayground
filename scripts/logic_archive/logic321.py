with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if "<pre " in line and "SOQLHighlighter" not in line and "className=" in line:
        # Extract className
        class_part = line.split('className="')[1].split('"')[0]
        
        # Read ahead to find the closing </pre>
        j = i + 1
        inner_content = []
        while j < len(lines) and "</pre>" not in lines[j]:
            inner_content.append(lines[j].strip())
            j += 1
            
        if j < len(lines) and "</pre>" in lines[j]:
            inner = " ".join(inner_content).strip()
            # inner might be something like `{manualComponentSOQL}` or `{childToParentSOQL || "..."}`
            # We strip the outer curlies for the query prop
            if inner.startswith("{") and inner.endswith("}"):
                query_val = inner[1:-1]
            else:
                # If it's a string literal or something else, just wrap it in quotes if needed
                # But it's usually inside curlies in this file
                query_val = inner.strip("{}")
                
            new_lines.append(f'                    <SOQLHighlighter query={{{query_val}}} className="{class_part}" />\n')
            i = j + 1
            continue
            
    new_lines.append(line)
    i += 1

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Replaced missed pre tags.")
