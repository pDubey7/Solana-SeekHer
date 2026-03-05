export const COLORS = {
    // Backgrounds
    background: '#0A0A0F',
    card: '#13131A',
    cardBorder: '#1E1E2E',
    tabBar: '#0D0D14',
    overlay: 'rgba(0,0,0,0.7)',

    // Brand
    purple: '#9945FF', // Solana purple — primary brand
    green: '#14F195', // Solana green — bullish
    red: '#FF4560', // bearish

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#888899',
    textMuted: '#444455',

    // Seeker Score tiers
    scoreBronze: '#CD7F32',
    scoreSilver: '#C0C0C0',
    scoreGold: '#FFD700',
    scoreDiamond: '#14F195',

    // Swipe sentiment
    bullish: '#14F195',
    bearish: '#FF4560',

    // Tags
    tagDefault: '#1E1E2E',
    tagActive: '#9945FF',
    tagRare: '#FFD700',

    // Inputs
    inputBg: '#1A1A24',
    inputBorder: '#2E2E3E',
} as const;

export type ColorKey = keyof typeof COLORS;
