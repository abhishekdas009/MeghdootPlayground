import sys
import re

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    rebuilt = f.read()

idx1 = rebuilt.find('isAssetTransfer && (', rebuilt.find('isTS && ('))
idx2 = rebuilt.find('isCancellation && (', idx1)
asset_content = rebuilt[idx1:idx2]

start_idx = asset_content.find('<>') + 2
end_idx = asset_content.rfind('</>')
asset_cards = asset_content[start_idx:end_idx].strip()
print(asset_cards[-100:])
