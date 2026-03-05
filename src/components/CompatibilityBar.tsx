import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import type { CompatibilityResult } from '@app-types/index';
import { COLORS } from '@constants/colors';

interface Props {
    result: CompatibilityResult;
    animated?: boolean;
}

export default function CompatibilityBar({ result, animated = true }: Props) {
    const progress = useSharedValue(0);

    useEffect(() => {
        const target = result.score / 100;
        progress.value = animated
            ? withTiming(target, { duration: 900, easing: Easing.out(Easing.cubic) })
            : target;
    }, [result.score, animated, progress]);

    const barStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%` as any,
    }));

    const isEmpty = result.score < 20;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.label}>Compatibility</Text>
                <Text style={[styles.pct, { color: result.score >= 60 ? COLORS.green : result.score >= 40 ? COLORS.purple : COLORS.textSecondary }]}>
                    {result.score}%
                </Text>
            </View>

            {/* Bar */}
            <View style={styles.track}>
                <Animated.View style={[styles.fill, barStyle]}>
                    <LinearGradient
                        colors={[COLORS.purple, COLORS.green]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                </Animated.View>
            </View>

            {/* Reasons / empty */}
            {isEmpty ? (
                <Text style={styles.emptyText}>Not much overlap yet 🌱</Text>
            ) : (
                <View style={styles.reasons}>
                    {result.reasons.slice(0, 5).map((r, i) => (
                        <View key={i} style={styles.reasonPill}>
                            <Text style={styles.reasonText} numberOfLines={1}>{r}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
    pct: { fontSize: 20, fontWeight: '900' },
    track: { height: 8, backgroundColor: COLORS.cardBorder, borderRadius: 4, overflow: 'hidden' },
    fill: { height: 8, borderRadius: 4, overflow: 'hidden' },
    emptyText: { color: COLORS.textMuted, fontSize: 13, fontStyle: 'italic' },
    reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    reasonPill: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        maxWidth: 180,
    },
    reasonText: { color: COLORS.textSecondary, fontSize: 11 },
});
