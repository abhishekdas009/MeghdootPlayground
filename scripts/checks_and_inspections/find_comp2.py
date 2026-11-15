import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('Component SOQL Query')
if idx != -1:
    print("Found Component SOQL Query")
else:
    print("NOT FOUND Component SOQL Query")

idx = orig.find('Component<br />SOQL Query')
if idx != -1:
    print("Found Component<br />SOQL Query")
else:
    print("NOT FOUND Component<br />SOQL Query")
