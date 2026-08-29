import re

with open("frontend/lib/soql-generator-utils.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_soql = r"`SELECT Id, Ticket_Number_Read_Only__c, Status\\nFROM WorkOrder\\nWHERE Ticket_Number_Read_Only__c IN \(\\n\{\{tickets\}\}\\n\)\\nAND Status = 'Cancellation Requested'`"
new_soql = "`SELECT Id, Ticket_Number_Read_Only__c, Status\\nFROM WorkOrder\\nWHERE Ticket_Number_Read_Only__c IN (\\n{{tickets}}\\n)`"

content = re.sub(old_soql, new_soql, content)

with open("frontend/lib/soql-generator-utils.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
