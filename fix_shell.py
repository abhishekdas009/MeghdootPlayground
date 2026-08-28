import sys
import re

with open('frontend/components/layout/shell.tsx', 'r', encoding='utf-8') as f:
    shell_content = f.read()

# Replace the broken string lines
shell_content = shell_content.replace(
    "currentCard.style.transform = perspective(1200px) rotateX(deg) rotateY(deg) scale3d(1.01, 1.01, 1.01);",
    "currentCard.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.01, 1.01, 1.01)`;"
)

shell_content = shell_content.replace(
    "currentCard.style.setProperty('--shine-x', ${shineX}%);",
    "currentCard.style.setProperty('--shine-x', `${shineX}%`);"
)

shell_content = shell_content.replace(
    "currentCard.style.setProperty('--shine-y', ${shineY}%);",
    "currentCard.style.setProperty('--shine-y', `${shineY}%`);"
)

shell_content = shell_content.replace(
    "currentCard.style.transform = perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1);",
    "currentCard.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;"
)

with open('frontend/components/layout/shell.tsx', 'w', encoding='utf-8') as f:
    f.write(shell_content)

print("Success")
