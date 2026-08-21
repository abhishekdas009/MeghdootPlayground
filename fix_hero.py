import re

with open("frontend/app/globals.css", "r", encoding="utf-8") as f:
    css = f.read()

old_dark_hero = """.dark .page-hero {
  border-color: rgb(96 165 250 / 0.2);
  background-color: rgb(15 23 42 / 0.86);
  background-image:
    linear-gradient(rgb(96 182 255 / 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgb(96 182 255 / 0.07) 1px, transparent 1px),
    radial-gradient(circle at 82% 12%, rgb(37 99 235 / 0.22), transparent 26rem),
    linear-gradient(145deg, rgb(2 6 23 / 0.96), rgb(23 37 84 / 0.88), rgb(2 6 23 / 0.96));
  box-shadow: 0 24px 60px -32px rgb(15 23 42 / 0.9);
}"""

# Using regex because spacing might differ
old_dark_hero_regex = r'\.dark \.page-hero \{[^}]*\}'

new_dark_hero = """.dark .page-hero {
  border-color: rgb(255 255 255 / 0.08);
  background-color: rgb(255 255 255 / 0.02);
  background-image:
    linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px);
  backdrop-filter: blur(4px);
  box-shadow: 0 0 50px -12px rgba(59,130,246,0.15), inset 0 0 20px rgba(255,255,255,0.03);
}"""

css = re.sub(old_dark_hero_regex, new_dark_hero, css, flags=re.MULTILINE)

with open("frontend/app/globals.css", "w", encoding="utf-8") as f:
    f.write(css)

print("Updated .dark .page-hero in globals.css")
