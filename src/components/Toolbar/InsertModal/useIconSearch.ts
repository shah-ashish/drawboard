import { useState, useEffect } from 'react';
import { IconDefinition } from '../../../constants/icons';

export function useIconSearch(searchQuery: string, theme: 'light' | 'dark') {
  const [apiIcons, setApiIcons] = useState<IconDefinition[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setApiIcons([]);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(trimmed)}&limit=16`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.icons)) {
            const mapped: IconDefinition[] = data.icons
              .filter((id: string) => id.includes(':'))
              .map((id: string) => {
                const [prefix, name] = id.split(':');
                const cleanName = name
                  .replace(/-icon$/, '')
                  .replace(/-wordmark$/, '')
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, c => c.toUpperCase());
                const isMultiColor = prefix === 'logos' || prefix === 'skill-icons' || prefix === 'devicon';
                const colorQuery = !isMultiColor
                  ? `?color=${encodeURIComponent(theme === 'dark' ? '#f4f4f5' : '#1e1e1e')}`
                  : '';
                return {
                  key: id,
                  name: cleanName,
                  category: 'cloud',
                  url: `https://api.iconify.design/${prefix}/${name}.svg${colorQuery}`
                };
              });
            setApiIcons(mapped);
          }
        }
      } catch {
        // Ignored if aborted
      } finally {
        setIsSearchingApi(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, theme]);

  return { apiIcons, isSearchingApi };
}
