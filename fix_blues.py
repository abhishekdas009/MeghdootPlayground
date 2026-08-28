import sys
import re

with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace blue box-shadows in dark mode
css = css.replace('rgba(0, 100, 255, 0.08)', 'rgba(0, 0, 0, 0.15)')
css = css.replace('rgba(0, 100, 255, 0.12)', 'rgba(0, 0, 0, 0.25)')

# Replace blue linear-gradients in dark mode borders
css = css.replace('rgba(0, 150, 255, 0.2)', 'rgba(255, 255, 255, 0.1)')
css = css.replace('rgba(0, 150, 255, 0.25)', 'rgba(255, 255, 255, 0.1)')

# Find the block where .dark colors are defined
# .dark .page-hero {
#   border-color: rgb(141 171 255 / 0.2);
#   background-color: rgb(7 15 34 / 0.34);
# }
css = css.replace('border-color: rgb(141 171 255 / 0.2);', 'border-color: rgba(255, 255, 255, 0.1);')
css = css.replace('background-color: rgb(7 15 34 / 0.34);', 'background-color: rgba(0, 0, 0, 0.2);')

# .dark .workspace-page .app-card {
#   border-color: rgb(126 151 211 / 0.18);
#   background-color: rgb(5 13 31 / 0.38);
css = css.replace('border-color: rgb(126 151 211 / 0.18);', 'border-color: rgba(255, 255, 255, 0.1);')
css = css.replace('background-color: rgb(5 13 31 / 0.38);', 'background-color: rgba(0, 0, 0, 0.2);')

# Inputs
css = css.replace('border-color: rgb(114 142 207 / 0.17) !important;', 'border-color: rgba(255, 255, 255, 0.1) !important;')
css = css.replace('background-color: rgb(3 8 20 / 0.5) !important;', 'background-color: rgba(0, 0, 0, 0.2) !important;')

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Success")
