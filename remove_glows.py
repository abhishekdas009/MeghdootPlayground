import sys
import re

with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make .dark body and .dark .app-shell completely flat espresso
# Let's completely remove the .dark .app-shell::before and ::after rules, or make them display: none.
css = re.sub(r'\.dark \.app-shell::before\s*\{[^}]*\}', '.dark .app-shell::before { display: none !important; }', css)
css = re.sub(r'\.dark \.app-shell::after\s*\{[^}]*\}', '.dark .app-shell::after { display: none !important; }', css)

# Remove the radial-gradients from .dark .app-shell
# It looks like:
# .dark .app-shell {
#    background-image: ...
# }
css = re.sub(r'\.dark \.app-shell\s*\{\s*background-image:[^}]*\}', '.dark .app-shell {\n  background-image: none !important;\n}', css)

# If there is another .dark .app-shell rule...
# Wait, I already set:
# .dark body, .dark .app-shell {
#    background-color: #302423 !important;
#    color: #e2e8f0 !important;
#    background-image: none !important;
# }
css = css.replace('background-color: #302423 !important;\n    color: #e2e8f0 !important;', 'background-color: #302423 !important;\n    color: #e2e8f0 !important;\n    background-image: none !important;')

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Success")
