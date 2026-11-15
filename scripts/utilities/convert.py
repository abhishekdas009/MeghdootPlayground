import codecs
with codecs.open('page_original.tsx', 'r', 'utf-16') as f:
    content = f.read()
with codecs.open('page_rebuilt.tsx', 'w', 'utf-8') as f:
    f.write(content)
