import { neon } from '@neondatabase/serverless';
import type {
    User,
    NFT,
    Token,
    Match,
    Message,
    LookingFor,
    SwipeDirection,
    SwipeFeedFilter,
} from '@app-types/index';

const sql = neon(process.env.NEON_DATABASE_URL ?? '');

// ─── User ─────────────────────────────────────────────────────────────────────

export async function createUser(wallet: string): Promise<User> {
    await sql`
    INSERT INTO users (wallet_address)
    VALUES (${wallet})
    ON CONFLICT (wallet_address) DO NOTHING
  `;
    const rows = await sql`
    SELECT * FROM users WHERE wallet_address = ${wallet}
  `;
    return rows[0] as User;
}

export async function getUser(wallet: string): Promise<User | null> {
    const rows = await sql`
    SELECT * FROM users WHERE wallet_address = ${wallet}
  `;
    return rows.length > 0 ? (rows[0] as User) : null;
}

export async function updateUser(
    wallet: string,
    updates: Partial<User>,
): Promise<User> {
    const rows = await sql`
    UPDATE users SET
      display_name  = COALESCE(${updates.display_name ?? null}, display_name),
      age           = COALESCE(${updates.age ?? null}, age),
      bio           = COALESCE(${updates.bio ?? null}, bio),
      photos        = COALESCE(${updates.photos ? JSON.stringify(updates.photos) : null}::jsonb, photos),
      country       = COALESCE(${updates.country ?? null}, country),
      looking_for   = COALESCE(${updates.looking_for ? JSON.stringify(updates.looking_for) : null}::jsonb, looking_for),
      vibe_tags     = COALESCE(${updates.vibe_tags ? JSON.stringify(updates.vibe_tags) : null}::jsonb, vibe_tags),
      pinned_nfts   = COALESCE(${updates.pinned_nfts ? JSON.stringify(updates.pinned_nfts) : null}::jsonb, pinned_nfts),
      tokens        = COALESCE(${updates.tokens ? JSON.stringify(updates.tokens) : null}::jsonb, tokens),
      seeker_score  = COALESCE(${updates.seeker_score ?? null}, seeker_score),
      streak_days   = COALESCE(${updates.streak_days ?? null}, streak_days),
      last_active   = NOW()
    WHERE wallet_address = ${wallet}
    RETURNING *
  `;
    return rows[0] as User;
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export async function getFeedProfiles(
    wallet: string,
    filter?: SwipeFeedFilter,
    country?: string,
): Promise<User[]> {
    const filterMode = filter && filter !== 'All' ? filter : null;
    const countryFilter = country ?? null;

    const rows = await sql`
    SELECT u.*
    FROM users u
    WHERE u.wallet_address != ${wallet}
      AND u.wallet_address NOT IN (
        SELECT swiped_wallet FROM swipes WHERE swiper_wallet = ${wallet}
      )
      AND (${filterMode}::text IS NULL
           OR u.looking_for::text ILIKE ${'%' + (filterMode ?? '') + '%'})
      AND (${countryFilter}::text IS NULL OR u.country = ${countryFilter})
    ORDER BY u.seeker_score DESC, u.last_active DESC
    LIMIT 20
  `;
    return rows as User[];
}

// ─── Swipes ───────────────────────────────────────────────────────────────────

export async function recordSwipe(
    swiper: string,
    swiped: string,
    direction: SwipeDirection,
): Promise<'match' | 'swiped'> {
    await sql`
    INSERT INTO swipes (swiper_wallet, swiped_wallet, direction)
    VALUES (${swiper}, ${swiped}, ${direction})
    ON CONFLICT (swiper_wallet, swiped_wallet) DO UPDATE SET direction = ${direction}
  `;

    if (direction === 'bullish') {
        const mutual = await sql`
      SELECT 1 FROM swipes
      WHERE swiper_wallet = ${swiped}
        AND swiped_wallet = ${swiper}
        AND direction = 'bullish'
    `;
        if (mutual.length > 0) return 'match';
    }

    return 'swiped';
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function createMatch(
    user1: string,
    user2: string,
    compatibilityScore: number,
    sharedNfts: NFT[],
    sharedTokens: Token[],
    sharedTags: string[],
    mode: LookingFor,
): Promise<Match> {
    const rows = await sql`
    INSERT INTO matches (
      user1_wallet, user2_wallet, compatibility_score,
      shared_nfts, shared_tokens, shared_tags, mode
    ) VALUES (
      ${user1}, ${user2}, ${compatibilityScore},
      ${JSON.stringify(sharedNfts)}::jsonb,
      ${JSON.stringify(sharedTokens)}::jsonb,
      ${JSON.stringify(sharedTags)}::jsonb,
      ${mode}
    )
    RETURNING *
  `;
    return rows[0] as Match;
}

export async function getMatches(wallet: string): Promise<Match[]> {
    const rows = await sql`
    SELECT
      m.*,
      to_json(u.*) AS matched_user
    FROM matches m
    JOIN users u
      ON u.wallet_address = CASE
        WHEN m.user1_wallet = ${wallet} THEN m.user2_wallet
        ELSE m.user1_wallet
      END
    WHERE m.user1_wallet = ${wallet} OR m.user2_wallet = ${wallet}
    ORDER BY m.created_at DESC
  `;
    return rows as Match[];
}

export async function updateSoulboundMint(
    matchId: string,
    mintAddress: string,
): Promise<void> {
    await sql`
    UPDATE matches SET soulbound_mint = ${mintAddress}
    WHERE id = ${matchId}
  `;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getMessages(matchId: string): Promise<Message[]> {
    const rows = await sql`
    SELECT * FROM messages
    WHERE match_id = ${matchId}
    ORDER BY created_at ASC
  `;
    return rows as Message[];
}

export async function sendMessage(
    matchId: string,
    sender: string,
    content: string,
    isFirstMessage: boolean,
    solTip = 0,
    txSignature?: string,
): Promise<Message> {
    const rows = await sql`
    INSERT INTO messages (
      match_id, sender, content, is_first_message,
      sol_tip, tx_signature
    ) VALUES (
      ${matchId}, ${sender}, ${content}, ${isFirstMessage},
      ${solTip}, ${txSignature ?? null}
    )
    RETURNING *
  `;
    return rows[0] as Message;
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export async function updateStreak(wallet: string): Promise<number> {
    const rows = await sql`
    SELECT last_active, streak_days FROM users WHERE wallet_address = ${wallet}
  `;
    if (rows.length === 0) return 0;

    const lastActive = new Date(rows[0].last_active as string);
    const now = new Date();
    const hoursElapsed = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    let newStreak: number = rows[0].streak_days as number;

    if (hoursElapsed >= 20 && hoursElapsed <= 48) {
        newStreak = newStreak + 1;
    } else if (hoursElapsed > 48) {
        newStreak = 1;
    }
    // < 20 hours: no change

    await sql`
    UPDATE users
    SET streak_days = ${newStreak}, last_active = NOW()
    WHERE wallet_address = ${wallet}
  `;

    return newStreak;
}

// ─── Score ────────────────────────────────────────────────────────────────────

export async function updateSeekerScore(
    wallet: string,
    score: number,
): Promise<void> {
    await sql`
    UPDATE users SET seeker_score = ${score} WHERE wallet_address = ${wallet}
  `;
}

// ─── Notifications / Badges ───────────────────────────────────────────────────

export async function getUnreadMatchCount(wallet: string): Promise<number> {
    const rows = await sql`
    SELECT COUNT(*) AS count
    FROM matches m
    WHERE (m.user1_wallet = ${wallet} OR m.user2_wallet = ${wallet})
      AND NOT EXISTS (
        SELECT 1 FROM messages msg
        WHERE msg.match_id = m.id
          AND msg.sender = ${wallet}
      )
  `;
    return Number(rows[0].count);
}
