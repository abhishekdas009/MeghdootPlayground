import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I need to find the grid and change it to 2 columns
# Current: <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 items-stretch w-full">
# Change to: <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start w-full">

target = '<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 items-stretch w-full">'
replacement = '<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start w-full">'

if target in content:
    content = content.replace(target, replacement)
    
    # Now I need to merge Column 2 and Column 3 into a single column.
    # Col 2 ends with:
    #                 </Card>
    #               </div>
    #
    #               {/* === COLUMN 3: ROSTER === */}
    #               <div className="space-y-4 flex flex-col h-full min-h-0">
    
    col_merge_target = '''                </Card>
              </div>

              {/* === COLUMN 3: ROSTER === */}
              <div className="space-y-4 flex flex-col h-full min-h-0">'''
              
    col_merge_replacement = '''                </Card>

                {/* === MERGED COLUMN 3: ROSTER === */}'''
                
    if col_merge_target in content:
        content = content.replace(col_merge_target, col_merge_replacement)
        with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: Restructured into 2 columns.")
    else:
        print("Failed to find column merge target.")
else:
    print("Failed to find grid target.")
