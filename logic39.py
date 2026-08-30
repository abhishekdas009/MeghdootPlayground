with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_motion = """        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className={`2xl:col-span-9 xl:col-span-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 min-w-0 ${isTS ? "2xl:grid-rows-2 h-full" : ""}`}
        >"""

new_motion = """        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className={`2xl:col-span-9 xl:col-span-8 min-w-0 ${isTS ? "2xl:relative h-full" : "grid grid-cols-1 gap-6"}`}
        >
          {isTS ? (
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 h-full 2xl:absolute 2xl:inset-0 2xl:grid-rows-2">"""

# We need to wrap the isTS content in this inner div, but wait, the existing code has {isTS && ( <> ... </> )}
# Let's just wrap everything inside motion.div in a div that applies the grid.
