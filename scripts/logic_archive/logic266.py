with open("frontend/app/formula-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '"use client";\n',
    '"use client";\nimport { trackDashboardEvent } from "@/lib/dashboard-tracker";\n'
)

old_code = """      }
      
      toast.success("Excel processed successfully!");
    } catch (err: any) {"""

new_code = """      }
      
      trackDashboardEvent({
        metricKey: "excel_operations",
        incrementBy: 1,
        event: {
          type: "excel-operation",
          label: "Excel formula execution",
          meta: activeTemplate?.name || "Custom Formula",
          module: "formula-generator",
        }
      });

      toast.success("Excel processed successfully!");
    } catch (err: any) {"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open("frontend/app/formula-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated formula-generator tracking.")
else:
    print("Could not find code to replace in formula-generator.")
