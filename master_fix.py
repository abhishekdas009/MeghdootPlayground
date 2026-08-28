import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    rebuilt = f.read()

# 1. Extract Asset Transfer 5 cards from rebuilt
idx1 = rebuilt.find('isAssetTransfer && (', rebuilt.find('isTS && ('))
idx2 = rebuilt.find('isCancellation && (', idx1)
asset_content = rebuilt[idx1:idx2]
# Find the start of the first card (STEP 2)
card_start = asset_content.find('<Card')
asset_cards = asset_content[card_start:asset_content.rfind('</Card>') + 7]

# Clean up Asset Transfer cards to match modern style
# Remove <br /> in Component and Account SOQL Query
asset_cards = asset_cards.replace('Component<br />SOQL Query', 'Component SOQL Query')
asset_cards = asset_cards.replace('Account<br />SOQL Query', 'Account SOQL Query')

# Clean up the CardTitles to have the modern style
# We can use regex to replace CardHeader block with the clean one
def clean_header(match):
    title = match.group(2).strip()
    return f'''<CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">{title}</CardTitle>
                  </div>
                </CardHeader>'''

# Replace old CardHeaders
asset_cards = re.sub(r'<CardHeader.*?>.*?<CardTitle.*?>(.*?)</CardTitle>.*?</CardHeader>', 
                     lambda m: clean_header(m) if "Component SOQL Query" in m.group(1) or "Account SOQL Query" in m.group(1) or "Asset SOQL Result" in m.group(1) or "Account SOQL Result" in m.group(1) or "Transfer Output" in m.group(1) else m.group(0), 
                     asset_cards, flags=re.DOTALL)


# 2. Extract Cancellation SOQL Batches card from rebuilt
idx3 = rebuilt.find('isCancellation && (', idx2)
idx4 = rebuilt.find('STEP 3', idx3)
cancel_content = rebuilt[idx3:idx4]
card_start2 = cancel_content.find('<Card')
cancel_card = cancel_content[card_start2:cancel_content.rfind('</Card>') + 7]

# Clean up Cancellation SOQL Batches card layout
cancel_header_pattern = r'<CardHeader.*?</CardHeader>'
cancel_header_modern = r'''<CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                        Cancellation SOQL Batches
                      </CardTitle>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm whitespace-nowrap mt-5 md:mt-6">
                        {cancellationQueryBatches.length} BATCH{cancellationQueryBatches.length === 1 ? "" : "ES"}
                      </Badge>
                    </div>
                  </CardHeader>'''
cancel_card = re.sub(cancel_header_pattern, cancel_header_modern, cancel_card, count=1, flags=re.DOTALL)


# 3. Stitch into page.tsx
# Find isTS in the second motion div
ts_idx = page.find('isTS && (', page.find('class="2xl:col-span-9') if 'class="2xl:col-span-9' in page else page.find('className="2xl:col-span-9'))
if ts_idx == -1:
    print("Could not find second isTS")
    sys.exit(1)

# Find end of SA QueryPreviewCard
sa_end = page.find('/>', page.find('title="SA (Service Appointment)"', ts_idx)) + 2

# We will cut page.tsx at sa_end
part1 = page[:sa_end]
part3 = page[sa_end:]

# But wait, in part3, the first thing is the Paste SOQL Result Batch Card which was inside isTS.
# We need to close isTS, open isAssetTransfer, close it, open isCancellation.
insertion = f'''
            </>
          )}

          {{isAssetTransfer && (
            <>
              {asset_cards}
            </>
          )}}

          {{isCancellation && (
            <>
              {cancel_card}
'''
part1_and_2 = part1 + insertion
final_page = part1_and_2 + part3

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(final_page)

print("Successfully merged!")
