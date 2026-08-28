import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    rebuilt = f.read()

idx1 = rebuilt.find('isAssetTransfer && (', rebuilt.find('isTS && ('))
idx2 = rebuilt.find('isCancellation && (', idx1)
asset_content = rebuilt[idx1:idx2]

start_idx = asset_content.find('<>') + 2
end_idx = asset_content.rfind('</>')
asset_cards = asset_content[start_idx:end_idx].strip()

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

# But wait, page.tsx right now STILL HAS the syntax error from master_fix2!
# Let me replace page.tsx back to its backup, or I can just fix the current page.tsx manually by adding )}!
# Let me just check what is currently in page.tsx at line 3509.
