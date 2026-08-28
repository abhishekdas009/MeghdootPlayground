import re

with open("frontend/app/globals.css", "r", encoding="utf-8") as f:
    content = f.read()

pattern = r'\.dark body, \.dark \.app-shell \{.*?\}'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open("frontend/app/globals.css", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
