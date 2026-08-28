import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# BLOCK 1
target1 = '''<div className="flex flex-wrap gap-2.5 pt-2">
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Pasted tickets: {parsedTickets.length}</Badge>
                      <Badge className="bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Parsed: {cancellationExecutionRows.length}</Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Stored: {uniqueExecutableCancellationRows.length}</Badge>
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Remaining: {cancellationRemainingTicketCount}</Badge>
                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Matched: {cancellationMatchedTicketCount}</Badge>
                      {cancellationUnexpectedResultCount > 0 && (
                        <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Outside pasted tickets: {cancellationUnexpectedResultCount}</Badge>
                      )}
                    </div>'''

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
                          <span>Outside pasted tickets: {cancellationUnexpectedResultCount}</span>
                        </>
                      )}
                    </div>'''

content = content.replace(target1, replacement1)

# BLOCK 2
target2 = '''<div className="flex flex-wrap gap-2.5">
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Pasted: {parsedTickets.length}</Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Rows: {uniqueExecutableCancellationRows.length}</Badge>
                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Status: Canceled</Badge>
                    </div>'''

replacement2 = '''<div className="flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      <span>Pasted: {parsedTickets.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Rows: {uniqueExecutableCancellationRows.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Status: Canceled</span>
                    </div>'''

content = content.replace(target2, replacement2)

# BLOCK 3
target3 = '''<div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">{caseAssignmentRows.length} valid IDs</Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">Open status</Badge>
                        <Badge variant={caseOwnerLoadState === "error" ? "danger" : "outline"} className={cn("text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm", caseOwnerLoadState === "error" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}>
                          {caseOwnerLoadState === "loading" ? "Roster syncing" : caseOwnerLoadState === "error" ? "Roster offline" : ${activeCaseOwners.length} active owners}
                        </Badge>
                      </div>'''

replacement3 = '''<div className="mt-2 flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <span>{caseAssignmentRows.length} valid IDs</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>Open status</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className={caseOwnerLoadState === "error" ? "text-rose-500" : ""}>
                          {caseOwnerLoadState === "loading" ? "Roster syncing" : caseOwnerLoadState === "error" ? "Roster offline" : ${activeCaseOwners.length} active owners}
                        </span>
                      </div>'''

content = content.replace(target3, replacement3)

# BLOCK 4
target4 = '''<div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">
                            Target matched
                          </Badge>
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">
                            {caseAssignmentResult.assignedCount} assigned
                          </Badge>
                          <Badge className={cn("text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm border", caseAssignmentResult.unassignedCaseIds.length ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700")}>
                            {caseAssignmentResult.unassignedCaseIds.length} unassigned
                          </Badge>
                        </div>'''

replacement4 = '''<div className="flex flex-wrap items-center gap-2.5 mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          <span>Target matched</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span>{caseAssignmentResult.assignedCount} assigned</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span className={caseAssignmentResult.unassignedCaseIds.length ? "text-amber-500" : ""}>
                            {caseAssignmentResult.unassignedCaseIds.length} unassigned
                          </span>
                        </div>'''

content = content.replace(target4, replacement4)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
