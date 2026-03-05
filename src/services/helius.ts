import type { NFT, Token } from '@app-types/index';
import { COMMUNITY_TOKENS } from '@constants/config';

const API_KEY = process.env.HELIUS_API_KEY ?? '';
const BASE_URL = 'https://api.helius.xyz/v0';

// ─── NFTs ─────────────────────────────────────────────────────────────────────

export async function fetchWalletNFTs(wallet: string): Promise<NFT[]> {
    const url = `${BASE_URL}/addresses/${wallet}/nfts?api-key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data: unknown[] = await res.json();
    return (data as Array<Record<string, unknown>>).map((item) => {
        const content = (item.content as Record<string, unknown>) ?? {};
        const metadata = (content.metadata as Record<string, unknown>) ?? {};
        const links = (content.links as Record<string, unknown>) ?? {};
        const grouping = (item.grouping as Array<Record<string, unknown>>) ?? [];

        const collection = grouping.find((g) => g.group_key === 'collection')?.group_value ?? '';
        const verified = Boolean((item.creators as Array<Record<string, unknown>>)?.some((c) => c.verified));

        return {
            mint: String(item.id ?? ''),
            name: String(metadata.name ?? ''),
            image: String(links.image ?? ''),
            collection: String(collection),
            verified,
        } satisfies NFT;
    });
}

// ─── Token Balances ───────────────────────────────────────────────────────────

export async function fetchWalletTokens(wallet: string): Promise<Token[]> {
    const url = `${BASE_URL}/addresses/${wallet}/balances?api-key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = (await res.json()) as { tokens?: Array<Record<string, unknown>> };
    const tokens = data.tokens ?? [];

    return tokens
        .filter((t) => Number(t.amount) > 0)
        .map((t) => {
            const symbol = String(t.symbol ?? '');
            return {
                mint: String(t.mint ?? ''),
                symbol,
                amount: Number(t.amount ?? 0),
                usdValue: t.usdValue != null ? Number(t.usdValue) : undefined,
                isCommunityToken: (COMMUNITY_TOKENS as readonly string[]).includes(symbol),
            } satisfies Token;
        });
}

// ─── Wallet Age ───────────────────────────────────────────────────────────────

export async function fetchWalletAge(wallet: string): Promise<number> {
    const url = `${BASE_URL}/addresses/${wallet}/transactions?api-key=${API_KEY}&limit=1&type=TRANSFER`;
    const res = await fetch(url);
    if (!res.ok) return 0;

    const data = (await res.json()) as Array<Record<string, unknown>>;
    if (!data || data.length === 0) return 0;

    const oldest = data[data.length - 1];
    const ts = Number(oldest.timestamp ?? 0) * 1000;
    if (!ts) return 0;

    const daysDiff = (Date.now() - ts) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.floor(daysDiff));
}

// ─── Transaction Count ────────────────────────────────────────────────────────

export async function fetchTransactionCount(wallet: string): Promise<number> {
    const url = `${BASE_URL}/addresses/${wallet}/transactions?api-key=${API_KEY}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return 0;

    // Helius doesn't expose a raw tx count endpoint — use pagination header if available,
    // otherwise fall back to fetching 1 item and reading x-total-count.
    const total = res.headers.get('x-total-count');
    if (total) return Number(total);

    // Fallback: return conservative estimate based on what we receive
    const data = (await res.json()) as unknown[];
    return data.length;
}

// ─── Aggregated Profile Data ──────────────────────────────────────────────────

export async function fetchWalletData(wallet: string): Promise<{
    nfts: NFT[];
    tokens: Token[];
    walletAgeDays: number;
    txCount: number;
}> {
    const [nfts, tokens, walletAgeDays, txCount] = await Promise.all([
        fetchWalletNFTs(wallet),
        fetchWalletTokens(wallet),
        fetchWalletAge(wallet),
        fetchTransactionCount(wallet),
    ]);
    return { nfts, tokens, walletAgeDays, txCount };
}
