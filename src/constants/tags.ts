export type TagCategory = 'Niches' | 'Roles' | 'Community' | 'Vibe';

export interface VibeTag {
    id: string;
    label: string;
    category: TagCategory;
    isRare: boolean;
}

// ─── Tag Definitions ──────────────────────────────────────────────────────

const niches: VibeTag[] = [
    { id: 'defi', label: '#DeFi', category: 'Niches', isRare: false },
    { id: 'nfts', label: '#NFTs', category: 'Niches', isRare: false },
    { id: 'gaming', label: '#Gaming', category: 'Niches', isRare: false },
    { id: 'daos', label: '#DAOs', category: 'Niches', isRare: false },
    { id: 'devrel', label: '#DevRel', category: 'Niches', isRare: false },
    { id: 'memecoins', label: '#Memecoins', category: 'Niches', isRare: false },
    { id: 'privacy', label: '#Privacy', category: 'Niches', isRare: false },
    { id: 'predictionmarkets', label: '#PredictionMarkets', category: 'Niches', isRare: false },
    { id: 'ai', label: '#AI', category: 'Niches', isRare: false },
    { id: 'aiagents', label: '#AIAgents', category: 'Niches', isRare: false },
    { id: 'depin', label: '#DePIN', category: 'Niches', isRare: false },
    { id: 'rwa', label: '#RWA', category: 'Niches', isRare: false },
    { id: 'stablecoins', label: '#Stablecoins', category: 'Niches', isRare: false },
    { id: 'restaking', label: '#Restaking', category: 'Niches', isRare: false },
    { id: 'socialfi', label: '#SocialFi', category: 'Niches', isRare: false },
];

const roles: VibeTag[] = [
    { id: 'founder', label: '#Founder', category: 'Roles', isRare: false },
    { id: 'developer', label: '#Developer', category: 'Roles', isRare: false },
    { id: 'designer', label: '#Designer', category: 'Roles', isRare: false },
    { id: 'investor', label: '#Investor', category: 'Roles', isRare: false },
    { id: 'trader', label: '#Trader', category: 'Roles', isRare: false },
    { id: 'contentcreator', label: '#ContentCreator', category: 'Roles', isRare: false },
    { id: 'communitybuilder', label: '#CommunityBuilder', category: 'Roles', isRare: false },
    { id: 'researcher', label: '#Researcher', category: 'Roles', isRare: false },
];

const community: VibeTag[] = [
    { id: 'superteam', label: '#Superteam', category: 'Community', isRare: false },
    { id: 'solana', label: '#Solana', category: 'Community', isRare: false },
    { id: 'seekher', label: '#SeekHer', category: 'Community', isRare: false },
    { id: 'hacker', label: '#Hacker', category: 'Community', isRare: false },
    { id: 'shipper', label: '#Shipper', category: 'Community', isRare: false },
];

const vibe: VibeTag[] = [
    { id: 'longtermbuilder', label: '#LongTermBuilder', category: 'Vibe', isRare: false },
    { id: 'justheretolearn', label: '#JustHereToLearn', category: 'Vibe', isRare: false },
    { id: 'alwaysonline', label: '#AlwaysOnline', category: 'Vibe', isRare: false },
    { id: 'irl', label: '#IRL', category: 'Vibe', isRare: false },
    { id: 'opentocollabs', label: '#OpenToCollabs', category: 'Vibe', isRare: false },
    { id: 'newtoweb3', label: '#NewToWeb3', category: 'Vibe', isRare: false },
    { id: 'og', label: '#OG', category: 'Vibe', isRare: false },
];

// ─── Structured export ────────────────────────────────────────────────────

export const VIBE_TAGS: Record<TagCategory, VibeTag[]> = {
    Niches: niches,
    Roles: roles,
    Community: community,
    Vibe: vibe,
};

/** Flat array for easy searching / rendering */
export const VIBE_TAGS_FLAT: VibeTag[] = [
    ...niches,
    ...roles,
    ...community,
    ...vibe,
];

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Given a user's selected tag ids and a map of tagId → holder count across
 * all users, returns the user's tags with `isRare` set to true for tags held
 * by fewer than RARE_TAG_THRESHOLD (5%) of the total user base.
 *
 * @param userTagIds     - Tag ids selected by the current user
 * @param tagCounts      - Map of tagId → number of users with that tag
 * @param totalUserCount - Total number of registered users
 */
export function getRareTags(
    userTagIds: string[],
    tagCounts: Record<string, number>,
    totalUserCount: number,
): VibeTag[] {
    const RARE_THRESHOLD = 0.05;
    return userTagIds.map(id => {
        const base = VIBE_TAGS_FLAT.find(t => t.id === id);
        if (!base) return { id, label: `#${id}`, category: 'Vibe' as TagCategory, isRare: false };
        const holders = tagCounts[id] ?? 0;
        const isRare = totalUserCount > 0 && holders / totalUserCount < RARE_THRESHOLD;
        return { ...base, isRare };
    });
}
