with open("frontend/lib/festivals.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('// Adding today for immediate testing:\n  "2026-08-29": "Raksha Bandhan",\n', "")

with open("frontend/lib/festivals.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
