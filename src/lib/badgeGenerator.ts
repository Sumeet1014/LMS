// Programmatic SVG badge generator - NO paid API calls
export type BadgeIconName = 'trophy' | 'star' | 'book' | 'lightbulb' | 'handshake' | 
  'shield' | 'rocket' | 'medal' | 'ribbon' | 'crown';

const BADGE_COLORS = {
  trophy: '#FFD700',
  star: '#FFA500',
  book: '#4169E1',
  lightbulb: '#FFFF00',
  handshake: '#32CD32',
  shield: '#DC143C',
  rocket: '#9370DB',
  medal: '#FFD700',
  ribbon: '#FF69B4',
  crown: '#FF6347'
};

export function generateBadgeSVG(iconName: BadgeIconName, size = 100): string {
  const color = BADGE_COLORS[iconName];
  
  const icons = {
    trophy: `<circle cx="50" cy="60" r="20" fill="${color}"/>
      <rect x="40" y="75" width="20" height="15" fill="${color}"/>
      <rect x="35" y="85" width="30" height="5" fill="${color}"/>
      <path d="M 35 45 L 30 55 L 35 60" fill="${color}"/>
      <path d="M 65 45 L 70 55 L 65 60" fill="${color}"/>`,
    
    star: `<polygon points="50,15 61,40 88,40 66,58 75,85 50,68 25,85 34,58 12,40 39,40" fill="${color}"/>`,
    
    book: `<rect x="25" y="20" width="50" height="60" rx="3" fill="${color}"/>
      <line x1="50" y1="20" x2="50" y2="80" stroke="#fff" stroke-width="2"/>
      <line x1="35" y1="35" x2="45" y2="35" stroke="#fff" stroke-width="1"/>
      <line x1="55" y1="35" x2="65" y2="35" stroke="#fff" stroke-width="1"/>`,
    
    lightbulb: `<circle cx="50" cy="40" r="18" fill="${color}"/>
      <rect x="45" y="55" width="10" height="15" rx="2" fill="${color}"/>
      <rect x="42" y="68" width="16" height="4" fill="${color}"/>
      <path d="M 50 15 L 50 25" stroke="${color}" stroke-width="2"/>
      <path d="M 70 25 L 65 30" stroke="${color}" stroke-width="2"/>
      <path d="M 30 25 L 35 30" stroke="${color}" stroke-width="2"/>`,
    
    handshake: `<ellipse cx="35" cy="50" rx="12" ry="15" fill="${color}"/>
      <ellipse cx="65" cy="50" rx="12" ry="15" fill="${color}"/>
      <rect x="40" y="45" width="20" height="10" fill="${color}"/>`,
    
    shield: `<path d="M 50 15 L 20 30 L 20 55 Q 20 75 50 85 Q 80 75 80 55 L 80 30 Z" fill="${color}"/>
      <path d="M 50 25 L 30 35 L 30 55 Q 30 68 50 75 Q 70 68 70 55 L 70 35 Z" fill="#fff" opacity="0.3"/>`,
    
    rocket: `<path d="M 50 15 L 40 40 L 35 70 L 50 65 L 65 70 L 60 40 Z" fill="${color}"/>
      <ellipse cx="50" cy="45" rx="8" ry="12" fill="#fff" opacity="0.5"/>
      <path d="M 38 70 L 35 85 L 40 75 Z" fill="#FF4500"/>
      <path d="M 62 70 L 65 85 L 60 75 Z" fill="#FF4500"/>`,
    
    medal: `<circle cx="50" cy="55" r="22" fill="${color}"/>
      <path d="M 35 25 L 40 55 L 45 25 Z" fill="${color}"/>
      <path d="M 65 25 L 60 55 L 55 25 Z" fill="${color}"/>
      <circle cx="50" cy="55" r="15" fill="#fff" opacity="0.3"/>
      <text x="50" y="62" font-size="16" text-anchor="middle" fill="#000" font-weight="bold">1</text>`,
    
    ribbon: `<path d="M 30 30 Q 50 20 70 30 L 70 50 Q 50 60 30 50 Z" fill="${color}"/>
      <path d="M 30 50 L 25 75 L 35 65 L 30 50 Z" fill="${color}"/>
      <path d="M 70 50 L 75 75 L 65 65 L 70 50 Z" fill="${color}"/>`,
    
    crown: `<path d="M 20 60 L 25 40 L 35 50 L 50 30 L 65 50 L 75 40 L 80 60 Z" fill="${color}"/>
      <rect x="20" y="60" width="60" height="8" fill="${color}"/>
      <circle cx="25" cy="40" r="3" fill="#fff"/>
      <circle cx="50" cy="30" r="3" fill="#fff"/>
      <circle cx="75" cy="40" r="3" fill="#fff"/>`
  };

  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
    ${icons[iconName]}
  </svg>`;
}

export function getBadgeDataUrl(iconName: BadgeIconName): string {
  const svg = generateBadgeSVG(iconName);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}