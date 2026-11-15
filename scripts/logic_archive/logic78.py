with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# 1. Update the template
old_template = """  {
    id: "20",
    name: "Product Record Type update",
    category: "Product",
    soql: "SELECT Id,ProductCode, Product2.Name,Product2.RecordType.Name,Product2.Product_Family__r.Name,Product2.Product_Sub_Family__r.Name FROM Product2 WHERE ProductCode IN (\\n{{tickets}}\\n)",
    favourite: false,
    type: "product-record-type-update",
  },"""

new_template = """  {
    id: "20",
    name: "CHILD TO PARENT UPDATED",
    category: "Asset",
    soql: "SELECT Id,Asset_Number__c, Parent.AccountId, ParentId, RecordTypeId FROM Asset WHERE Asset_Number__c IN (\\n{{tickets}}\\n)",
    favourite: false,
  },"""

if old_template in content:
    content = content.replace(old_template, new_template)
    print("Replaced template")
else:
    print("Could not find old template")

# 2. Update the shortcut list
old_shortcut = '{ id: "20", name: "PRODUCT RECORD TYPE UPDATE", icon: "Database" },'
new_shortcut = '{ id: "20", name: "CHILD TO PARENT UPDATED", icon: "CornerRightUp" },'

if old_shortcut in content:
    content = content.replace(old_shortcut, new_shortcut)
    print("Replaced shortcut")
else:
    print("Could not find old shortcut")

# 3. Update the shortcut icon renderer
old_icon_render = '{shortcut.icon === "Database" && <Database className="h-7 w-7 text-indigo-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]" />}'
new_icon_render = '{shortcut.icon === "CornerRightUp" && <CornerRightUp className="h-7 w-7 text-indigo-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]" />}'

if old_icon_render in content:
    content = content.replace(old_icon_render, new_icon_render)
    print("Replaced icon render")
else:
    print("Could not find icon render")

# 4. Add CornerRightUp to imports
if "CornerRightUp" not in content:
    content = content.replace("Database,", "Database,\n    CornerRightUp,")
    print("Added import")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
