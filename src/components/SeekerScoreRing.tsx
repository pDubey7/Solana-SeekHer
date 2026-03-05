import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Animated as RNAnimated,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import type { SeekerScore, SeekerTier } from '@app-types/index';
import { COLORS } from '@constants/colors';
import { getTierColor } from '@utils/seekerScore';

type Size = 'sm' | 'md' | 'lg';
const RING_MAP: Record<Size, number> = { sm: 60, md: 100, lg: 140 };
const STROKE: Record<Size, number> = { sm: 5, md: 8, lg: 11 };

interface Props {
    score: SeekerScore;
    size?: Size;
    showBreakdown?: boolean;
}

const BREAKDOWN_ITEMS = [
    { key: 'walletAge', label: 'Wallet Age', icon: '🏦', max: 30 },
    { key: 'nftScore', label: 'NFTs', icon: '🖼️', max: 20 },
    { key: 'activityScore', label: 'Activity', icon: '⚡', max: 20 },
    { key: 'communityScore', label: 'Community', icon: '🌱', max: 20 },
    { key: 'streakScore', label: 'Streak', icon: '🔥', max: 10 },
] as const;

function AnimatedCount({ target, color }: { target: number; color: string }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const steps = 40;
        let step = 0;
        ref.current = setInterval(() => {
            step++;
            setDisplay(Math.round((target * step) / steps));
            if (step >= steps && ref.current) clearInterval(ref.current);
        }, 20);
        return () => { if (ref.current) clearInterval(ref.current); };
    }, [target]);

    return <Text style={[styles.scoreNum, { color }]}>{display}</Text>;
}

export default function SeekerScoreRing({ score, size = 'md', showBreakdown = false }: Props) {
    const [sheetVisible, setSheetVisible] = useState(false);
    const ring = RING_MAP[size];
    const stroke = STROKE[size];
    const color = getTierColor(score.tier);
    const pct = score.total / 100;

    // Animated arc using border trick
    const progress = useSharedValue(0);
    useEffect(() => {
        progress.value = withDelay(200, withTiming(pct, { duration: 1000, easing: Easing.out(Easing.cubic) }));
    }, [pct, progress]);

    const arcStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * 360 - 180}deg` }],
    }));

    const half = ring / 2;

    return (
        <View style={styles.container}>
            {/* Ring */}
            <View style={{ width: ring, height: ring }}>
                {/* Track */}
                <View
                    style={{
                        width: ring, height: ring, borderRadius: half,
                        borderWidth: stroke, borderColor: COLORS.cardBorder,
                        position: 'absolute',
                    }}
                />
                {/* Left half clip */}
                <View style={{ position: 'absolute', width: half, height: ring, overflow: 'hidden', left: 0 }}>
                    <Animated.View
                        style={[
                            {
                                width: ring, height: ring, borderRadius: half,
                                borderWidth: stroke, borderColor: color,
                                position: 'absolute',
                            },
                            arcStyle,
                        ]}
                    />
                </View>
                {/* Right half always visible when > 50% */}
                {score.total >= 50 && (
                    <View style={{ position: 'absolute', width: half, height: ring, overflow: 'hidden', right: 0 }}>
                        <View
                            style={{
                                width: ring, height: ring, borderRadius: half,
                                borderWidth: stroke, borderColor: color,
                                position: 'absolute', right: 0,
                            }}
                        />
                    </View>
                )}
                {/* Center content */}
                <View style={[StyleSheet.absoluteFillObject, styles.center]}>
                    <AnimatedCount target={score.total} color={color} />
                    <Text style={[styles.tierBadge, { color }]}>{score.tier}</Text>
                </View>
            </View>

            {showBreakdown && (
                <TouchableOpacity onPress={() => setSheetVisible(true)} style={styles.detailBtn}>
                    <Text style={styles.detailBtnText}>View Breakdown</Text>
                </TouchableOpacity>
            )}

            {/* Breakdown bottom sheet */}
            <Modal visible={sheetVisible} transparent animationType="slide">
                <TouchableOpacity style={styles.overlay} onPress={() => setSheetVisible(false)} />
                <View style={styles.sheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>Seeker Score Breakdown</Text>
                    {BREAKDOWN_ITEMS.map(item => {
                        const pts = score.breakdown[item.key];
                        const frac = pts / item.max;
                        return (
                            <View key={item.key} style={styles.breakRow}>
                                <Text style={styles.breakIcon}>{item.icon}</Text>
                                <View style={styles.breakInfo}>
                                    <View style={styles.breakHeader}>
                                        <Text style={styles.breakLabel}>{item.label}</Text>
                                        <Text style={styles.breakPts}>{pts}/{item.max}</Text>
                                    </View>
                                    <View style={styles.breakTrack}>
                                        <View style={[styles.breakFill, { width: `${frac * 100}%` as any, backgroundColor: color }]} />
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', gap: 8 },
    center: { alignItems: 'center', justifyContent: 'center' },
    scoreNum: { fontSize: 24, fontWeight: '900' },
    tierBadge: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
    detailBtn: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: COLORS.purple },
    detailBtnText: { color: COLORS.purple, fontSize: 12, fontWeight: '600' },
    overlay: { flex: 1, backgroundColor: COLORS.overlay },
    sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
    sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.cardBorder, borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
    sheetTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
    breakRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    breakIcon: { fontSize: 22, width: 30 },
    breakInfo: { flex: 1, gap: 4 },
    breakHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    breakLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
    breakPts: { color: COLORS.textMuted, fontSize: 12 },
    breakTrack: { height: 6, backgroundColor: COLORS.cardBorder, borderRadius: 3, overflow: 'hidden' },
    breakFill: { height: 6, borderRadius: 3 },
});
