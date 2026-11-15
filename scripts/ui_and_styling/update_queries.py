import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Update Template 1
old_ts = r'`SELECT Id, Status, ParentWorkOrderId\\nFROM WorkOrder\\nWHERE Ticket_Number_Read_Only__c IN \(\\n\{\{tickets\}\}\\n\)`'
new_ts = r'`SELECT Id, Status\nFROM WorkOrder\nWHERE Status NOT IN (\'Completed\', \'Canceled\', \'Cancellation Requested\')\nAND ParentWorkOrderId = null\nAND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`'

content = re.sub(old_ts, new_ts, content)

# Update Template 2
old_sa = r'`SELECT Id, Status\\nFROM ServiceAppointment\\nWHERE Ticket_Numbers__c IN \(\\n\{\{tickets\}\}\\n\)`'
new_sa = r'`SELECT Id, Status\nFROM ServiceAppointment\nWHERE Work_Order__r.Status NOT IN (\'Completed\', \'Canceled\', \'Cancellation Requested\')\nAND Work_Order__r.ParentWorkOrderId = null\nAND Ticket_Numbers__c IN (\n{{tickets}}\n)`'

# Since Template 18 has the exact same SOQL as the old Template 2, re.sub might replace both if not careful.
# But we only want to update Template 2, so let's match the context.

def replace_template(template_id, new_soql):
    global content
    pattern = r'(\{\s*id:\s*"' + template_id + r'".*?soql:\s*)`[^`]*`(,\s*favourite)'
    content = re.sub(pattern, r'\1`' + new_soql.replace('\n', '\\n').replace('\'', "\\'") + r'`\2', content, flags=re.DOTALL)

replace_template("1", "SELECT Id, Status\nFROM WorkOrder\nWHERE Status NOT IN ('Completed','Canceled','Cancellation Requested')\nAND ParentWorkOrderId = null\nAND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)")

replace_template("2", "SELECT Id, Status\nFROM ServiceAppointment\nWHERE Work_Order__r.Status NOT IN ('Completed','Canceled','Cancellation Requested')\nAND Work_Order__r.ParentWorkOrderId = null\nAND Ticket_Numbers__c IN (\n{{tickets}}\n)")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
