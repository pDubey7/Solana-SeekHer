import type { NFT, Token, SeekerScore, SeekerTier } from '@app-types/index';
import { COLORS } from '@constants/colors';

// ─── Score Calculation ────────────────────────────────────────────────────────

export function calculateSeekerScore(
    walletAgeDays: number,
    nfts: NFT[],
    tokens: Token[],
    streakDays: number,
    txCount: number,
): SeekerScore {
    // Each component has its own cap, total max = 100
    const walletAge = Math.min(walletAgeDays * 0.3, 30);                         // max 30
    const nftScore = Math.min(nfts.length * 5, 20);                              // max 20
    const activityScore = Math.min(txCount * 0.01, 20);                               // max 20
    const communityScore = Math.min(
        tokens.filter((t) => t.isCommunityToken).length * 5,
        20,
    );                                                                                   // max 20
    const streakScore = Math.min(streakDays * 2, 10);                               // max 10

    const total = Math.round(
        walletAge + nftScore + activityScore + communityScore + streakScore,
    );

    return {
        total,
        tier: getTier(total),
        breakdown: {
            walletAge: Math.round(walletAge),
            nftScore: Math.round(nftScore),
            activityScore: Math.round(activityScore),
            communityScore: Math.round(communityScore),
            streakScore: Math.round(streakScore),
        },
    };
}

// ─── Tier Logic ───────────────────────────────────────────────────────────────

function getTier(total: number): SeekerTier {
    if (total >= 80) return 'Diamond';
    if (total >= 60) return 'Gold';
    if (total >= 40) return 'Silver';
    return 'Bronze';
}

// ─── Tier Colour Helper ───────────────────────────────────────────────────────

export function getTierColor(tier: SeekerTier): string {
    switch (tier) {
        case 'Diamond': return COLORS.scoreDiamond;
        case 'Gold': return COLORS.scoreGold;
        case 'Silver': return COLORS.scoreSilver;
        case 'Bronze': return COLORS.scoreBronze;
    }
}
