// ─── Primitive Unions ────────────────────────────────────────────────────────

export type LookingFor =
    | 'Romance'
    | 'Co-founder'
    | 'Trading Buddy'
    | 'IRL Meetup'
    | 'Friends'
    | 'Mentor'
    | 'Just Vibing'
    | 'Accountability Partner'
    | 'Collab & Build'
    | 'Someone to Talk To';

export type SwipeDirection = 'bullish' | 'bearish';

export type SeekerTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

export type SwipeFeedFilter =
    | 'All'
    | 'Romance'
    | 'Friends'
    | 'Builders'
    | 'Mentors'
    | 'Traders';

// ─── Vibe Tags ────────────────────────────────────────────────────────────────

export interface VibeTag {
    id: string;
    label: string;
    category: 'Niches' | 'Roles' | 'Community' | 'Vibe';
    isRare: boolean;
}

// ─── On-Chain Assets ──────────────────────────────────────────────────────────

export interface NFT {
    mint: string;
    name: string;
    image: string;
    collection: string;
    verified: boolean;
}

export interface Token {
    mint: string;
    symbol: string;
    amount: number;
    usdValue?: number;
    isCommunityToken: boolean;
}

// ─── Seeker Score ─────────────────────────────────────────────────────────────

export interface SeekerScore {
    total: number;
    tier: SeekerTier;
    breakdown: {
        walletAge: number;
        nftScore: number;
        activityScore: number;
        communityScore: number;
        streakScore: number;
    };
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    wallet_address: string;
    display_name: string;
    age: number;
    bio: string;
    photos: string[];
    country: string;
    looking_for: LookingFor[];
    vibe_tags: string[];
    pinned_nfts: NFT[];
    tokens: Token[];
    seeker_score: number;
    streak_days: number;
    last_active: string;
    created_at: string;
}

// ─── Matching ─────────────────────────────────────────────────────────────────

export interface CompatibilityResult {
    score: number;
    reasons: string[];
    shared_nfts: NFT[];
    shared_tokens: Token[];
    shared_tags: string[];
}

export interface Match {
    id: string;
    matched_user: User;
    compatibility_score: number;
    shared_nfts: NFT[];
    shared_tokens: Token[];
    shared_tags: string[];
    soulbound_mint?: string;
    mode: LookingFor;
    created_at: string;
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export interface Message {
    id: string;
    match_id: string;
    sender: string;   // wallet address
    content: string;
    sol_tip: number;
    tx_signature?: string;
    is_first_message: boolean;
    created_at: string;
}

// ─── Events ───────────────────────────────────────────────────────────────────

export interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    country: string;
    event_date: string;
    required_token?: string;
    required_nft_collection?: string;
    organizer_wallet: string;
    attendee_count: number;
    seekher_matches_attending: number;
}
