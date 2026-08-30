with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_motion = """        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className={`2xl:col-span-9 xl:col-span-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 min-w-0 ${isTS ? "2xl:grid-rows-2 h-full" : ""}`}
        >
          {isTS && (
            <>"""

new_motion = """        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className={`2xl:col-span-9 xl:col-span-8 min-w-0 ${!isTS ? "grid grid-cols-1 2xl:grid-cols-2 gap-6" : "2xl:relative h-full"}`}
        >
          {isTS && (
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 h-full 2xl:absolute 2xl:inset-0 2xl:grid-rows-2">"""

# Close the new div at the end of the isTS block
old_close = """                className="h-[350px] 2xl:h-full min-h-[320px]"
                  onCopy={handleCopy}
              />
            </>
          )}

          {isAssetTransfer && ("""

new_close = """                className="h-[350px] 2xl:h-full min-h-[320px]"
                  onCopy={handleCopy}
              />
            </div>
          )}

          {isAssetTransfer && ("""

if old_motion in content and old_close in content:
    content = content.replace(old_motion, new_motion)
    content = content.replace(old_close, new_close)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success 44")
else:
    print("Failed to find strings to replace")

