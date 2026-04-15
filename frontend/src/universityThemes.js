// universityThemes.js
export const UNIVERSITY_THEMES = {
  'gmu.edu': {
    name: 'George Mason University',
    short: 'GMU',
    primary: '#006633',
    secondary: '#FFCC00',
    accent: '#004d26',
    gradient: 'linear-gradient(135deg, #006633 0%, #004d26 60%, #002b15 100%)',
    heroGradient: 'linear-gradient(160deg, rgba(0,102,51,0.93) 0%, rgba(0,40,20,0.97) 100%)',
    badgeBg: 'rgba(255,204,0,0.18)',
    badgeColor: '#FFCC00',
    campusImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&q=80',
    short: 'GMU',
  },
  'vt.edu': {
    name: 'Virginia Tech',
    short: 'VT',
    primary: '#861F41',
    secondary: '#E87722',
    accent: '#5e1530',
    gradient: 'linear-gradient(135deg, #861F41 0%, #5e1530 60%, #3d0d20 100%)',
    heroGradient: 'linear-gradient(160deg, rgba(134,31,65,0.93) 0%, rgba(61,13,32,0.97) 100%)',
    badgeBg: 'rgba(232,119,34,0.18)',
    badgeColor: '#E87722',
    campusImage: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1400&q=80',
  },
  'virginia.edu': {
    name: 'University of Virginia',
    short: 'UVA',
    primary: '#232D4B',
    secondary: '#F84C1E',
    accent: '#1a2238',
    gradient: 'linear-gradient(135deg, #232D4B 0%, #1a2238 60%, #0d1120 100%)',
    heroGradient: 'linear-gradient(160deg, rgba(35,45,75,0.93) 0%, rgba(13,17,32,0.97) 100%)',
    badgeBg: 'rgba(248,76,30,0.18)',
    badgeColor: '#F84C1E',
    campusImage: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1400&q=80',
  },
  'jmu.edu': {
    name: 'James Madison University',
    short: 'JMU',
    primary: '#450084',
    secondary: '#CBB677',
    accent: '#300060',
    gradient: 'linear-gradient(135deg, #450084 0%, #300060 60%, #1a0035 100%)',
    heroGradient: 'linear-gradient(160deg, rgba(69,0,132,0.93) 0%, rgba(26,0,53,0.97) 100%)',
    badgeBg: 'rgba(203,182,119,0.18)',
    badgeColor: '#CBB677',
    campusImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1400&q=80',
  },
  'vcu.edu': {
    name: 'Virginia Commonwealth University',
    short: 'VCU',
    primary: '#1a1a1a',
    secondary: '#F6C22A',
    accent: '#111111',
    gradient: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 60%, #000000 100%)',
    heroGradient: 'linear-gradient(160deg, rgba(30,30,30,0.95) 0%, rgba(0,0,0,0.98) 100%)',
    badgeBg: 'rgba(246,194,42,0.18)',
    badgeColor: '#F6C22A',
    campusImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&q=80',
  },
  'wm.edu': {
    name: 'William & Mary',
    short: 'W&M',
    primary: '#115740',
    secondary: '#B9975B',
    accent: '#0a3d2e',
    gradient: 'linear-gradient(135deg, #115740 0%, #0a3d2e 60%, #05201a 100%)',
    heroGradient: 'linear-gradient(160deg, rgba(17,87,64,0.93) 0%, rgba(5,32,26,0.97) 100%)',
    badgeBg: 'rgba(185,151,91,0.18)',
    badgeColor: '#B9975B',
    campusImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1400&q=80',
  },
  'odu.edu': {
    name: 'Old Dominion University',
    short: 'ODU',
    primary: '#003057',
    secondary: '#7BAFD4',
    accent: '#00203d',
    gradient: 'linear-gradient(135deg, #003057 0%, #00203d 60%, #001020 100%)',
    heroGradient: 'linear-gradient(160deg, rgba(0,48,87,0.93) 0%, rgba(0,16,32,0.97) 100%)',
    badgeBg: 'rgba(123,175,212,0.18)',
    badgeColor: '#7BAFD4',
    campusImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=80',
  },
};

export const DEFAULT_THEME = {
  name: 'Campus Buddy',
  short: 'CB',
  primary: '#2e5fa3',
  secondary: '#64b5f6',
  accent: '#1a3a6b',
  gradient: 'linear-gradient(135deg, #2e5fa3 0%, #1a3a6b 60%, #0d1f3c 100%)',
  heroGradient: 'linear-gradient(160deg, rgba(46,95,163,0.93) 0%, rgba(13,31,60,0.97) 100%)',
  badgeBg: 'rgba(100,181,246,0.18)',
  badgeColor: '#64b5f6',
  campusImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&q=80',
};

export function getThemeFromEmail(email) {
  if (!email || !email.includes('@')) return DEFAULT_THEME;
  const domain = email.split('@')[1]?.toLowerCase();
  return UNIVERSITY_THEMES[domain] || DEFAULT_THEME;
}

export function getThemeFromDomain(domain) {
  return UNIVERSITY_THEMES[domain] || DEFAULT_THEME;
}
