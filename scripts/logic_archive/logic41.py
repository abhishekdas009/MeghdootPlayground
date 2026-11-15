import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_wrapper = """        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className={`2xl:col-span-9 xl:col-span-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 min-w-0 ${isTS ? "2xl:grid-rows-2 h-full" : ""}`}
        >"""

new_wrapper = """        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className={`2xl:col-span-9 xl:col-span-8 min-w-0 2xl:relative ${isTS ? "h-full" : ""}`}
        >
          <div className={`grid grid-cols-1 2xl:grid-cols-2 gap-6 w-full ${isTS ? "2xl:grid-rows-2 h-full 2xl:absolute 2xl:inset-0" : ""}`}>"""

content = content.replace(old_wrapper, new_wrapper)

# We need to close the extra div at the end of the motion.div
# Let's find the closing tag of this motion.div
