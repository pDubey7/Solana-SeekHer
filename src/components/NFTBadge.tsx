import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import type { NFT } from '@app-types/index';
import { COLORS } from '@constants/colors';

type Size = 'sm' | 'md' | 'lg';
const SIZE_MAP: Record<Size, number> = { sm: 32, md: 48, lg: 64 };

interface NFTBadgeProps {
    nft: NFT;
    size?: Size;
    showName?: boolean;
}

export default function NFTBadge({ nft, size = 'md', showName = false }: NFTBadgeProps) {
    const dim = SIZE_MAP[size];

    return (
        <View style={styles.wrapper}>
            <View
                style={[
                    styles.ring,
                    {
                        width: dim + 6,
                        height: dim + 6,
                        borderRadius: (dim + 6) / 2,
                    },
                ]}
            >
                <FastImage
                    source={{ uri: nft.image, priority: FastImage.priority.normal }}
                    style={{
                        width: dim,
                        height: dim,
                        borderRadius: dim / 2,
                        backgroundColor: COLORS.card,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                />
            </View>

            {/* Verified badge */}
            {nft.verified && (
                <View style={[styles.verifiedBadge, { right: -2, bottom: showName ? 20 : -2 }]}>
                    <Text style={styles.verifiedText}>✓</Text>
                </View>
            )}

            {showName && (
                <Text style={[styles.name, { maxWidth: dim + 12 }]} numberOfLines={1}>
                    {nft.collection || nft.name}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
    },
    ring: {
        borderWidth: 2,
        borderColor: COLORS.purple,
        borderRadius: 99,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.purple,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6,
    },
    verifiedBadge: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.green,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedText: {
        color: '#000',
        fontSize: 9,
        fontWeight: '900',
    },
    name: {
        color: COLORS.textMuted,
        fontSize: 10,
        marginTop: 4,
        textAlign: 'center',
    },
});
