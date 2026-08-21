with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

bad_start = """              </>
            );
          })()}

              {cancellationUpdateDebug && ("""

good_start = """
              {cancellationUpdateDebug && ("""


bad_end = """                </Card>
              )}
            </>
          )}

          {isCaseAssign && ("""

good_end = """                </Card>
              )}
            </>
          );
          })()}

          {isCaseAssign && ("""

if bad_start in page:
    page = page.replace(bad_start, good_start)
    print("Fixed start")
else:
    print("Could not find bad_start")

if bad_end in page:
    page = page.replace(bad_end, good_end)
    print("Fixed end")
else:
    print("Could not find bad_end")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
