import type { User, NFT, Token, CompatibilityResult } from '@app-types/index';

export function calculateCompatibility(
    userA: User,
    userB: User,
): CompatibilityResult {
    let score = 0;
    const reasons: string[] = [];

    // ── Shared NFT collections (+20 each, max 40) ─────────────────────────────
    const collectionsA = new Map<string, NFT>(
        userA.pinned_nfts.map((n) => [n.collection, n]),
    );
    const sharedNfts: NFT[] = [];

    for (const nft of userB.pinned_nfts) {
        if (nft.collection && collectionsA.has(nft.collection)) {
            sharedNfts.push(nft);
            if (score < 40) {
                score += 20;
                reasons.push(`You both hold ${nft.collection} 🤝`);
            }
        }
    }
    score = Math.min(score, 40);

    // ── Shared tokens by symbol (+10 each, max 30) ────────────────────────────
    const symbolsA = new Map<string, Token>(
        userA.tokens.map((t) => [t.symbol, t]),
    );
    const sharedTokens: Token[] = [];
    let tokenPoints = 0;

    for (const token of userB.tokens) {
        if (token.symbol && symbolsA.has(token.symbol)) {
            sharedTokens.push(token);
            if (tokenPoints < 30) {
                tokenPoints += 10;
                reasons.push(`Both hodling $${token.symbol} 💰`);
            }
        }
    }
    score += Math.min(tokenPoints, 30);

    // ── Same country (+30) ────────────────────────────────────────────────────
    if (
        userA.country &&
        userB.country &&
        userA.country.trim().toLowerCase() === userB.country.trim().toLowerCase()
    ) {
        score += 30;
        reasons.push(`Both from ${userA.country} 🌍`);
    }

    // ── Shared looking_for modes (+15 each, max 30) ───────────────────────────
    const modesA = new Set(userA.looking_for);
    let modePoints = 0;

    for (const mode of userB.looking_for) {
        if (modesA.has(mode) && modePoints < 30) {
            modePoints += 15;
            reasons.push(`Both looking for ${mode}`);
        }
    }
    score += Math.min(modePoints, 30);

    // ── Shared vibe tags (+5 each, max 25) ───────────────────────────────────
    const tagsA = new Set(userA.vibe_tags);
    const sharedTags: string[] = [];
    let tagPoints = 0;

    for (const tag of userB.vibe_tags) {
        if (tagsA.has(tag)) {
            sharedTags.push(tag);
            if (tagPoints < 25) {
                tagPoints += 5;
                reasons.push(`Both tagged #${tag}`);
            }
        }
    }
    score += Math.min(tagPoints, 25);

    // ── Normalise to 100 ─────────────────────────────────────────────────────
    // Max theoretical: 40 + 30 + 30 + 30 + 25 = 155
    const MAX_RAW = 155;
    const normalised = Math.round(Math.min((score / MAX_RAW) * 100, 100));

    return {
        score: normalised,
        reasons,
        shared_nfts: sharedNfts,
        shared_tokens: sharedTokens,
        shared_tags: sharedTags,
    };
}
