import sys
import re

# 1. Update shell.tsx to add the useGlobalTilt hook
with open('frontend/components/layout/shell.tsx', 'r', encoding='utf-8') as f:
    shell_content = f.read()

hook_code = '''
function useGlobalTilt() {
  React.useEffect(() => {
    let ticking = false;
    let currentCard: HTMLElement | null = null;
    let mouseX = 0;
    let mouseY = 0;

    const updateTilt = () => {
      if (!currentCard) {
        ticking = false;
        return;
      }
      
      const rect = currentCard.getBoundingClientRect();
      const x = mouseX - rect.left;
      const y = mouseY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Keep tilt low intensity (max 2.5 degrees) for best UX
      const tiltX = ((y - centerY) / centerY) * -2.5;
      const tiltY = ((x - centerX) / centerX) * 2.5;

      const shineX = (x / rect.width) * 100;
      const shineY = (y / rect.height) * 100;

      currentCard.style.transform = perspective(1200px) rotateX(deg) rotateY(deg) scale3d(1.01, 1.01, 1.01);
      currentCard.style.setProperty('--shine-x', ${shineX}%);
      currentCard.style.setProperty('--shine-y', ${shineY}%);
      
      ticking = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      const target = e.target as HTMLElement;
      const card = target.closest('.page-hero') as HTMLElement;
      
      if (currentCard && currentCard !== card) {
        currentCard.classList.remove('tilt-active');
        currentCard.style.transform = perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1);
      }

      currentCard = card;

      if (card) {
        if (!card.classList.contains('tilt-active')) {
          card.classList.add('tilt-active');
        }
        if (!ticking) {
          window.requestAnimationFrame(updateTilt);
          ticking = true;
        }
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (!currentCard) return;
      const related = e.relatedTarget as HTMLElement;
      if (!currentCard.contains(related)) {
         currentCard.classList.remove('tilt-active');
         currentCard.style.transform = perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1);
         currentCard = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseout', handleMouseLeave, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  useGlobalTilt();
'''

shell_content = re.sub(r'export function Shell\(\{ children \}: \{ children: React\.ReactNode \}\) \{\s*const \{ sidebarCollapsed \} = useUIStore\(\);', hook_code.strip(), shell_content)

with open('frontend/components/layout/shell.tsx', 'w', encoding='utf-8') as f:
    f.write(shell_content)

# 2. Update globals.css to add the tilt-active classes
with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

tilt_css = '''
.page-hero {
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: transform;
  transform-style: preserve-3d;
  --shine-x: 50%;
  --shine-y: 50%;
}

.page-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.4s ease;
  background: radial-gradient(circle at var(--shine-x) var(--shine-y), rgba(255, 255, 255, 0.15) 0%, transparent 60%);
  pointer-events: none;
  z-index: 10;
  mix-blend-mode: overlay;
}

.page-hero.tilt-active {
  transition: transform 0.1s ease-out;
}

.page-hero.tilt-active::after {
  opacity: 1;
  transition: opacity 0.1s ease-out;
}
'''

css_content += "\\n" + tilt_css + "\\n"

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Success")
