import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { formatDistanceToNow } from 'date-fns';
import type { Match } from '@app-types/index';
import { COLORS } from '@constants/colors';
import { LOOKING_FOR_MODES } from '@constants/modes';

interface Props {
    match: Match;
    onPress: () => void;
    hasUnread?: boolean;
}

export default function MatchCard({ match, onPress, hasUnread = false }: Props) {
    const user = match.matched_user;
    const mode = LOOKING_FOR_MODES.find(m => m.label === match.mode);
    const timeAgo = formatDistanceToNow(new Date(match.created_at), { addSuffix: true });

    const preview = match.shared_nfts.length > 0
        ? `You both hold ${match.shared_nfts[0].collection} 🤝`
        : match.shared_tokens.length > 0
            ? `Both hodling $${match.shared_tokens[0].symbol} 💰`
            : match.shared_tags.length > 0
                ? `Both tagged #${match.shared_tags[0]}`
                : 'SeekHer match!';

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
            {/* Avatar */}
            <View style={styles.avatarWrap}>
                <FastImage
                    source={{ uri: user.photos[0] }}
                    style={styles.avatar}
                    resizeMode={FastImage.resizeMode.cover}
                />
                {hasUnread && <View style={styles.unreadDot} />}
            </View>

            {/* Info */}
            <View style={styles.info}>
                <View style={styles.topRow}>
                    <Text style={styles.name} numberOfLines={1}>{user.display_name}</Text>
                    <Text style={styles.time}>{timeAgo}</Text>
                </View>
                <View style={styles.modeRow}>
                    <Text style={[styles.modeChip, { backgroundColor: mode?.color ?? COLORS.purple }]}>
                        {mode?.emoji} {match.mode}
                    </Text>
                    <Text style={styles.score}>{match.compatibility_score}% match</Text>
                </View>
                <Text style={styles.preview} numberOfLines={1}>{preview}</Text>
            </View>

            {/* Soulbound badge */}
            {match.soulbound_mint && (
                <View style={styles.sbBadge}>
                    <Text style={styles.sbText}>⛓️</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        marginBottom: 8,
    },
    avatarWrap: { position: 'relative' },
    avatar: {
        width: 56, height: 56, borderRadius: 28,
        borderWidth: 2, borderColor: COLORS.purple,
    },
    unreadDot: {
        position: 'absolute', top: 0, right: 0,
        width: 14, height: 14, borderRadius: 7,
        backgroundColor: COLORS.purple,
        borderWidth: 2, borderColor: COLORS.background,
    },
    info: { flex: 1, gap: 4 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 },
    time: { color: COLORS.textMuted, fontSize: 11 },
    modeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    modeChip: {
        color: '#fff', fontSize: 11, fontWeight: '700',
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
        overflow: 'hidden',
    },
    score: { color: COLORS.textMuted, fontSize: 11 },
    preview: { color: COLORS.textSecondary, fontSize: 12 },
    sbBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center' },
    sbText: { fontSize: 14 },
});
