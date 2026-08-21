import io
import re

with open('frontend/components/layout/shell.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_str = '''  return (
    <div className="app-shell relative min-h-screen overflow-x-hidden bg-background">
      <ParticleBackground />'''

new_str = '''  return (
    <div className="app-shell relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#020813]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-400/20 mix-blend-multiply blur-[120px] dark:bg-blue-600/15 dark:mix-blend-normal sm:h-[60%] sm:w-[60%]" />
        <div className="absolute right-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-purple-400/20 mix-blend-multiply blur-[120px] dark:bg-purple-600/15 dark:mix-blend-normal sm:h-[60%] sm:w-[60%]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[50%] w-[60%] rounded-full bg-sky-300/20 mix-blend-multiply blur-[120px] dark:bg-sky-500/10 dark:mix-blend-normal sm:h-[60%] sm:w-[60%]" />
      </div>
      <ParticleBackground />'''

text = text.replace(old_str, new_str)

with open('frontend/components/layout/shell.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Done')
