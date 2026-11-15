with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Remove template 2 from defaultTemplates
pattern_template = r'\s*\{\s*id: "2",\s*name: "SA \(Service Appointment\)",\s*category: "ServiceAppointment",\s*soql: `SELECT Id, Status\nFROM ServiceAppointment\nWHERE Work_Order__r\.Status NOT IN \(\'Completed\',\'Canceled\',\'Cancellation Requested\'\)\nAND Work_Order__r\.ParentWorkOrderId = null\nAND Ticket_Numbers__c IN \(\n\{\{tickets\}\}\n\)`,\s*favourite: true,\s*\},'
content = re.sub(pattern_template, '', content)

# Modify buildPreviewBatches
pattern_build = r'(const buildPreviewBatches = React\.useCallback\(\s*\(\s*templateId: string\s*\) => \{\s*)(const template = templates\.find\(\(item\) => item\.id === templateId\);\s*if \(\!template\) return \[\];\s*)(if \(parsedTickets\.length === 0\) \{\s*return \[template\.soql\.replace\("\{\{tickets\}\}", ""\)\];\s*\})'

new_build = r"""\1let templateSoql = "";
      if (templateId === "2") {
        templateSoql = `SELECT Id, Status\nFROM ServiceAppointment\nWHERE Work_Order__r.Status NOT IN ('Completed','Canceled','Cancellation Requested')\nAND Work_Order__r.ParentWorkOrderId = null\nAND Ticket_Numbers__c IN (\n{{tickets}}\n)`;
      } else {
        const template = templates.find((item) => item.id === templateId);
        if (!template) return [];
        templateSoql = template.soql;
      }

      if (parsedTickets.length === 0) {
        return [templateSoql.replace("{{tickets}}", "")];
      }"""

content = re.sub(pattern_build, new_build, content)

# We also need to update template.soql -> templateSoql in the for loop
content = content.replace('const query = template.soql.replace("{{tickets}}", formatted);', 'const query = templateSoql.replace("{{tickets}}", formatted);')

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Removed SA template and updated buildPreviewBatches")
