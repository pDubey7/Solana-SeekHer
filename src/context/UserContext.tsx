import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import type { User, SeekerScore } from '@app-types/index';
import {
    createUser,
    getUser,
    updateUser,
    updateSeekerScore as saveScore,
} from '@services/neon';
import { fetchWalletData } from '@services/helius';
import { calculateSeekerScore } from '@utils/seekerScore';
import { useWallet } from '@context/WalletContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserContextValue {
    user: User | null;
    loading: boolean;
    seekerScore: SeekerScore | null;
    hasCompletedProfile: boolean;
    refreshUser: () => Promise<void>;
    updateUserProfile: (updates: Partial<User>) => Promise<void>;
    refreshSeekerScore: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { walletAddress } = useWallet();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [seekerScore, setSeekerScore] = useState<SeekerScore | null>(null);

    // ── Load / bootstrap profile when wallet becomes available ──────────────────
    useEffect(() => {
        if (!walletAddress) {
            setUser(null);
            setSeekerScore(null);
            return;
        }
        void bootstrapUser(walletAddress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress]);

    const bootstrapUser = useCallback(async (wallet: string) => {
        setLoading(true);
        try {
            // 1. Ensure user row exists
            await createUser(wallet);

            // 2. Load full DB profile
            const dbUser = await getUser(wallet);
            setUser(dbUser);

            // 3. Fetch on-chain data in parallel
            const { nfts, tokens, walletAgeDays, txCount } = await fetchWalletData(wallet);

            // 4. Calculate Seeker Score
            const score = calculateSeekerScore(
                walletAgeDays,
                nfts,
                tokens,
                dbUser?.streak_days ?? 0,
                txCount,
            );
            setSeekerScore(score);

            // 5. Persist score to DB
            await saveScore(wallet, score.total);

            // 6. Refresh user after score is saved
            const refreshed = await getUser(wallet);
            setUser(refreshed);
        } catch (err) {
            console.error('[UserContext] bootstrapUser error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── refreshUser ─────────────────────────────────────────────────────────────
    const refreshUser = useCallback(async () => {
        if (!walletAddress) return;
        const fresh = await getUser(walletAddress);
        setUser(fresh);
    }, [walletAddress]);

    // ── updateUserProfile ────────────────────────────────────────────────────────
    const updateUserProfile = useCallback(async (updates: Partial<User>) => {
        if (!walletAddress) return;
        await updateUser(walletAddress, updates);
        await refreshUser();
    }, [walletAddress, refreshUser]);

    // ── refreshSeekerScore ───────────────────────────────────────────────────────
    const refreshSeekerScore = useCallback(async () => {
        if (!walletAddress) return;
        const { nfts, tokens, walletAgeDays, txCount } = await fetchWalletData(walletAddress);
        const score = calculateSeekerScore(
            walletAgeDays,
            nfts,
            tokens,
            user?.streak_days ?? 0,
            txCount,
        );
        setSeekerScore(score);
        await saveScore(walletAddress, score.total);
    }, [walletAddress, user?.streak_days]);

    // ── Derived ──────────────────────────────────────────────────────────────────
    const hasCompletedProfile = Boolean(user?.display_name);

    const value = useMemo<UserContextValue>(() => ({
        user,
        loading,
        seekerScore,
        hasCompletedProfile,
        refreshUser,
        updateUserProfile,
        refreshSeekerScore,
    }), [user, loading, seekerScore, hasCompletedProfile, refreshUser, updateUserProfile, refreshSeekerScore]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUser(): UserContextValue {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
}
