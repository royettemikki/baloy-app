import { useRef, useState } from 'react';

export function useFlipMenu(menuWidth = 224, estimatedMenuHeight = 220) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  function openMenu() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const openUpward = window.innerHeight - rect.bottom < estimatedMenuHeight;
    setMenuStyle({
      position: 'fixed',
      left: Math.max(8, rect.right - menuWidth),
      ...(openUpward ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    });
    setMenuOpen(true);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleMenu() {
    menuOpen ? closeMenu() : openMenu();
  }

  return { buttonRef, menuOpen, menuStyle, openMenu, closeMenu, toggleMenu };
}
