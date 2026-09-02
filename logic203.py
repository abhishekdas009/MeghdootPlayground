with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Header
old_header = 'buildCSVRow(["_", "Id", "RecordTypeId", "ParentId", "AccountId"]),'
new_header = 'buildCSVRow(["_", "Id", "AccountId", "ParentId", "RecordTypeId"]),'

# Replace Row Generation
old_row = """        buildCSVRow([
          "[Asset]",
          candidate.assetId,
          CHILD_DETAILS_PARENT_TARGET_RECORD_TYPE_ID,
          "",
          candidate.parentAccountId,
        ])"""

new_row = """        buildCSVRow([
          "[Asset]",
          candidate.assetId,
          candidate.parentAccountId,
          "",
          CHILD_DETAILS_PARENT_TARGET_RECORD_TYPE_ID,
        ])"""

if old_header in content and old_row in content:
    content = content.replace(old_header, new_header)
    content = content.replace(old_row, new_row)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated column order successfully.")
else:
    print("Could not find the text to replace.")
