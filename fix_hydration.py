with open("frontend/components/ui/typewriter-quotes.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("const [subIndex, setSubIndex] = useState(0);", "const [subIndex, setSubIndex] = useState(QUOTES[0]?.length || 0);")

with open("frontend/components/ui/typewriter-quotes.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
