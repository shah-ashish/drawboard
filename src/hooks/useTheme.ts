import { useState, useEffect, useCallback } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

function detectSystemTheme(): ResolvedTheme {
  // 1. If running inside VS Code Webview, check VS Code's body class
  if (typeof document !== 'undefined') {
    const classList = document.body.classList;
    if (classList.contains('vscode-dark') || classList.contains('vscode-high-contrast')) {
      return 'dark';
    }
    if (classList.contains('vscode-light')) {
      return 'light';
    }
  }

  // 2. Otherwise check OS / browser media query
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }

  return 'light';
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    try {
      const stored = localStorage.getItem('drawboard-theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    return preference === 'system' ? detectSystemTheme() : preference;
  });

  // Re-detect system appearance when preference is 'system'
  const updateResolvedTheme = useCallback(() => {
    if (preference === 'system') {
      setResolvedTheme(detectSystemTheme());
    } else {
      setResolvedTheme(preference);
    }
  }, [preference]);

  useEffect(() => {
    updateResolvedTheme();

    // 1. Observe VS Code theme change on document.body class
    const observer = new MutationObserver(() => {
      if (preference === 'system') {
        setResolvedTheme(detectSystemTheme());
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // 2. Observe OS prefers-color-scheme change
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (preference === 'system') {
        setResolvedTheme(detectSystemTheme());
      }
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handleMediaChange);
    } else {
      mql.addListener(handleMediaChange);
    }

    return () => {
      observer.disconnect();
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleMediaChange);
      } else {
        mql.removeListener(handleMediaChange);
      }
    };
  }, [preference, updateResolvedTheme]);

  const setThemePreference = (pref: ThemePreference) => {
    setPreference(pref);
    try {
      localStorage.setItem('drawboard-theme', pref);
    } catch {
      // Ignore
    }
  };

  const cycleTheme = () => {
    if (preference === 'system') {
      setThemePreference('dark');
    } else if (preference === 'dark') {
      setThemePreference('light');
    } else {
      setThemePreference('system');
    }
  };

  return {
    preference,
    resolvedTheme,
    setThemePreference,
    cycleTheme
  };
}
