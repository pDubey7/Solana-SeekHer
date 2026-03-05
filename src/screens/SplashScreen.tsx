import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useAppNavigation } from '@navigation/types';
import { COLORS } from '@constants/colors';

const { width: W, height: H } = Dimensions.get('window');

const DOTS = [
    { x: 0.12, y: 0.18, size: 6, color: COLORS.purple, delay: 0 },
    { x: 0.88, y: 0.25, size: 10, color: COLORS.green, delay: 600 },
    { x: 0.06, y: 0.65, size: 8, color: COLORS.purple, delay: 300 },
    { x: 0.92, y: 0.72, size: 5, color: COLORS.green, delay: 900 },
    { x: 0.45, y: 0.10, size: 7, color: COLORS.purple, delay: 150 },
    { x: 0.75, y: 0.50, size: 9, color: COLORS.green, delay: 450 },
    { x: 0.20, y: 0.82, size: 5, color: COLORS.purple, delay: 750 },
    { x: 0.68, y: 0.88, size: 7, color: COLORS.green, delay: 200 },
] as const;

function FloatingDot({ x, y, size, color, delay }: typeof DOTS[number]) {
    const ty = useSharedValue(0);
    const op = useSharedValue(0);

    useEffect(() => {
        op.value = withTiming(0.55, { duration: 800 + delay });
        ty.value = withRepeat(
            withSequence(
                withTiming(-14, { duration: 2800 + delay * 0.3, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2800 + delay * 0.3, easing: Easing.inOut(Easing.sin) }),
            ),
            -1, false,
        );
    }, [delay, op, ty]);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [{ translateY: ty.value }],
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    left: x * W - size / 2,
                    top: y * H - size / 2,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                },
                style,
            ]}
        />
    );
}

export default function SplashScreen() {
    const nav = useAppNavigation();
    const screenOp = useSharedValue(0);
    const logoOp = useSharedValue(0);
    const taglineOp = useSharedValue(0);

    const screenStyle = useAnimatedStyle(() => ({ opacity: screenOp.value }));
    const logoStyle = useAnimatedStyle(() => ({ opacity: logoOp.value }));
    const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOp.value }));

    useEffect(() => {
        screenOp.value = withTiming(1, { duration: 600 });
        logoOp.value = withTiming(1, { duration: 700 });
        taglineOp.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });

        const t = setTimeout(() => nav.navigate('ConnectWallet'), 2800);
        return () => clearTimeout(t);
    }, [nav, screenOp, logoOp, taglineOp]);

    return (
        <Animated.View style={[styles.screen, screenStyle]}>
            {/* Floating dots */}
            {DOTS.map((d, i) => <FloatingDot key={i} {...d} />)}

            {/* Center content */}
            <View style={styles.center}>
                {/* Logo */}
                <Animated.View style={logoStyle}>
                    <LinearGradient
                        colors={[COLORS.purple, COLORS.green]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.logoGradient}
                    >
                        {/* Painted-over solid text for gradient effect */}
                        <Text style={styles.logoText}>SeekHer</Text>
                    </LinearGradient>
                </Animated.View>

                {/* Tagline */}
                <Animated.Text style={[styles.tagline, taglineStyle]}>
                    Your wallet. Your vibe. Your people.
                </Animated.Text>
            </View>

            {/* Solana badge */}
            <View style={styles.badge}>
                <Text style={styles.badgeText}>Built on Solana ◎</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    logoGradient: { borderRadius: 8, paddingHorizontal: 4, paddingBottom: 2 },
    logoText: {
        fontSize: 56,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 17,
        color: COLORS.textSecondary,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    badge: {
        paddingBottom: 36,
        alignItems: 'center',
    },
    badgeText: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
});
