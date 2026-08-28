import re

with open("frontend/app/globals.css", "r", encoding="utf-8") as f:
    content = f.read()

# Remove the .app-shell block that sets background-image
content = re.sub(r'\.app-shell\s*\{\s*background-image:[^}]+;\s*\}', '', content, flags=re.DOTALL)

# Remove the body block that sets background-image
content = re.sub(r'body\s*\{\s*min-height:[^}]+background-image:[^}]+;\s*\}', '', content, flags=re.DOTALL)

# Also check for any leftover .dark .app-shell rules that might affect background
content = re.sub(r'\.dark \.app-shell\s*\{\s*background-image:[^}]+;\s*\}', '', content, flags=re.DOTALL)

with open("frontend/app/globals.css", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
