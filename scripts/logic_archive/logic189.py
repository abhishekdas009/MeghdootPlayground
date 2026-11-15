with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_query = "`SELECT Component_Id__c, Id, Account.Customer_ID__c, Record_Type__c, Parent.Id, Parent.Account.Id\\nFROM Asset\\nWHERE Component_Id__c IN (\\n${formatted}\\n)`"
new_query = "`SELECT Component_Id__c, Id, Account.Customer_ID__c, Record_Type__c, Parent.Id, Parent.Account.Id\\nFROM Asset\\nWHERE status != 'Draft' and Asset_Obligation__c != 'AMC' and Component_Id__c IN (\\n${formatted}\\n)`"

if old_query in content:
    content = content.replace(old_query, new_query)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated assetTransferComponentSOQL successfully.")
else:
    print("Failed to find the old query.")
