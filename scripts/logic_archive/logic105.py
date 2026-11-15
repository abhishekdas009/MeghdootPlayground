with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Fix overlap in PasteResultCard
old_str = '<div className="flex flex-wrap items-center gap-3">'
new_str = '<div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6">'
if old_str in content:
    content = content.replace(old_str, new_str)
    print("Fixed button overlap in PasteResultCard.")
else:
    print("Button overlap already fixed or not found.")

# Let's fix overlap in QueryPreviewCard as well, just in case!
old_query_header = '<div className={`flex flex-row flex-wrap gap-4 items-start justify-between`}>'
# I need to see QueryPreviewCard to make sure. Let's not guess.

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
