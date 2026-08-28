import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace block 1: Pasted tickets...
pattern1 = r'<div className="flex flex-wrap gap-2\.5 pt-2">.*?Outside pasted tickets.*?</div>'
replacement1 = '''<div className="flex flex-wrap items-center gap-2.5 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      <span>Pasted tickets: {parsedTickets.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Parsed: {cancellationExecutionRows.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Stored: {uniqueExecutableCancellationRows.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Remaining: {cancellationRemainingTicketCount}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Matched: {cancellationMatchedTicketCount}</span>
                      {cancellationUnexpectedResultCount > 0 && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span>Outside: {cancellationUnexpectedResultCount}</span>
                        </>
                      )}
                    </div>'''

content = re.sub(pattern1, replacement1, content, flags=re.DOTALL)

# Replace block 2: Pasted: 0, Rows: 0, Status: Canceled
pattern2 = r'<div className="flex flex-wrap gap-2\.5">\s*<Badge[^>]*>Pasted: \{parsedTickets\.length\}</Badge>\s*<Badge[^>]*>Rows: \{uniqueExecutableCancellationRows\.length\}</Badge>\s*<Badge[^>]*>Status: Canceled</Badge>\s*</div>'
replacement2 = '''<div className="flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      <span>Pasted: {parsedTickets.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Rows: {uniqueExecutableCancellationRows.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Status: Canceled</span>
                    </div>'''

content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)

# Replace block 3: valid IDs
pattern3 = r'<div className="mt-2 flex flex-wrap items-center gap-1\.5">\s*<Badge[^>]*>\{caseAssignmentRows\.length\} valid IDs</Badge>\s*<Badge[^>]*>Open status</Badge>\s*<Badge[^>]*>.*?</Badge>\s*</div>'
replacement3 = '''<div className="mt-2 flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <span>{caseAssignmentRows.length} valid IDs</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>Open status</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className={caseOwnerLoadState === "error" ? "text-rose-500" : ""}>
                          {caseOwnerLoadState === "loading" ? "Roster syncing" : caseOwnerLoadState === "error" ? "Roster offline" : ${activeCaseOwners.length} active owners}
                        </span>
                      </div>'''

content = re.sub(pattern3, replacement3, content, flags=re.DOTALL)

# Replace block 4: Target matched
pattern4 = r'<div className="flex flex-wrap items-center gap-1\.5 mt-2">\s*<Badge[^>]*>\s*Target matched\s*</Badge>\s*<Badge[^>]*>\s*\{caseAssignmentResult\.assignedCount\} assigned\s*</Badge>\s*<Badge[^>]*>\s*\{caseAssignmentResult\.unassignedCaseIds\.length\} unassigned\s*</Badge>\s*</div>'
replacement4 = '''<div className="flex flex-wrap items-center gap-2.5 mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          <span>Target matched</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span>{caseAssignmentResult.assignedCount} assigned</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span className={caseAssignmentResult.unassignedCaseIds.length ? "text-amber-500" : ""}>
                            {caseAssignmentResult.unassignedCaseIds.length} unassigned
                          </span>
                        </div>'''

content = re.sub(pattern4, replacement4, content, flags=re.DOTALL)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex replacements executed")
