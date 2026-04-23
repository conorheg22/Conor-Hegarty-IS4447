import { useTheme } from '../context/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  try {
    const { resolvedScheme } = useTheme();
    return resolvedScheme;
  } catch {
    return 'dark';
  }
}