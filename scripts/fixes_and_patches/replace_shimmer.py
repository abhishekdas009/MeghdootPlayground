with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_card = """          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0 flex flex-col h-full min-h-0"
          >
            <Card className="rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group">"""

new_card = """          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0 flex flex-col h-full min-h-0"
          >
            <div className="relative overflow-hidden rounded-3xl p-[1px] group/shimmer z-30 shrink-0">
              <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#3b82f6_50%,transparent_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#8b5cf6_50%,transparent_100%)] opacity-30 transition-opacity duration-300 group-hover/shimmer:opacity-100" />
              <Card className="rounded-[calc(1.5rem-1px)] border-transparent bg-white/45 shadow-none backdrop-blur-xl dark:bg-slate-950/45 overflow-hidden relative group h-full w-full">"""

content = content.replace(old_card, new_card)

# Now find the closing tag of this specific card.
# It ends right before:
#             {!isAssetTransfer && !isChildDetailsToParent && (
#               <Card className="flex flex-col flex-1 min-h-0 rounded-3xl border border-slate-200/50 bg-white/45

old_closing = """              </CardContent>
            </Card>

            {!isAssetTransfer && !isChildDetailsToParent && ("""

new_closing = """              </CardContent>
              </Card>
            </div>

            {!isAssetTransfer && !isChildDetailsToParent && ("""

content = content.replace(old_closing, new_closing)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
