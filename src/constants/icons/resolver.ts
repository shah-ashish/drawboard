import { IconDefinition } from './iconTypes';

export function getIconByKey(catalog: IconDefinition[], key: string): IconDefinition | undefined {
  return catalog.find(i => i.key === key);
}

export function resolveIconUrl(
  element: { iconKey?: string; iconUrl?: string },
  catalog: IconDefinition[],
  theme: 'light' | 'dark' = 'light'
): string {
  if (element.iconUrl) return element.iconUrl;
  if (element.iconKey) {
    if (element.iconKey.startsWith('http://') || element.iconKey.startsWith('https://')) {
      return element.iconKey;
    }
    const def = getIconByKey(catalog, element.iconKey);
    if (def) return def.url;
    // If it's an iconify icon identifier like "logos:docker-icon" or "solar:shop"
    if (element.iconKey.includes(':')) {
      const [prefix, name] = element.iconKey.split(':');
      const isMultiColor = prefix === 'logos' || prefix === 'skill-icons' || prefix === 'devicon';
      const colorQuery = !isMultiColor
        ? `?color=${encodeURIComponent(theme === 'dark' ? '#f4f4f5' : '#1e1e1e')}`
        : '';
      return `https://api.iconify.design/${prefix}/${name}.svg${colorQuery}`;
    }
  }
  return 'https://api.iconify.design/logos/docker-icon.svg';
}
