import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { COLORS } from '@constants/colors';

interface Props {
    onPress: () => void;
    loading?: boolean;
    walletAddress?: string | null;
}

function shortAddr(addr: string): string {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function WalletButton({ onPress, loading = false, walletAddress }: Props) {
    const pulse = useSharedValue(1);

    useEffect(() => {
        if (loading) {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 600 }),
                    withTiming(1.0, { duration: 600 }),
                ),
                -1, false,
            );
        } else {
            pulse.value = withTiming(1);
        }
    }, [loading, pulse]);

    const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
    const isConnected = Boolean(walletAddress);

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={loading} style={styles.outer}>
                <Animated.View style={[styles.btn, pulseStyle]}>
                    <LinearGradient
                        colors={['#9945FF', '#14F195']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.btnText}>
                            {isConnected ? `◎ ${shortAddr(walletAddress!)}` : '🔗 Connect Wallet'}
                        </Text>
                    )}
                </Animated.View>
            </TouchableOpacity>
            {!isConnected && (
                <Text style={styles.sub}>Works with Phantom · Solflare · Backpack</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { gap: 8, alignItems: 'center' },
    outer: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    btn: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    btnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
    sub: { color: COLORS.textMuted, fontSize: 12 },
});
