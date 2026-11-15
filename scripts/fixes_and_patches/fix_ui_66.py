import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(r'\"_\"\t\"Id\"\t\"Ticket_Number_Read_Only__c\"\t\"Status\"\n\"[WorkOrder]\"\t\"0WONy000008eHgfOAE\"\t\"B25031925463529\"\t\"Canceled\"', r'\"_\"   \"Id\"   \"Ticket_Number_Read_Only__c\"   \"Status\"\n\"[WorkOrder]\"   \"0WONy000008eHgfOAE\"   \"B25031925463529\"   \"Canceled\"')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
