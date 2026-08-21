import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad = '''                      <pre className="h-[155px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[11px] leading-relaxed text-slate-800 selection:bg-blue-500/20 selection:text-blue-900 dark:text-sky-200 dark:selection:text-blue-100">
                        {childDetailsCurrentSOQLBatch || "Paste valid Component IDs to generate the Asset SOQL query"}
                      </pre>
                    </div>
                    </div>
                  </CardContent>'''

good = '''                      <pre className="h-[155px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[11px] leading-relaxed text-slate-800 selection:bg-blue-500/20 selection:text-blue-900 dark:text-sky-200 dark:selection:text-blue-100">
                        {childDetailsCurrentSOQLBatch || "Paste valid Component IDs to generate the Asset SOQL query"}
                      </pre>
                    </div>
                  </CardContent>'''

text = text.replace(bad, good)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Fixed 3557!')
