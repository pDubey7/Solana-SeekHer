import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Dimensions,
    Modal,
    SafeAreaView,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useWallet } from '@context/WalletContext';
import WalletButton from '@components/WalletButton';
import { COLORS } from '@constants/colors';

const { width: W } = Dimensions.get('window');

const FEATURES = [
    { icon: '🖼️', text: 'Auto-profile built from your NFTs & tokens' },
    { icon: '⭐', text: 'Seeker Score powered by your on-chain history' },
    { icon: '⛓️', text: 'Match proof minted to your wallet forever' },
] as const;

function FeatureRow({ icon, text, delay }: { icon: string; text: string; delay: number }) {
    const op = useSharedValue(0);
    const tx = useSharedValue(20);

    useEffect(() => {
        op.value = withDelay(delay, withTiming(1, { duration: 500 }));
        tx.value = withDelay(delay, withTiming(0, { duration: 500 }));
    }, [delay, op, tx]);

    const style = useAnimatedStyle(() => ({
        opacity: op.value,
        transform: [{ translateX: tx.value }],
    }));

    return (
        <Animated.View style={[styles.featureRow, style]}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureText}>{text}</Text>
        </Animated.View>
    );
}

export default function ConnectWalletScreen() {
    const { connect, connecting, walletAddress } = useWallet();
    const [errorSheet, setErrorSheet] = useState(false);

    const headerOp = useSharedValue(0);
    const headerTy = useSharedValue(-20);

    useEffect(() => {
        headerOp.value = withTiming(1, { duration: 600 });
        headerTy.value = withTiming(0, { duration: 600 });
    }, [headerOp, headerTy]);

    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOp.value,
        transform: [{ translateY: headerTy.value }],
    }));

    const handleConnect = async () => {
        try {
            await connect();
            // AppNavigator watches walletAddress — auto-redirects
        } catch (e: any) {
            if (e?.message?.includes('No Solana wallet')) {
                setErrorSheet(true);
            }
        }
    };

    return (
        <SafeAreaView style={styles.screen}>
            {/* Radial glow top center */}
            <View style={styles.glowContainer} pointerEvents="none">
                <LinearGradient
                    colors={['rgba(153,69,255,0.18)', 'transparent']}
                    style={styles.glow}
                />
            </View>

            <Animated.View style={[styles.topSection, headerStyle]}>
                {/* Mini logo */}
                <LinearGradient
                    colors={[COLORS.purple, COLORS.green]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.miniLogoGrad}
                >
                    <Text style={styles.miniLogo}>SeekHer</Text>
                </LinearGradient>
            </Animated.View>

            {/* Middle: headline + features */}
            <View style={styles.mid}>
                <Text style={styles.headline}>Your wallet{'\n'}is your identity</Text>
                <Text style={styles.sub}>No username. No password.{'\n'}Just connect and go.</Text>

                <View style={styles.features}>
                    {FEATURES.map((f, i) => (
                        <FeatureRow key={i} icon={f.icon} text={f.text} delay={200 + i * 200} />
                    ))}
                </View>
            </View>

            {/* Bottom: Connect button */}
            <View style={styles.bottom}>
                <WalletButton
                    onPress={handleConnect}
                    loading={connecting}
                    walletAddress={walletAddress}
                />
                <Text style={styles.securedText}>🔒 Secured by Solana Mobile Stack</Text>
            </View>

            {/* Error bottom sheet */}
            <Modal visible={errorSheet} transparent animationType="slide">
                <TouchableOpacity style={styles.overlay} onPress={() => setErrorSheet(false)} />
                <View style={styles.sheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>No wallet detected</Text>
                    <Text style={styles.sheetSub}>
                        Install Phantom or Solflare to connect and start using SeekHer.
                    </Text>
                    <TouchableOpacity
                        style={styles.storeBtn}
                        onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=app.phantom')}
                    >
                        <Text style={styles.storeBtnText}>Get Phantom 👻</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.storeBtn, styles.storeBtnSecond]}
                        onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.solflare.mobile')}
                    >
                        <Text style={styles.storeBtnText}>Get Solflare ☀️</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    glowContainer: { position: 'absolute', top: -60, alignSelf: 'center', width: W * 1.2, height: 360, zIndex: 0 },
    glow: { flex: 1, borderRadius: W * 0.6 },
    topSection: { paddingTop: 28, alignItems: 'center', zIndex: 1 },
    miniLogoGrad: { borderRadius: 6, paddingHorizontal: 4, paddingBottom: 2 },
    miniLogo: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    mid: { flex: 1, justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
    headline: {
        color: COLORS.textPrimary,
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 40,
        letterSpacing: -0.5,
    },
    sub: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 24 },
    features: { gap: 16, marginTop: 8 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    featureIcon: { fontSize: 22, width: 32, textAlign: 'center' },
    featureText: { flex: 1, color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 },
    bottom: { paddingHorizontal: 24, paddingBottom: 40, gap: 14, alignItems: 'center' },
    securedText: { color: COLORS.textMuted, fontSize: 12 },
    overlay: { flex: 1, backgroundColor: COLORS.overlay },
    sheet: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, gap: 12,
    },
    sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.cardBorder, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
    sheetTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800' },
    sheetSub: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
    storeBtn: {
        backgroundColor: COLORS.purple,
        borderRadius: 14, padding: 16,
        alignItems: 'center',
    },
    storeBtnSecond: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
    storeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
