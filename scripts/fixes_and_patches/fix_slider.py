import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

# I will find the div with the slider
start_idx = page.find('{parsedTickets.length > 0 ? (')
end_idx = page.find(') : (\n                          <div></div>\n                        )}') + len(') : (\n                          <div></div>\n                        )}')
if start_idx != -1 and end_idx != -1:
    page = page[:start_idx] + '<div></div>' + page[end_idx:]
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(page)
    print("Replaced slider with empty div!")
else:
    print("Could not find slider block")
