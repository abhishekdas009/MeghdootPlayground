with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

bad = """              </>
            );
          })()}


              {cancellationUpdateDebug && ("""

good = """
              {cancellationUpdateDebug && ("""

if bad in page:
    page = page.replace(bad, good, 1)
    print("Fixed wrapper!")
else:
    print("Could not find bad")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
