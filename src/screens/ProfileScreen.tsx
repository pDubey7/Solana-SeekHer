import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
    Clipboard,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useWallet } from '@context/WalletContext';
import { useUser } from '@context/UserContext';
import { useAppNavigation } from '@navigation/types';
import SeekerScoreRing from '@components/SeekerScoreRing';
import NFTBadge from '@components/NFTBadge';
import TokenChip from '@components/TokenChip';
import ProfileModeSelector from '@components/ProfileModeSelector';
import CompatibilityBar from '@components/CompatibilityBar';
import { COLORS } from '@constants/colors';
import type { LookingFor } from '@app-types/index';

function shortAddr(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ProfileScreen() {
    const nav = useAppNavigation();
    const { walletAddress, disconnect } = useWallet();
    const { user, seekerScore } = useUser();

    const handleCopy = () => {
        if (walletAddress) {
            Clipboard.setString(walletAddress);
            Alert.alert('Copied!', 'Wallet address copied to clipboard.');
        }
    };

    const handleDisconnect = () => {
        Alert.alert(
            'Disconnect Wallet',
            'Are you sure? You will need to reconnect to use SeekHer.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Disconnect', style: 'destructive', onPress: () => disconnect() },
            ],
        );
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.screen}>
                <View style={styles.loading}>
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.topRow}>
                    <Text style={styles.screenTitle}>Profile</Text>
                    <TouchableOpacity style={styles.settingsBtn} disabled>
                        <Text style={styles.settingsIcon}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                {/* Photo */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarRing}>
                        <FastImage
                            source={{ uri: user.photos[0] ?? '' }}
                            style={styles.avatar}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                    </View>
                    <Text style={styles.nameText}>{user.display_name}, {user.age}</Text>
                    <Text style={styles.countryText}>{user.country}</Text>
                </View>

                {/* Seeker Score */}
                {seekerScore && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>⭐ Seeker Score</Text>
                        <View style={styles.scoreCenter}>
                            <SeekerScoreRing score={seekerScore} size="lg" showBreakdown />
                        </View>
                        <View style={styles.streakRow}>
                            <Text style={styles.streakText}>🔥 {user.streak_days} day streak</Text>
                            <Text style={styles.streakNote}>Keep swiping daily to grow your score</Text>
                        </View>
                    </View>
                )}

                {/* Looking For (read-only display) */}
                {user.looking_for.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Looking For</Text>
                        <View style={styles.modeRow}>
                            {user.looking_for.map(m => (
                                <View key={m} style={styles.modePill}>
                                    <Text style={styles.modePillText}>{m}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Top Vibe Tags */}
                {user.vibe_tags.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Vibes</Text>
                        <View style={styles.tagRow}>
                            {user.vibe_tags.map(t => (
                                <View key={t} style={styles.tagPill}>
                                    <Text style={styles.tagPillText}>#{t}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* NFT Showcase */}
                {user.pinned_nfts.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🖼️ NFT Collection</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nftRow}>
                            {user.pinned_nfts.map(n => (
                                <NFTBadge key={n.mint} nft={n} size="md" showName />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Tokens */}
                {user.tokens.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>💰 Token Holdings</Text>
                        <View style={styles.tagRow}>
                            {user.tokens.map(t => (
                                <TokenChip key={t.mint} token={t} showAmount />
                            ))}
                        </View>
                    </View>
                )}

                {/* Wallet Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔑 Wallet</Text>
                    <View style={styles.walletRow}>
                        <Text style={styles.walletAddr}>{shortAddr(walletAddress ?? '')}</Text>
                        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                            <Text style={styles.copyBtnText}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={() => Linking.openURL(`https://solscan.io/account/${walletAddress}`)}
                        style={styles.solscanBtn}
                    >
                        <Text style={styles.solscanText}>View on Solscan ↗</Text>
                    </TouchableOpacity>
                </View>

                {/* Edit Profile */}
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => nav.navigate('Onboarding')}
                >
                    <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
                </TouchableOpacity>

                {/* Disconnect */}
                <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
                    <Text style={styles.disconnectBtnText}>Disconnect Wallet</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    content: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 },
    screenTitle: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '900' },
    settingsBtn: { padding: 4 },
    settingsIcon: { fontSize: 22 },
    avatarSection: { alignItems: 'center', gap: 8, paddingVertical: 16 },
    avatarRing: {
        width: 104, height: 104, borderRadius: 52,
        borderWidth: 3, borderColor: COLORS.purple,
        overflow: 'hidden',
        shadowColor: COLORS.purple, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
    },
    avatar: { width: '100%', height: '100%' },
    nameText: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
    countryText: { color: COLORS.textSecondary, fontSize: 14 },
    card: {
        backgroundColor: COLORS.card, borderRadius: 20,
        padding: 16, gap: 12,
        borderWidth: 1, borderColor: COLORS.cardBorder,
    },
    cardTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
    scoreCenter: { alignItems: 'center' },
    streakRow: { alignItems: 'center', gap: 4 },
    streakText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
    streakNote: { color: COLORS.textMuted, fontSize: 12 },
    modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    modePill: {
        backgroundColor: 'rgba(153,69,255,0.15)', borderRadius: 16,
        paddingHorizontal: 14, paddingVertical: 6,
        borderWidth: 1, borderColor: COLORS.purple,
    },
    modePillText: { color: COLORS.purple, fontWeight: '700', fontSize: 13 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tagPill: {
        backgroundColor: COLORS.tagDefault, borderRadius: 12,
        paddingHorizontal: 10, paddingVertical: 5,
    },
    tagPillText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
    nftRow: { gap: 12 },
    walletRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    walletAddr: { flex: 1, color: COLORS.textSecondary, fontSize: 14, fontFamily: 'monospace' },
    copyBtn: { backgroundColor: COLORS.inputBg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.cardBorder },
    copyBtnText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
    solscanBtn: { paddingVertical: 4 },
    solscanText: { color: COLORS.purple, fontSize: 13, fontWeight: '600' },
    editBtn: {
        backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
        alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder,
    },
    editBtnText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
    disconnectBtn: { borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.red },
    disconnectBtnText: { color: COLORS.red, fontWeight: '700', fontSize: 15 },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { color: COLORS.textMuted, fontSize: 15 },
});
