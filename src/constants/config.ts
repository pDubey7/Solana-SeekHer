export const APP_NAME = 'SeekHer';
export const APP_TAGLINE = 'Your wallet. Your vibe. Your people.';

// ─── API / RPC ─────────────────────────────────────────────────────────────
export const HELIUS_API_KEY = process.env.HELIUS_API_KEY ?? '';
export const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL ?? 'https://mainnet.helius-rpc.com/?api-key=';
export const SOLANA_MAINNET_RPC = process.env.SOLANA_MAINNET_RPC ?? 'https://mainnet.helius-rpc.com/?api-key=';
export const SOLANA_DEVNET_RPC = process.env.SOLANA_DEVNET_RPC ?? 'https://api.devnet.solana.com';
export const SOLANA_NETWORK = (process.env.SOLANA_NETWORK ?? 'mainnet-beta') as 'mainnet-beta' | 'devnet';
export const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL ?? '';

// ─── Cloudinary ───────────────────────────────────────────────────────────
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? '';

// ─── Solana ───────────────────────────────────────────────────────────────
export const SOLANA_COMMITMENT: 'confirmed' = 'confirmed';

/** Cost in SOL to send the first message in a match (anti-spam) */
export const FIRST_MESSAGE_SOL_COST = 0.001;

// ─── Scoring ──────────────────────────────────────────────────────────────
export const SEEKER_SCORE_MAX = 100;

// ─── Feed ─────────────────────────────────────────────────────────────────
export const SWIPE_FEED_LIMIT = 20;

// ─── Profile ──────────────────────────────────────────────────────────────
export const MAX_PHOTOS = 4;
export const MAX_VIBE_TAGS = 8;
export const MAX_LOOKING_FOR = 4;

// ─── Community tokens recognised for matching bonus ───────────────────────
export const COMMUNITY_TOKENS = ['BONK', 'WIF', 'JUP', 'PYTH', 'MNDE'] as const;
export type CommunityToken = typeof COMMUNITY_TOKENS[number];

// ─── Vibe Tags ────────────────────────────────────────────────────────────
/** Tags held by fewer than this fraction of users are considered "rare" */
export const RARE_TAG_THRESHOLD = 0.05;

// ─── Realtime ─────────────────────────────────────────────────────────────
/** Interval in ms for polling new messages */
export const MESSAGE_POLL_INTERVAL = 3000;
