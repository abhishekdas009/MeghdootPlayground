with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

bad_str = """            </>
          );
              })()}          {isCancellation && (() => {"""

good_str = """            </>
          )}

          {isCancellation && (() => {"""

if bad_str in page:
    page = page.replace(bad_str, good_str)
    print("Fixed dangling IIFE close")
else:
    print("Could not find bad string")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
