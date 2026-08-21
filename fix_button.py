import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add whitespace-nowrap to the Generate Assignment button
old_btn = 'className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs gap-2 h-10 px-5 flex-1 shadow-md shadow-purple-500/20 rounded-xl transition-all hover:-translate-y-0.5"'
new_btn = 'className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs gap-2 h-10 px-4 sm:px-5 flex-1 whitespace-nowrap shadow-md shadow-purple-500/20 rounded-xl transition-all hover:-translate-y-0.5"'

text = text.replace(old_btn, new_btn)

# Also check the other buttons in that row just in case
# They don't have whitespace-nowrap but they are short
with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Button fixed!')
