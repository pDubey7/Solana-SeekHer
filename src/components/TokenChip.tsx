import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Token } from '@app-types/index';
import { COLORS } from '@constants/colors';

interface Props {
    token: Token;
    showAmount?: boolean;
}

function formatAmount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(2);
}

export default function TokenChip({ token, showAmount = false }: Props) {
    const isCommunity = token.isCommunityToken;

    return (
        <View style={[styles.chip, isCommunity && styles.chipCommunity]}>
            {isCommunity && <Text style={styles.sol}>◎ </Text>}
            <Text style={[styles.symbol, isCommunity && styles.symbolCommunity]}>
                {token.symbol}
            </Text>
            {showAmount && (
                <Text style={styles.amount}> {formatAmount(token.amount)}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    chipCommunity: {
        borderColor: COLORS.purple,
        backgroundColor: 'rgba(153,69,255,0.12)',
        shadowColor: COLORS.purple,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 4,
    },
    sol: {
        color: COLORS.purple,
        fontSize: 12,
        fontWeight: '700',
    },
    symbol: {
        color: COLORS.textPrimary,
        fontSize: 12,
        fontWeight: '700',
    },
    symbolCommunity: {
        color: COLORS.purple,
    },
    amount: {
        color: COLORS.textMuted,
        fontSize: 11,
    },
});
