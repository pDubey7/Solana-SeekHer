import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { getMatches } from '@services/neon';
import { useWallet } from '@context/WalletContext';
import { useAppNavigation } from '@navigation/types';
import MatchCard from '@components/MatchCard';
import type { Match } from '@app-types/index';
import { COLORS } from '@constants/colors';

export default function MatchesListScreen() {
    const nav = useAppNavigation();
    const { walletAddress } = useWallet();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!walletAddress) return;
        try {
            const data = await getMatches(walletAddress);
            setMatches(data);
        } finally {
            setLoading(false);
        }
    }, [walletAddress]);

    useEffect(() => { void load(); }, [load]);

    const unread = matches.filter(m => !m.soulbound_mint).length;

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <Text style={styles.title}>Matches</Text>
                {unread > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unread}</Text>
                    </View>
                )}
            </View>

            <FlatList
                data={matches}
                keyExtractor={m => m.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.purple} />}
                renderItem={({ item }) => (
                    <MatchCard
                        match={item}
                        hasUnread={!item.soulbound_mint}
                        onPress={() => nav.navigate('Chat', {
                            matchId: item.id,
                            matchedUser: item.matched_user,
                        })}
                    />
                )}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.empty}>
                            <Text style={styles.emptyEmoji}>🔥</Text>
                            <Text style={styles.emptyTitle}>No matches yet</Text>
                            <Text style={styles.emptySub}>Get out there and swipe!</Text>
                            <TouchableOpacity
                                style={styles.swipeBtn}
                                onPress={() => nav.navigate('Swipe')}
                            >
                                <Text style={styles.swipeBtnText}>Start Swiping 🔥</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
    title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '900' },
    badge: {
        backgroundColor: COLORS.purple, borderRadius: 12,
        paddingHorizontal: 8, paddingVertical: 2, minWidth: 24, alignItems: 'center',
    },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
    list: { paddingHorizontal: 16, paddingBottom: 24 },
    empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyEmoji: { fontSize: 64 },
    emptyTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
    emptySub: { color: COLORS.textSecondary, fontSize: 15 },
    swipeBtn: { backgroundColor: COLORS.purple, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
    swipeBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
