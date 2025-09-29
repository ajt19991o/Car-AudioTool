import { useAppStore } from '../state/useAppStore';

function ThemeToggle() {
  const theme = useAppStore(state => state.theme);
  const toggleTheme = useAppStore(state => state.toggleTheme);

  const isDark = theme === 'dark';
  const label = isDark ? 'Light Mode' : 'Dark Mode';

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${label}`}>
      <span className="theme-toggle__icon" aria-hidden="true">{isDark ? '🌞' : '🌙'}</span>
      <span className="theme-toggle__label">{label}</span>
    </button>
  );
}

export default ThemeToggle;
