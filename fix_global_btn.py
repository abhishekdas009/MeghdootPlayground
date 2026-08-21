import io

with open('frontend/components/ui/button.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add whitespace-nowrap to the global button variants
text = text.replace(
    '"inline-flex min-h-10 min-w-0 max-w-full items-center justify-center gap-2 rounded-md text-center text-sm font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50 [&>svg]:shrink-0"',
    '"inline-flex min-h-10 min-w-0 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-md text-center text-sm font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50 [&>svg]:shrink-0"'
)

with open('frontend/components/ui/button.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Global Button fixed!')
