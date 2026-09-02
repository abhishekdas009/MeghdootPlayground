with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_soql = """  return [
    "SELECT Id,",
    "Component_Id__c,",
    "Parent.AccountId,",
    "ParentId,",
    "RecordTypeId",
    "FROM Asset",
    "WHERE Component_Id__c IN (",
    formatSOQLValues(componentIds),
    ")",
  ].join("\\n");"""

new_soql = """  return [
    "SELECT Id,",
    "Component_Id__c,",
    "Parent.AccountId,",
    "ParentId,",
    "RecordTypeId",
    "FROM Asset",
    "WHERE RecordType.Name = 'Component' and Component_Id__c IN (",
    formatSOQLValues(componentIds),
    ")",
  ].join("\\n");"""

if old_soql in content:
    content = content.replace(old_soql, new_soql)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated buildChildDetailsParentSOQL successfully.")
else:
    print("Could not find the function to replace.")
