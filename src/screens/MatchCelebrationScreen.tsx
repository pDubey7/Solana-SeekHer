import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withDelay,
    withTiming,
    withSpring,
    withSequence,
    withRepeat,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { useAppNavigation, useAppRoute } from '@navigation/types';
import { useWallet } from '@context/WalletContext';
import { useUser } from '@context/UserContext';
import { createMatch } from '@services/neon';
import CompatibilityBar from '@components/CompatibilityBar';
import { LOOKING_FOR_MODES } from '@constants/modes';
import { COLORS } from '@constants/colors';
import type { CompatibilityResult } from '@app-types/index';

const { width: W, height: H } = Dimensions.get('window');
const PHOTO_SZ = 130;

// ─── Particle Emitter ─────────────────────────────────────────────────────────

const PARTICLE_COUNT = 18;
function Particles() {
    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
                // Deterministic "random" positions
                const startX = (((i * 73) % 100) / 100) * W;
                const startY = H * 0.85;
                const tx = (((i * 47) % 200) - 100);
                const color = i % 3 === 0 ? COLORS.purple : i % 3 === 1 ? COLORS.green : '#fff';
                const size = 6 + (i % 5) * 2;

                const ty = useSharedValue(0);
                const op = useSharedValue(1);
                const sc = useSharedValue(1);

                useEffect(() => {
                    const dur = 1200 + (i % 5) * 300;
                    const delay = i * 80;
                    ty.value = withDelay(delay, withTiming(-H * 0.7, { duration: dur }));
                    op.value = withDelay(delay, withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: dur - 200 })));
                    sc.value = withDelay(delay, withTiming(0.2, { duration: dur }));
                }, []);

                const style = useAnimatedStyle(() => ({
                    opacity: op.value,
                    transform: [{ translateX: tx }, { translateY: ty.value }, { scale: sc.value }],
                }));

                return (
                    <Animated.View
                        key={i}
                        style={[{
                            position: 'absolute',
                            left: startX,
                            top: startY,
                            width: size, height: size,
                            borderRadius: size / 2,
                            backgroundColor: color,
                        }, style]}
                    />
                );
            })}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MatchCelebrationScreen() {
    const nav = useAppNavigation();
    const route = useAppRoute<'MatchCelebration'>();
    const { walletAddress } = useWallet();
    const { user } = useUser();
    const {
        matchedUser, compatibilityScore, sharedNfts, sharedTokens, sharedTags, mode,
    } = route.params;

    const [mintStatus, setMintStatus] = React.useState<'minting' | 'done' | 'error'>('minting');

    // Animation shared values
    const leftPhotoTx = useSharedValue(-W * 0.6);
    const rightPhotoTx = useSharedValue(W * 0.6);
    const matchOp = useSharedValue(0);
    const matchSc = useSharedValue(0.6);
    const barOp = useSharedValue(0);
    const sharedOp = useSharedValue(0);
    const sharedTy = useSharedValue(20);
    const mintOp = useSharedValue(0);
    const btnOp = useSharedValue(0);

    const leftPhotoStyle = useAnimatedStyle(() => ({ transform: [{ translateX: leftPhotoTx.value }] }));
    const rightPhotoStyle = useAnimatedStyle(() => ({ transform: [{ translateX: rightPhotoTx.value }] }));
    const matchStyle = useAnimatedStyle(() => ({ opacity: matchOp.value, transform: [{ scale: matchSc.value }] }));
    const barStyle = useAnimatedStyle(() => ({ opacity: barOp.value }));
    const sharedStyle = useAnimatedStyle(() => ({ opacity: sharedOp.value, transform: [{ translateY: sharedTy.value }] }));
    const mintStyle = useAnimatedStyle(() => ({ opacity: mintOp.value }));
    const btnStyle = useAnimatedStyle(() => ({ opacity: btnOp.value }));

    useEffect(() => {
        // Sequence the animations
        leftPhotoTx.value = withSpring(-(PHOTO_SZ * 0.35), { damping: 14 });
        rightPhotoTx.value = withSpring(PHOTO_SZ * 0.35, { damping: 14 });

        matchOp.value = withDelay(400, withTiming(1, { duration: 400 }));
        matchSc.value = withDelay(400, withSpring(1, { damping: 12 }));

        barOp.value = withDelay(700, withTiming(1, { duration: 400 }));

        sharedOp.value = withDelay(1000, withTiming(1, { duration: 400 }));
        sharedTy.value = withDelay(1000, withTiming(0, { duration: 400 }));

        mintOp.value = withDelay(1300, withTiming(1, { duration: 400 }));
        btnOp.value = withDelay(1600, withTiming(1, { duration: 400 }));

        // Create match + SBT (background)
        const doCreateMatch = async () => {
            if (!walletAddress) return;
            try {
                const compatResult: CompatibilityResult = {
                    score: compatibilityScore,
                    reasons: [],
                    shared_nfts: sharedNfts,
                    shared_tokens: sharedTokens,
                    shared_tags: sharedTags,
                };
                await createMatch(
                    walletAddress,
                    matchedUser.wallet_address,
                    compatibilityScore,
                    sharedNfts,
                    sharedTokens,
                    sharedTags,
                    mode,
                );
                setMintStatus('done');
            } catch {
                setMintStatus('error');
            }
        };
        void doCreateMatch();
    }, []);

    const modeData = LOOKING_FOR_MODES.find(m => m.label === mode);
    const matchMsg = modeData?.matchMessage ?? "It's a Match! 💜";

    const fakeCompat: CompatibilityResult = {
        score: compatibilityScore, reasons: [], shared_nfts: sharedNfts, shared_tokens: sharedTokens, shared_tags: sharedTags,
    };

    return (
        <View style={styles.screen}>
            <LinearGradient
                colors={['#0A0A0F', '#130a20', '#0A0A0F']}
                style={StyleSheet.absoluteFillObject}
            />
            <Particles />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Photos */}
                <View style={styles.photosRow}>
                    <Animated.View style={[styles.photoWrap, leftPhotoStyle]}>
                        <FastImage source={{ uri: user?.photos[0] ?? '' }} style={styles.photo} resizeMode={FastImage.resizeMode.cover} />
                    </Animated.View>
                    <View style={styles.heartBadge}><Text style={{ fontSize: 24 }}>💜</Text></View>
                    <Animated.View style={[styles.photoWrap, rightPhotoStyle]}>
                        <FastImage source={{ uri: matchedUser.photos[0] }} style={styles.photo} resizeMode={FastImage.resizeMode.cover} />
                    </Animated.View>
                </View>

                {/* Match message */}
                <Animated.View style={[styles.matchMsgWrap, matchStyle]}>
                    <LinearGradient
                        colors={[COLORS.purple, COLORS.green]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.matchMsgGrad}
                    >
                        <Text style={styles.matchMsg}>{matchMsg}</Text>
                    </LinearGradient>
                </Animated.View>

                {/* Compatibility */}
                <Animated.View style={[styles.section, barStyle]}>
                    <CompatibilityBar result={fakeCompat} animated />
                </Animated.View>

                {/* Shared connections */}
                {(sharedNfts.length > 0 || sharedTokens.length > 0 || sharedTags.length > 0) && (
                    <Animated.View style={[styles.section, sharedStyle]}>
                        <Text style={styles.sectionTitle}>What you share 🤝</Text>
                        <View style={styles.pills}>
                            {sharedNfts.slice(0, 2).map(n => (
                                <View key={n.mint} style={styles.sharedPill}>
                                    <Text style={styles.pillText}>🖼️ Both hold {n.collection}</Text>
                                </View>
                            ))}
                            {sharedTokens.slice(0, 2).map(t => (
                                <View key={t.mint} style={styles.sharedPill}>
                                    <Text style={styles.pillText}>💰 Both hodling ${t.symbol}</Text>
                                </View>
                            ))}
                            {sharedTags.slice(0, 2).map(tag => (
                                <View key={tag} style={styles.sharedPill}>
                                    <Text style={styles.pillText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Soulbound status */}
                <Animated.View style={[styles.section, mintStyle]}>
                    <View style={[styles.mintRow, mintStatus === 'done' && styles.mintRowDone]}>
                        <Text style={styles.mintText}>
                            {mintStatus === 'minting' ? '⛓️ Proof of Vibe minting to your wallet...'
                                : mintStatus === 'done' ? '✅ Proof of Vibe minted!'
                                    : '⚠️ Mint failed — stored in DB'}
                        </Text>
                    </View>
                </Animated.View>

                {/* CTA buttons */}
                <Animated.View style={[styles.btns, btnStyle]}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => nav.navigate('Chat', {
                            matchId: `${walletAddress}_${matchedUser.wallet_address}`,
                            matchedUser,
                        })}
                    >
                        <LinearGradient
                            colors={[COLORS.purple, COLORS.green]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.primaryBtnGrad}
                        >
                            <Text style={styles.primaryBtnText}>Send First Move 💸</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => nav.navigate('Swipe')}
                    >
                        <Text style={styles.secondaryBtnText}>Keep Swiping</Text>
                    </TouchableOpacity>
                    <Text style={styles.tipNote}>
                        First message is 0.001 SOL — it goes to them, not us
                    </Text>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    content: { alignItems: 'center', gap: 24, paddingTop: 60, paddingBottom: 60, paddingHorizontal: 24 },
    photosRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: W },
    photoWrap: {
        width: PHOTO_SZ, height: PHOTO_SZ, borderRadius: PHOTO_SZ / 2,
        borderWidth: 3, borderColor: COLORS.purple,
        overflow: 'hidden', shadowColor: COLORS.purple,
        shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
    },
    photo: { width: '100%', height: '100%' },
    heartBadge: {
        position: 'absolute', zIndex: 10,
        backgroundColor: COLORS.background, borderRadius: 24,
        width: 48, height: 48, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: COLORS.cardBorder,
    },
    matchMsgWrap: { width: '100%' },
    matchMsgGrad: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8 },
    matchMsg: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center', lineHeight: 38 },
    section: { width: '100%' },
    sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 8 },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    sharedPill: {
        backgroundColor: 'rgba(153,69,255,0.15)', borderRadius: 14,
        paddingHorizontal: 12, paddingVertical: 6,
        borderWidth: 1, borderColor: COLORS.cardBorder,
    },
    pillText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '600' },
    mintRow: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.cardBorder },
    mintRowDone: { borderColor: COLORS.green, backgroundColor: 'rgba(20,241,149,0.08)' },
    mintText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
    btns: { width: '100%', gap: 12, alignItems: 'center' },
    primaryBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    primaryBtnGrad: { padding: 18, alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
    secondaryBtn: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 14, borderWidth: 1, borderColor: COLORS.cardBorder },
    secondaryBtnText: { color: COLORS.textSecondary, fontWeight: '700' },
    tipNote: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center' },
});
