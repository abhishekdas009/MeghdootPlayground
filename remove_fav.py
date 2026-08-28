import re

file_path = r'e:\MeghdootPlayground\frontend\app\soql-generator\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Delete the favourite button
pattern = r'<button\s+onClick=\{toggleFavourite\}.*?</button>'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Removed Favourite button')
