with open("frontend/lib/festivals.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('const today = new Date().toISOString().split("T")[0];', 'const today = new Date().toISOString().split("T")[0] || "";')

with open("frontend/lib/festivals.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
