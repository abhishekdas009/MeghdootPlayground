import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the isCaseAssign wrapper to have h-full min-h-0
target_wrapper = '<div className="space-y-6 w-full col-span-1 2xl:col-span-2 flex flex-col">'
rep_wrapper = '<div className="space-y-6 w-full col-span-1 2xl:col-span-2 flex flex-col h-full min-h-0">'
content = content.replace(target_wrapper, rep_wrapper)

# 2. Merge Column 2 and Column 3
# Find the end of Column 2 and start of Column 3
# We want to remove the closing </div> of Column 2, and the opening <div> of Column 3
# so they become one single column.

col2_end = '''                </Card>
              </div>

              {/* === COLUMN 3: ROSTER === */}
              <div className="space-y-4 flex flex-col h-full min-h-0">'''

col2_rep = '''                </Card>

                {/* === MERGED COLUMN 3: ROSTER === */}'''

if col2_end in content:
    content = content.replace(col2_end, col2_rep)
    print("Successfully merged columns!")
else:
    print("Could not find column 2 end.")
    
with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

