import React from 'react';
import { Moon, Sun } from 'lucide-react';
type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  // Default
  if (typeof window === 'undefined') return 'light';
  // Restores user's theme preference if applicable
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved as Theme;
  // Defaults to system preference if applicable
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle({ floating = false }: { floating?: boolean }) {
  // Keeps track of the current theme
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme());

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') { root.classList.add('dark'); localStorage.setItem('theme','dark'); } // Turns dark theme on
    else { root.classList.remove('dark'); localStorage.setItem('theme','light'); } // Turns light theme on
  }, [theme]);

  // Toggles if user clicks button
  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const btn = (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="focus-ring inline-flex items-center justify-center rounded-full border border-secondary-200 bg-white/90 backdrop-blur px-3 py-2 shadow-md hover:shadow-lg dark:bg-secondary-800 dark:border-secondary-700"
    >
      {theme === 'dark' ? <Sun size={18} className="text-secondary-50" /> : <Moon size={18} className="text-secondary-900" />}
      <span className="ml-2 text-sm font-medium hidden sm:inline-block dark:text-secondary-50">
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  );

  if (!floating) return btn;
  // Sets the button's location on screen
  return <div className="fixed right-4 bottom-24 z-50">{btn}</div>;
}

