import sys

with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("\\n", "\n")

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
