export interface IconDefinition {
  key: string;
  name: string;
  category: 'cloud' | 'frameworks' | 'databases' | 'system';
  url: string;
}

// Curated tech logos and architecture icons powered by Iconify CDN (Zero manual SVG paths)
export const ICON_CATALOG: IconDefinition[] = [
  // DevOps & Cloud
  {
    key: 'docker',
    name: 'Docker',
    category: 'cloud',
    url: 'https://api.iconify.design/logos/docker-icon.svg'
  },
  {
    key: 'kubernetes',
    name: 'Kubernetes',
    category: 'cloud',
    url: 'https://api.iconify.design/logos/kubernetes.svg'
  },
  {
    key: 'aws',
    name: 'AWS',
    category: 'cloud',
    url: 'https://api.iconify.design/logos/aws.svg'
  },
  {
    key: 'gcp',
    name: 'Google Cloud',
    category: 'cloud',
    url: 'https://api.iconify.design/logos/google-cloud.svg'
  },
  {
    key: 'azure',
    name: 'Azure',
    category: 'cloud',
    url: 'https://api.iconify.design/logos/azure-icon.svg'
  },
  {
    key: 'github',
    name: 'GitHub',
    category: 'cloud',
    url: 'https://api.iconify.design/logos/github-icon.svg'
  },
  {
    key: 'linux',
    name: 'Linux',
    category: 'cloud',
    url: 'https://api.iconify.design/logos/linux-tux.svg'
  },
  {
    key: 'cloudflare',
    name: 'Cloudflare',
    category: 'cloud',
    url: 'https://api.iconify.design/logos/cloudflare-icon.svg'
  },
  {
    key: 'terraform',
    name: 'Terraform',
    category: 'cloud',
    url: 'https://api.iconify.design/logos/terraform-icon.svg'
  },
  {
    key: 'vercel',
    name: 'Vercel',
    category: 'cloud',
    url: 'https://api.iconify.design/logos/vercel-icon.svg'
  },

  // Languages & Frameworks
  {
    key: 'react',
    name: 'React',
    category: 'frameworks',
    url: 'https://api.iconify.design/logos/react.svg'
  },
  {
    key: 'nextjs',
    name: 'Next.js',
    category: 'frameworks',
    url: 'https://api.iconify.design/logos/nextjs-icon.svg'
  },
  {
    key: 'vue',
    name: 'Vue.js',
    category: 'frameworks',
    url: 'https://api.iconify.design/logos/vue.svg'
  },
  {
    key: 'python',
    name: 'Python',
    category: 'frameworks',
    url: 'https://api.iconify.design/logos/python.svg'
  },
  {
    key: 'nodejs',
    name: 'Node.js',
    category: 'frameworks',
    url: 'https://api.iconify.design/logos/nodejs-icon.svg'
  },
  {
    key: 'typescript',
    name: 'TypeScript',
    category: 'frameworks',
    url: 'https://api.iconify.design/logos/typescript-icon.svg'
  },
  {
    key: 'go',
    name: 'Go',
    category: 'frameworks',
    url: 'https://api.iconify.design/logos/go.svg'
  },
  {
    key: 'rust',
    name: 'Rust',
    category: 'frameworks',
    url: 'https://api.iconify.design/logos/rust.svg'
  },

  // Databases & Messaging
  {
    key: 'postgresql',
    name: 'PostgreSQL',
    category: 'databases',
    url: 'https://api.iconify.design/logos/postgresql.svg'
  },
  {
    key: 'mongodb',
    name: 'MongoDB',
    category: 'databases',
    url: 'https://api.iconify.design/logos/mongodb-icon.svg'
  },
  {
    key: 'redis',
    name: 'Redis',
    category: 'databases',
    url: 'https://api.iconify.design/logos/redis.svg'
  },
  {
    key: 'mysql',
    name: 'MySQL',
    category: 'databases',
    url: 'https://api.iconify.design/logos/mysql-icon.svg'
  },
  {
    key: 'kafka',
    name: 'Apache Kafka',
    category: 'databases',
    url: 'https://api.iconify.design/logos/kafka-icon.svg'
  },
  {
    key: 'sqlite',
    name: 'SQLite',
    category: 'databases',
    url: 'https://api.iconify.design/logos/sqlite.svg'
  },
  {
    key: 'graphql',
    name: 'GraphQL',
    category: 'databases',
    url: 'https://api.iconify.design/logos/graphql.svg'
  },
  {
    key: 'nginx',
    name: 'Nginx',
    category: 'databases',
    url: 'https://api.iconify.design/logos/nginx.svg'
  },

  // System & Architecture Blocks
  {
    key: 'server',
    name: 'Server Node',
    category: 'system',
    url: 'https://api.iconify.design/carbon/server-proxy.svg'
  },
  {
    key: 'cloud-node',
    name: 'Cloud Node',
    category: 'system',
    url: 'https://api.iconify.design/carbon/cloud.svg'
  },
  {
    key: 'security',
    name: 'Auth / Security',
    category: 'system',
    url: 'https://api.iconify.design/carbon/security.svg'
  },
  {
    key: 'network',
    name: 'Network / Gateway',
    category: 'system',
    url: 'https://api.iconify.design/carbon/network-4.svg'
  },
  {
    key: 'notification',
    name: 'Notification Queue',
    category: 'system',
    url: 'https://api.iconify.design/carbon/notification.svg'
  }
];

export function getIconByKey(key: string): IconDefinition | undefined {
  return ICON_CATALOG.find(i => i.key === key);
}

export function resolveIconUrl(element: { iconKey?: string; iconUrl?: string }, theme: 'light' | 'dark' = 'light'): string {
  if (element.iconUrl) return element.iconUrl;
  if (element.iconKey) {
    if (element.iconKey.startsWith('http://') || element.iconKey.startsWith('https://')) {
      return element.iconKey;
    }
    const def = getIconByKey(element.iconKey);
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
