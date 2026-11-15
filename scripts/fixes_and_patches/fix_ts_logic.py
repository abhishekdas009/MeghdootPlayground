with open("frontend/lib/today-highlight-logic.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("return FUNNY_TECH_QUOTES[index];", "return FUNNY_TECH_QUOTES[index] || \"Works on my machine.\";")

with open("frontend/lib/today-highlight-logic.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
