import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add state
content = content.replace(
    'const [cancellationFailedInput, setCancellationFailedInput] = React.useState("");',
    'const [cancellationFailedInput, setCancellationFailedInput] = React.useState("");\n  const [cancellationType, setCancellationType] = React.useState<"CCO" | "NAMO" | "NON NAMO" | "CASE">("CCO");'
)

# Reset state
content = content.replace(
    'setCancellationFailedInput("");',
    'setCancellationFailedInput("");\n      setCancellationType("CCO");'
)

old_batch_logic = """  const cancellationQueryBatches = React.useMemo(() => {
    if (parsedTickets.length === 0) {
      if (!activeTemplate?.soql?.includes("{{tickets}}") && activeTemplate?.soql) {
        return [activeTemplate.soql];
      }
      return [];
    }

    const templateSoql = activeTemplate?.soql || CANCELLATION_QUERY_TEMPLATE;

    return chunkArray(parsedTickets, CANCELLATION_BATCH_SIZE).map((tickets) =>
      templateSoql.replace("{{tickets}}", formatTicketsForSOQL(tickets))
    );
  }, [formatTicketsForSOQL, parsedTickets, activeTemplate]);"""

new_batch_logic = """  const cancellationQueryBatches = React.useMemo(() => {
    let templateSoql = "";
    if (cancellationType === "CCO") {
      templateSoql = `SELECT Id, Ticket_Number_Read_Only__c, Status\\nFROM WorkOrder\\nWHERE Status not in ('Completed','Canceled') AND Ticket_Number_Read_Only__c IN (\\n{{tickets}}\\n)`;
    } else if (cancellationType === "NAMO") {
      templateSoql = `Select Id, Ticket_Number_Read_Only__c, Status from WorkOrder Where status not in ('Completed','Canceled') and Account.Group__c = 'NAMO' and Ticket_Number_Read_Only__c IN (\\n{{tickets}}\\n)`;
    } else if (cancellationType === "NON NAMO") {
      templateSoql = `Select Id, Ticket_Number_Read_Only__c, Status from WorkOrder Where status not in ('Completed','Canceled') and Account.Group__c = 'NON NAMO' and Ticket_Number_Read_Only__c IN (\\n{{tickets}}\\n)`;
    } else if (cancellationType === "CASE") {
      templateSoql = `SELECT Id, Status, CaseId, Case.Status, Case.Cancellation_Reason__c, Cancellation_Reason__c\\nFROM WorkOrder\\nWHERE Status != 'Completed' AND Ticket_Number_Read_Only__c IN (\\n{{tickets}}\\n)`;
    }

    if (parsedTickets.length === 0) {
      return [templateSoql.replace("{{tickets}}", "")];
    }

    return chunkArray(parsedTickets, CANCELLATION_BATCH_SIZE).map((tickets) =>
      templateSoql.replace("{{tickets}}", formatTicketsForSOQL(tickets))
    );
  }, [formatTicketsForSOQL, parsedTickets, cancellationType]);"""

content = content.replace(old_batch_logic, new_batch_logic)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 1")
