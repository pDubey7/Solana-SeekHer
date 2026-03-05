import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { format } from 'date-fns';
import EventCard from '@components/EventCard';
import { useUser } from '@context/UserContext';
import { COLORS } from '@constants/colors';
import type { Event, Token } from '@app-types/index';

// ─── Seed Events (Hackathon data) ─────────────────────────────────────────────

const SEED_EVENTS: Event[] = [
    {
        id: '1',
        title: 'Superteam India Meetup',
        description: 'Biggest Solana dev gathering in India. NFTs, DeFi, and more.',
        location: 'Mumbai',
        country: 'India',
        event_date: '2025-04-15T18:00:00Z',
        required_token: 'BONK',
        organizer_wallet: 'superteamIN',
        attendee_count: 340,
        seekher_matches_attending: 28,
    },
    {
        id: '2',
        title: 'Solana Breakpoint 2025',
        description: 'The flagship Solana global developer conference.',
        location: 'Singapore',
        country: 'Singapore',
        event_date: '2025-05-20T09:00:00Z',
        organizer_wallet: 'solanaFDN',
        attendee_count: 5000,
        seekher_matches_attending: 142,
    },
    {
        id: '3',
        title: 'Superteam Nigeria Demo Day',
        description: 'Builders showcase their projects. Live pitching, prizes.',
        location: 'Lagos',
        country: 'Nigeria',
        event_date: '2025-04-22T14:00:00Z',
        required_token: 'WEN',
        organizer_wallet: 'superteamNG',
        attendee_count: 180,
        seekher_matches_attending: 19,
    },
    {
        id: '4',
        title: 'Solana Hacker House Berlin',
        description: '5-day hacker house with Solana Foundation + Superteam EU.',
        location: 'Berlin',
        country: 'Germany',
        event_date: '2025-06-08T10:00:00Z',
        required_nft_collection: 'Mad Lads',
        organizer_wallet: 'superteamEU',
        attendee_count: 90,
        seekher_matches_attending: 11,
    },
    {
        id: '5',
        title: 'Superteam Philippines Meetup',
        description: 'Growing PH Solana community meets in Manila.',
        location: 'Manila',
        country: 'Philippines',
        event_date: '2025-05-10T15:00:00Z',
        organizer_wallet: 'superteamPH',
        attendee_count: 220,
        seekher_matches_attending: 34,
    },
    {
        id: '6',
        title: 'Solana Mobile Seeker Launch Event',
        description: 'SeekHer goes live! Join the global launch party online.',
        location: 'Online',
        country: 'Global',
        event_date: '2025-04-01T20:00:00Z',
        organizer_wallet: 'seekherApp',
        attendee_count: 1200,
        seekher_matches_attending: 320,
    },
];

const COUNTRIES = ['All', ...Array.from(new Set(SEED_EVENTS.map(e => e.country)))];

export default function EventsScreen() {
    const { user } = useUser();
    const [selected, setSelected] = useState('All');
    const userTokens: Token[] = user?.tokens ?? [];

    const filtered = SEED_EVENTS.filter(e =>
        selected === 'All' || e.country === selected,
    );

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <Text style={styles.title}>Events</Text>
                <Text style={styles.sub}>{SEED_EVENTS.length} upcoming</Text>
            </View>

            {/* Country filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
            >
                {COUNTRIES.map(c => (
                    <TouchableOpacity
                        key={c}
                        style={[styles.filterPill, c === selected && styles.filterPillActive]}
                        onPress={() => setSelected(c)}
                    >
                        <Text style={[styles.filterText, c === selected && styles.filterTextActive]}>{c}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Events list */}
            <FlatList
                data={filtered}
                keyExtractor={e => e.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <EventCard event={item} userTokens={userTokens} onPress={() => { }} />
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No events in {selected} yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'baseline', gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
    title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '900' },
    sub: { color: COLORS.textMuted, fontSize: 13 },
    filterRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
    filterPill: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder,
    },
    filterPillActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
    filterText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 13 },
    filterTextActive: { color: '#fff' },
    list: { paddingHorizontal: 16, paddingBottom: 24 },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { color: COLORS.textMuted, fontSize: 15 },
});
