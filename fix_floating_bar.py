import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I want to find the exact block for the floating bar inside QueryPreviewCard
target = '''<div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-60 
group-hover/glass:opacity-100 transition-opacity">'''
target = target.replace('\n', '')

# We will just replace it using string replacement by finding the block manually
