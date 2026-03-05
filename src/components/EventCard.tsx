import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { format } from 'date-fns';
import type { Event, Token } from '@app-types/index';
import { COLORS } from '@constants/colors';

interface Props {
    event: Event;
    userTokens: Token[];
    onPress: () => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
    'United States': '🇺🇸', 'India': '🇮🇳', 'Germany': '🇩🇪',
    'Brazil': '🇧🇷', 'Singapore': '🇸🇬', 'UAE': '🇦🇪',
    'UK': '🇬🇧', 'Nigeria': '🇳🇬', 'Philippines': '🇵🇭',
};

export default function EventCard({ event, userTokens, onPress }: Props) {
    const flag = COUNTRY_FLAGS[event.country] ?? '🌍';
    const dateStr = format(new Date(event.event_date), 'EEE, MMM d · h:mm a');

    const userSymbols = userTokens.map(t => t.symbol);
    const isEligible = event.required_token
        ? userSymbols.includes(event.required_token)
        : true;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateMonth}>{format(new Date(event.event_date), 'MMM').toUpperCase()}</Text>
                    <Text style={styles.dateDay}>{format(new Date(event.event_date), 'd')}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
                    <Text style={styles.dateStr}>{dateStr}</Text>
                </View>
            </View>

            {/* Location */}
            <View style={styles.row}>
                <Text style={styles.flag}>{flag}</Text>
                <Text style={styles.location}>{event.location}, {event.country}</Text>
            </View>

            {/* Token gate */}
            {event.required_token && (
                <View style={[styles.eligibilityRow, isEligible ? styles.eligibleBg : styles.lockedBg]}>
                    <Text style={styles.eligibilityText}>
                        {isEligible
                            ? `✅ You're eligible (holds $${event.required_token})`
                            : `🔒 Requires $${event.required_token}`}
                    </Text>
                </View>
            )}

            {/* NFT gate */}
            {event.required_nft_collection && (
                <View style={styles.nftGate}>
                    <Text style={styles.nftGateText}>🖼️ NFT Required: {event.required_nft_collection}</Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.attendees}>👥 {event.attendee_count} attending</Text>
                {event.seekher_matches_attending > 0 && (
                    <Text style={styles.seekherGoing}>
                        {event.seekher_matches_attending} SeekHer matches going 💜
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        marginBottom: 10,
    },
    header: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    dateBadge: {
        width: 48, height: 52, borderRadius: 12,
        backgroundColor: COLORS.purple,
        alignItems: 'center', justifyContent: 'center', gap: 1,
    },
    dateMonth: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    dateDay: { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 26 },
    headerInfo: { flex: 1, gap: 3 },
    title: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800', lineHeight: 22 },
    dateStr: { color: COLORS.textMuted, fontSize: 12 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    flag: { fontSize: 18 },
    location: { color: COLORS.textSecondary, fontSize: 13 },
    eligibilityRow: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
    eligibleBg: { backgroundColor: 'rgba(20,241,149,0.12)', borderWidth: 1, borderColor: COLORS.green },
    lockedBg: { backgroundColor: 'rgba(255,69,96,0.10)', borderWidth: 1, borderColor: COLORS.red },
    eligibilityText: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
    nftGate: { backgroundColor: COLORS.inputBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    nftGateText: { color: COLORS.textSecondary, fontSize: 12 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    attendees: { color: COLORS.textMuted, fontSize: 12 },
    seekherGoing: { color: COLORS.purple, fontSize: 12, fontWeight: '700' },
});
