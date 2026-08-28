import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Asset SOQL
content = content.replace(r'"_"\t"Component_Id__c"\t"Id"\t"Account.Customer_ID__c"\t"Record_Type__c"\t"Parent.Id"', r'"_"   "Component_Id__c"   "Id"   "Account.Customer_ID__c"   "Record_Type__c"   "Parent.Id"')

# Account SOQL
content = content.replace(r'"_"\t"Customer_ID__c"\t"Id"', r'"_"   "Customer_ID__c"   "Id"')

# Cancellation Main
content = content.replace(r'"_"\t"Id"\t"Ticket_Number_Read_Only__c"\t"Status"', r'"_"   "Id"   "Ticket_Number_Read_Only__c"   "Status"')
content = content.replace(r'"[WorkOrder]"\t"0WONy000008eHgfOAE"\t"B25031925463529"\t"Cancellation Requested"', r'"[WorkOrder]"   "0WONy000008eHgfOAE"   "B25031925463529"   "Cancellation Requested"')

# Cancellation Secondary
content = content.replace(r'"[WorkOrder]"\t"0WONy000008eHgfOAE"\t"B25031925463529"\t"Canceled"', r'"[WorkOrder]"   "0WONy000008eHgfOAE"   "B25031925463529"   "Canceled"')


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated all placeholders to use spaces instead of literal \t")
