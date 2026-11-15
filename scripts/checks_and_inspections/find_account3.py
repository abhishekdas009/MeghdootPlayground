import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('Account<br />SOQL Query')
if idx != -1:
    print("Found Account<br />SOQL Query")
else:
    print("NOT FOUND Account<br />SOQL Query")

idx = orig.find('Account SOQL Query')
if idx != -1:
    print("Found Account SOQL Query")
else:
    print("NOT FOUND Account SOQL Query")
