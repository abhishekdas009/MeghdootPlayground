with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# We will insert id "2" after id "1"
pattern = r'(id: "1".*?favourite: true,\s*\},)'
new_template = r"""\1
  {
    id: "2",
    name: "SA (Service Appointment)",
    category: "ServiceAppointment",
    soql: `SELECT Id, Status
FROM ServiceAppointment
WHERE Work_Order__r.Status NOT IN ('Completed','Canceled','Cancellation Requested')
AND Work_Order__r.ParentWorkOrderId = null
AND Ticket_Numbers__c IN (
{{tickets}}
)`,
    favourite: true,
  },"""

content = re.sub(pattern, new_template, content, flags=re.DOTALL)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added template 2")
