import React, { useCallback, useEffect } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
    Vibration,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    runOnJS,
    Extrapolation,
} from 'react-native-reanimated';
import type { User } from '@app-types/index';
import { COLORS } from '@constants/colors';
import { LOOKING_FOR_MODES } from '@constants/modes';
import { VIBE_TAGS_FLAT } from '@constants/tags';
import { getTierColor } from '@utils/seekerScore';

const { width: W, height: H } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;
const CARD_WIDTH = W - 32;
const CARD_HEIGHT = H * 0.72;

interface SwipeCardProps {
    user: User;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    isTop: boolean;
    compatibilityScore?: number;
    compatibilityReasons?: string[];
}

function tierLabel(score: number): string {
    if (score >= 80) return 'D';
    if (score >= 60) return 'G';
    if (score >= 40) return 'S';
    return 'B';
}

export default function SwipeCard({
    user,
    onSwipeLeft,
    onSwipeRight,
    isTop,
    compatibilityScore,
}: SwipeCardProps) {
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const opacity = useSharedValue(1);

    const triggerHaptic = useCallback(() => Vibration.vibrate(40), []);

    const handleSwipeRight = useCallback(() => {
        triggerHaptic();
        onSwipeRight();
    }, [onSwipeRight, triggerHaptic]);

    const handleSwipeLeft = useCallback(() => {
        triggerHaptic();
        onSwipeLeft();
    }, [onSwipeLeft, triggerHaptic]);

    const pan = Gesture.Pan()
        .enabled(isTop)
        .onUpdate((e) => {
            tx.value = e.translationX;
            ty.value = e.translationY * 0.2;
        })
        .onEnd((e) => {
            if (e.translationX > SWIPE_THRESHOLD) {
                tx.value = withSpring(W * 1.5, { damping: 14 });
                runOnJS(handleSwipeRight)();
            } else if (e.translationX < -SWIPE_THRESHOLD) {
                tx.value = withSpring(-W * 1.5, { damping: 14 });
                runOnJS(handleSwipeLeft)();
            } else {
                tx.value = withSpring(0, { damping: 18, stiffness: 200 });
                ty.value = withSpring(0, { damping: 18, stiffness: 200 });
            }
        });

    const cardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(tx.value, [-W / 2, 0, W / 2], [-15, 0, 15], Extrapolation.CLAMP);
        return {
            transform: [
                { translateX: tx.value },
                { translateY: ty.value },
                { rotate: `${rotate}deg` },
            ],
        };
    });

    const bullishOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(tx.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    }));

    const bearishOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(tx.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
    }));

    const modesToShow = LOOKING_FOR_MODES.filter(m => user.looking_for.includes(m.label as any)).slice(0, 2);
    const tagsToShow = VIBE_TAGS_FLAT.filter(t => user.vibe_tags.includes(t.id)).slice(0, 4);
    const tierColor = getTierColor(
        user.seeker_score >= 80 ? 'Diamond' :
            user.seeker_score >= 60 ? 'Gold' :
                user.seeker_score >= 40 ? 'Silver' : 'Bronze',
    );

    return (
        <GestureDetector gesture={pan}>
            <Animated.View
                style={[
                    styles.card,
                    cardStyle,
                    isTop && styles.cardShadow,
                ]}
            >
                {/* Background photo */}
                <FastImage
                    source={{ uri: user.photos[0], priority: FastImage.priority.high }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode={FastImage.resizeMode.cover}
                >
                    {/* Gradient overlay */}
                    <LinearGradient
                        colors={['transparent', 'rgba(10,10,15,0.5)', '#0A0A0F']}
                        locations={[0.3, 0.6, 1]}
                        style={StyleSheet.absoluteFillObject}
                    />
                </FastImage>

                {/* BULLISH indicator */}
                <Animated.View style={[styles.bullishLabel, bullishOpacity]}>
                    <Text style={styles.bullishText}>BULLISH 📈</Text>
                </Animated.View>

                {/* BEARISH indicator */}
                <Animated.View style={[styles.bearishLabel, bearishOpacity]}>
                    <Text style={styles.bearishText}>BEARISH 📉</Text>
                </Animated.View>

                {/* Seeker Score badge */}
                <View style={[styles.scoreBadge, { borderColor: tierColor }]}>
                    <Text style={[styles.scoreNum, { color: tierColor }]}>{user.seeker_score}</Text>
                    <Text style={[styles.scoreTier, { color: tierColor }]}>{tierLabel(user.seeker_score)}</Text>
                </View>

                {/* Compatibility badge */}
                {compatibilityScore !== undefined && compatibilityScore >= 40 && (
                    <View style={styles.compatBadge}>
                        <Text style={styles.compatText}>💜 {compatibilityScore}%</Text>
                    </View>
                )}

                {/* Bottom info section */}
                <View style={styles.bottom}>
                    {/* Name + age */}
                    <Text style={styles.name} numberOfLines={1}>
                        {user.display_name}, {user.age}
                    </Text>
                    <Text style={styles.country}>{user.country}</Text>

                    {/* Looking For chips */}
                    {modesToShow.length > 0 && (
                        <View style={styles.row}>
                            {modesToShow.map(m => (
                                <View key={m.id} style={[styles.modeChip, { borderColor: m.color }]}>
                                    <Text style={styles.modeChipText}>{m.emoji} {m.label}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Vibe tags */}
                    {tagsToShow.length > 0 && (
                        <View style={styles.row}>
                            {tagsToShow.map(t => (
                                <View
                                    key={t.id}
                                    style={[styles.tagChip, t.isRare && styles.tagChipRare]}
                                >
                                    <Text style={[styles.tagText, t.isRare && styles.tagTextRare]}>
                                        {t.isRare ? '⭐' : ''}{t.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* NFT badges */}
                    {user.pinned_nfts.slice(0, 3).length > 0 && (
                        <View style={styles.row}>
                            {user.pinned_nfts.slice(0, 3).map(nft => (
                                <FastImage
                                    key={nft.mint}
                                    source={{ uri: nft.image }}
                                    style={styles.nftThumb}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: COLORS.card,
    },
    cardShadow: {
        shadowColor: COLORS.purple,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
        elevation: 20,
    },
    bullishLabel: {
        position: 'absolute',
        top: 56,
        left: 20,
        transform: [{ rotate: '-30deg' }],
        borderWidth: 3,
        borderColor: COLORS.bullish,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    bullishText: {
        color: COLORS.bullish,
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 2,
    },
    bearishLabel: {
        position: 'absolute',
        top: 56,
        right: 20,
        transform: [{ rotate: '30deg' }],
        borderWidth: 3,
        borderColor: COLORS.bearish,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    bearishText: {
        color: COLORS.bearish,
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 2,
    },
    scoreBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(13,13,20,0.85)',
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreNum: {
        fontSize: 14,
        fontWeight: '800',
        lineHeight: 16,
    },
    scoreTier: {
        fontSize: 10,
        fontWeight: '700',
    },
    compatBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(153,69,255,0.25)',
        borderWidth: 1,
        borderColor: COLORS.purple,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    compatText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    bottom: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    name: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    country: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 8,
        marginTop: 2,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    modeChip: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modeChipText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    tagChip: {
        backgroundColor: COLORS.tagDefault,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    tagChipRare: {
        borderWidth: 1,
        borderColor: COLORS.tagRare,
        backgroundColor: 'rgba(255,215,0,0.1)',
    },
    tagText: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '600',
    },
    tagTextRare: {
        color: COLORS.tagRare,
    },
    nftThumb: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: COLORS.purple,
    },
});
