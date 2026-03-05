import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import { useWallet } from '@context/WalletContext';
import { useUser } from '@context/UserContext';
import { getFeedProfiles, recordSwipe } from '@services/neon';
import { calculateCompatibility } from '@utils/compatibility';
import { useAppNavigation } from '@navigation/types';
import SwipeCard from '@components/SwipeCard';
import type { User, SwipeFeedFilter } from '@app-types/index';
import { COLORS } from '@constants/colors';

const { width: W } = Dimensions.get('window');

const FILTERS: SwipeFeedFilter[] = ['All', 'Romance', 'Friends', 'Builders', 'Mentors', 'Traders'];
const FILTER_LABELS: Record<string, string> = {
    All: 'All', Romance: '💜 Romance', Friends: '👋 Friends',
    Builders: '🤝 Builders', Mentors: '🧠 Mentors', Traders: '📈 Traders',
};

// ─── Placeholder Card (Shimmer) ───────────────────────────────────────────────

function ShimmerCard() {
    const op = useSharedValue(0.4);
    useEffect(() => {
        op.value = withSequence(
            withTiming(1, { duration: 800 }),
            withTiming(0.4, { duration: 800 }),
        );
    }, [op]);
    const style = useAnimatedStyle(() => ({ opacity: op.value }));
    return (
        <Animated.View style={[styles.card, { backgroundColor: COLORS.card }, style]} />
    );
}

// ─── Action Button ────────────────────────────────────────────────────────────

function ActionBtn({
    icon, color, onPress,
}: { icon: string; color: string; onPress: () => void }) {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const handlePress = () => {
        scale.value = withSequence(withSpring(0.85), withSpring(1));
        onPress();
    };
    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={1}>
            <Animated.View style={[styles.actionBtn, { borderColor: color }, style]}>
                <Text style={styles.actionIcon}>{icon}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onRefresh, refreshing }: { onRefresh: () => void; refreshing: boolean }) {
    const [countdown, setCountdown] = useState('');
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setUTCHours(24, 0, 0, 0);
            const diff = midnight.getTime() - now.getTime();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setCountdown(`${h}h ${m}m ${s}s`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔥</Text>
            <Text style={styles.emptyTitle}>You've seen everyone nearby</Text>
            <Text style={styles.emptySub}>New people join daily — check back tomorrow</Text>
            <View style={styles.countdownBox}>
                <Text style={styles.countdownLabel}>Market Open in</Text>
                <Text style={styles.countdown}>{countdown}</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} disabled={refreshing}>
                <Text style={styles.refreshBtnText}>{refreshing ? 'Checking...' : '↺ Check Now'}</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SwipeScreen() {
    const nav = useAppNavigation();
    const { walletAddress } = useWallet();
    const { user } = useUser();
    const [profiles, setProfiles] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<SwipeFeedFilter>('All');

    const loadFeed = useCallback(async () => {
        if (!walletAddress) return;
        try {
            const feed = await getFeedProfiles(walletAddress, filter);
            setProfiles(feed);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [walletAddress, filter]);

    useEffect(() => { setLoading(true); void loadFeed(); }, [loadFeed]);

    const handleSwipe = useCallback(async (direction: 'bullish' | 'bearish', swiped: User) => {
        if (!walletAddress || !user) return;
        const result = await recordSwipe(walletAddress, swiped.wallet_address, direction);
        setProfiles(prev => prev.filter(p => p.wallet_address !== swiped.wallet_address));
        // Preload when < 3 remain
        if (profiles.length < 4) void loadFeed();

        if (result === 'match' && direction === 'bullish') {
            const compat = calculateCompatibility(user, swiped);
            nav.navigate('MatchCelebration', {
                matchId: `${walletAddress}_${swiped.wallet_address}`,
                matchedUser: swiped,
                compatibilityScore: compat.score,
                sharedNfts: compat.shared_nfts,
                sharedTokens: compat.shared_tokens,
                sharedTags: compat.shared_tags,
                mode: user.looking_for[0] ?? 'Just Vibing',
            });
        }
    }, [walletAddress, user, profiles.length, loadFeed, nav]);

    const top = profiles[0];

    return (
        <SafeAreaView style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>SeekHer</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterTab, f === filter && styles.filterTabActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, f === filter && styles.filterTextActive]}>
                                {FILTER_LABELS[f]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <Text style={styles.streak}>🔥 {user?.streak_days ?? 0}</Text>
            </View>

            {/* Card area */}
            <View style={styles.cardArea}>
                {loading ? (
                    <>
                        <ShimmerCard />
                        <ShimmerCard />
                    </>
                ) : profiles.length === 0 ? (
                    <EmptyState onRefresh={loadFeed} refreshing={refreshing} />
                ) : (
                    /* Stack: show top 3 with scale offsets */
                    <View style={styles.stack}>
                        {profiles.slice(0, 3).reverse().map((p, ri) => {
                            const idx = 2 - ri; // 0=top, 1=mid, 2=back
                            const scale = 1 - idx * 0.04;
                            const translateY = idx * -8;
                            return (
                                <View
                                    key={p.wallet_address}
                                    style={[
                                        StyleSheet.absoluteFillObject,
                                        { transform: [{ scale }, { translateY }], zIndex: 3 - idx },
                                    ]}
                                >
                                    <SwipeCard
                                        user={p}
                                        isTop={idx === 0}
                                        onSwipeRight={() => handleSwipe('bullish', p)}
                                        onSwipeLeft={() => handleSwipe('bearish', p)}
                                        compatibilityScore={user ? calculateCompatibility(user, p).score : undefined}
                                    />
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>

            {/* Action bar */}
            {!loading && profiles.length > 0 && (
                <View style={styles.actionBar}>
                    <ActionBtn icon="✕" color={COLORS.bearish} onPress={() => top && handleSwipe('bearish', top)} />
                    <ActionBtn icon="⭐" color={COLORS.scoreGold} onPress={() => { }} />
                    <ActionBtn icon="♥" color={COLORS.bullish} onPress={() => top && handleSwipe('bullish', top)} />
                </View>
            )}
        </SafeAreaView>
    );
}

const CARD_HEIGHT = Dimensions.get('window').height * 0.72;

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    logo: { color: COLORS.purple, fontWeight: '900', fontSize: 18, letterSpacing: -0.5, flexShrink: 0 },
    filterRow: { gap: 6, paddingHorizontal: 4 },
    filterTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    filterTabActive: { borderBottomColor: COLORS.purple },
    filterText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
    filterTextActive: { color: COLORS.textPrimary, fontWeight: '700' },
    streak: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', flexShrink: 0 },
    cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    stack: { width: W - 32, height: CARD_HEIGHT },
    card: { width: W - 32, height: CARD_HEIGHT, borderRadius: 24 },
    actionBar: { flexDirection: 'row', justifyContent: 'center', gap: 28, paddingBottom: 24, paddingTop: 8 },
    actionBtn: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: COLORS.card,
        borderWidth: 2,
        alignItems: 'center', justifyContent: 'center',
    },
    actionIcon: { fontSize: 24 },
    empty: { alignItems: 'center', gap: 12, paddingHorizontal: 40 },
    emptyEmoji: { fontSize: 60 },
    emptyTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800', textAlign: 'center' },
    emptySub: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
    countdownBox: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.cardBorder },
    countdownLabel: { color: COLORS.textMuted, fontSize: 12 },
    countdown: { color: COLORS.purple, fontSize: 28, fontWeight: '900' },
    refreshBtn: { backgroundColor: COLORS.cardBorder, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
    refreshBtnText: { color: COLORS.textSecondary, fontWeight: '700' },
});
