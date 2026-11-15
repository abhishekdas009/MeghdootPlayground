import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    rebuilt = f.read()

idx1 = rebuilt.find('isAssetTransfer && (', rebuilt.find('isTS && ('))
idx2 = rebuilt.find('isCancellation && (', idx1)
asset_content = rebuilt[idx1:idx2]
card_start = asset_content.find('<Card')
asset_cards = asset_content[card_start:asset_content.rfind('</Card>') + 7]

asset_cards = asset_cards.replace('Component<br />SOQL Query', 'Component SOQL Query')
asset_cards = asset_cards.replace('Account<br />SOQL Query', 'Account SOQL Query')

def clean_header(match):
    title = match.group(1).strip()
    return f'''<CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">{title}</CardTitle>
                  </div>
                </CardHeader>'''

asset_cards = re.sub(r'<CardHeader.*?>.*?<CardTitle.*?>(.*?)</CardTitle>.*?</CardHeader>', 
                     lambda m: clean_header(m) if any(x in m.group(1) for x in ["Component SOQL Query", "Account SOQL Query", "Asset SOQL Result", "Account SOQL Result", "Transfer Output"]) else m.group(0), 
                     asset_cards, flags=re.DOTALL)

idx3 = rebuilt.find('isCancellation && (', idx2)
idx4 = rebuilt.find('STEP 3', idx3)
cancel_content = rebuilt[idx3:idx4]
card_start2 = cancel_content.find('<Card')
cancel_card = cancel_content[card_start2:cancel_content.rfind('</Card>') + 7]

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

ts_idx = page.find('isTS && (', page.find('className="2xl:col-span-9'))
if ts_idx == -1:
    print("Could not find second isTS")
    sys.exit(1)

sa_end = page.find('/>', page.find('title="SA (Service Appointment)"', ts_idx)) + 2

part1 = page[:sa_end]
part3 = page[sa_end:]

insertion = """
            </>
          )}

          {isAssetTransfer && (
            <>
              """ + asset_cards + """
            </>
          )}

          {isCancellation && (
            <>
              """ + cancel_card + """
"""
part1_and_2 = part1 + insertion
final_page = part1_and_2 + part3

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(final_page)

print("Successfully merged!")
