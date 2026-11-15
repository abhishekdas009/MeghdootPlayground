import os

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('placeholder={Paste Asset SOQL result here...\\n"_"   "Component_Id__c"   "Id"   "Account.Customer_ID__c"   "Record_Type__c"   "Parent.Id"}', 'placeholder={`Paste Asset SOQL result here...\\n"_"   "Component_Id__c"   "Id"   "Account.Customer_ID__c"   "Record_Type__c"   "Parent.Id"`}')

content = content.replace('placeholder={Paste Account SOQL result here...\\n"_"   "Customer_ID__c"   "Id"}', 'placeholder={`Paste Account SOQL result here...\\n"_"   "Customer_ID__c"   "Id"`}')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed missing backticks")
