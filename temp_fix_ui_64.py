import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(r'\"_\"\t\"Component_Id__c\"\t\"Id\"\t\"Account.Customer_ID__c\"\t\"Record_Type__c\"\t\"Parent.Id\"', r'\"_\"   \"Component_Id__c\"   \"Id\"   \"Account.Customer_ID__c\"   \"Record_Type__c\"   \"Parent.Id\"')

content = content.replace(r'\"_\"\t\"Customer_ID__c\"\t\"Id\"', r'\"_\"   \"Customer_ID__c\"   \"Id\"')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated placeholders to use spaces instead of tabs")
