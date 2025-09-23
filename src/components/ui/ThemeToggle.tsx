import React from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  // Restores user's theme preference if applicable
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored as Theme;
  // Defaults to system preference if applicable
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle({ floating = false }: { floating?: boolean }) {
  // Keeps track of the current theme
    const [theme, setTheme] = React.useState<Theme>(getInitialTheme());

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark'); // Turns dark theme on
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark'); // Turns light theme on
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Toggles if user clicks button
  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const btn = (
    <button
      onClick={toggle}
      className="focus-ring inline-flex items-center justify-center rounded-full border border-secondary-200 bg-white/90 backdrop-blur px-3 py-2 shadow-md hover:shadow-lg dark:bg-secondary-800 dark:border-secondary-700"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
      type="button"
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-secondary-50" />
      ) : (
        <Moon size={18} className="text-secondary-900" />
      )}
      <span className="ml-2 text-sm font-medium hidden sm:inline-block dark:text-secondary-50">
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  );

  if (!floating) return btn;

  // Sets the button's location on screen
  return <div className="fixed right-4 bottom-24 z-50">{btn}</div>;
}

export default ThemeToggle;
