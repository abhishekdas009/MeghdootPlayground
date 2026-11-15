with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_soql = 'soql: "SELECT Id, Component_Id__c, Parent.AccountId, ParentId, RecordTypeId FROM Asset WHERE Component_Id__c IN (\\n{{tickets}}\\n)",'
new_soql = 'soql: "SELECT Id, Component_Id__c, Parent.AccountId, ParentId, RecordTypeId FROM Asset WHERE RecordType.Name = \'Component\' and Component_Id__c IN (\\n{{tickets}}\\n)",'

if old_soql in content:
    content = content.replace(old_soql, new_soql)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated Template 20 SOQL successfully.")
else:
    print("Could not find the soql string to replace.")
