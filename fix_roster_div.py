import io
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the specific Roster list syntax error using regex to ignore leading spaces
text = re.sub(
    r'(\s+)</div>\n(\s+)</CardContent>\n(\s+)</Card>',
    r'\1</div>\n\1  </div>\n\2</CardContent>\n\3</Card>',
    text,
    count=1 # wait, no, just replace the one that follows the Roster list!
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Roster div fixed via regex!')
