with open("frontend/components/ui/typewriter-quotes.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("[quotes[i], quotes[j]] = [quotes[j], quotes[i]];", """const temp = quotes[i];
      if (temp !== undefined && quotes[j] !== undefined) {
        quotes[i] = quotes[j] as string;
        quotes[j] = temp;
      }""")

with open("frontend/components/ui/typewriter-quotes.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
