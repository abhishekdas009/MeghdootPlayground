import sys
import re

with open('frontend/components/layout/shell.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if 'function useGlobalTilt' not in content:
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

      currentCard.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.01, 1.01, 1.01)`;
      currentCard.style.setProperty('--shine-x', `${shineX}%`);
      currentCard.style.setProperty('--shine-y', `${shineY}%`);
      
      ticking = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      const target = e.target as HTMLElement;
      const card = target.closest('.page-hero') as HTMLElement;
      
      if (currentCard && currentCard !== card) {
        currentCard.classList.remove('tilt-active');
        currentCard.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
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
         currentCard.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
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
    content = content.replace('export function Shell({ children }: { children: React.ReactNode }) {\n  const { sidebarCollapsed } = useUIStore();', hook_code.strip())

    with open('frontend/components/layout/shell.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
print("Success")
