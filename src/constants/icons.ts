import { IconDefinition } from './icons/iconTypes';
import { CLOUD_ICONS } from './icons/cloudIcons';
import { FRAMEWORK_ICONS } from './icons/frameworkIcons';
import { DATABASE_ICONS } from './icons/databaseIcons';
import { SYSTEM_ICONS } from './icons/systemIcons';
import { getIconByKey as getIconByKeyHelper, resolveIconUrl as resolveIconUrlHelper } from './icons/resolver';

export * from './icons/iconTypes';
export { CLOUD_ICONS } from './icons/cloudIcons';
export { FRAMEWORK_ICONS } from './icons/frameworkIcons';
export { DATABASE_ICONS } from './icons/databaseIcons';
export { SYSTEM_ICONS } from './icons/systemIcons';

export const ICON_CATALOG: IconDefinition[] = [
  ...CLOUD_ICONS,
  ...FRAMEWORK_ICONS,
  ...DATABASE_ICONS,
  ...SYSTEM_ICONS
];

export function getIconByKey(key: string): IconDefinition | undefined {
  return getIconByKeyHelper(ICON_CATALOG, key);
}

export function resolveIconUrl(element: { iconKey?: string; iconUrl?: string }, theme: 'light' | 'dark' = 'light'): string {
  return resolveIconUrlHelper(element, ICON_CATALOG, theme);
}
