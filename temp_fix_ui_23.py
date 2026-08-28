import os

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# For Step 1
old_step1 = '''                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2">
                    {!isCaseAssign && !isCancellation && (
                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow-sm flex items-center gap-1.5">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white shadow-inner">1</span>
                          Step 1
                        </Badge>
                      )}
                    <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight flex-1">
                      {isCancellation ? "Paste Cancellation Tickets" : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"}
                    </CardTitle>
                  </div>'''

new_step1 = '''                  <div className="flex items-center gap-4 relative z-10 w-full pr-2">
                    {isCancellation && (
                      <div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white text-[11px] font-black shadow-inner">
                          1
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">
                          STEP 1
                        </span>
                      </div>
                    )}
                    <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight flex-1">
                      {isCancellation ? "Paste Cancellation Tickets" : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"}
                    </CardTitle>
                  </div>'''

# wait, in my previous fix I renamed "Paste Your Tickets" to "Paste Cancellation Tickets"? No I didn't. 
# So I should just replace 'Paste Your Tickets' with 'Paste Cancellation Tickets'.
content = content.replace('"Paste Your Tickets"', '"Paste Cancellation Tickets"')

# Let's find the actual text in the file.
