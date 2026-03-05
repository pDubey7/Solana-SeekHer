import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { format } from 'date-fns';
import { useWallet } from '@context/WalletContext';
import { useUser } from '@context/UserContext';
import { getMessages, sendMessage } from '@services/neon';
import { sendSOLTip, initConnection } from '@services/solana';
import { useAppNavigation, useAppRoute } from '@navigation/types';
import { LOOKING_FOR_MODES } from '@constants/modes';
import { COLORS } from '@constants/colors';
import type { Message } from '@app-types/index';
import { FIRST_MESSAGE_SOL_COST } from '@constants/config';

const POLL_INTERVAL = 3000;

export default function ChatScreen() {
    const nav = useAppNavigation();
    const route = useAppRoute<'Chat'>();
    const { matchId, matchedUser } = route.params;

    const { walletAddress, signTransaction } = useWallet();
    const { user } = useUser();

    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [showBanner, setShowBanner] = useState(true);
    const [confirmModal, setConfirmModal] = useState(false);
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const pendingText = useRef('');
    const listRef = useRef<FlatList>(null);

    const isFirstMessage = messages.length === 0;

    const loadMessages = useCallback(async () => {
        const msgs = await getMessages(matchId);
        setMessages(msgs);
    }, [matchId]);

    useEffect(() => {
        void loadMessages();
        const id = setInterval(loadMessages, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [loadMessages]);

    // Get SOL balance for confirmation modal
    useEffect(() => {
        if (!walletAddress) return;
        (async () => {
            const conn = initConnection();
            const { PublicKey } = await import('@solana/web3.js');
            const bal = await conn.getBalance(new PublicKey(walletAddress));
            setSolBalance(bal / 1e9);
        })();
    }, [walletAddress]);

    const handleSend = async () => {
        if (!text.trim()) return;
        if (isFirstMessage) {
            pendingText.current = text;
            setConfirmModal(true);
            return;
        }
        await doSend(text);
    };

    const doSend = async (content: string, txSig?: string) => {
        if (!walletAddress) return;
        setSending(true);
        try {
            await sendMessage(
                matchId,
                walletAddress,
                content.trim(),
                messages.length === 0,
                txSig ? FIRST_MESSAGE_SOL_COST : 0,
                txSig,
            );
            setText('');
            await loadMessages();
            listRef.current?.scrollToEnd({ animated: true });
        } finally {
            setSending(false);
        }
    };

    const handleConfirmFirstMessage = async () => {
        setConfirmModal(false);
        setSending(true);
        try {
            const conn = initConnection();
            const { PublicKey, Transaction, SystemProgram } = await import('@solana/web3.js');
            const tx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(walletAddress!),
                    toPubkey: new PublicKey(matchedUser.wallet_address),
                    lamports: FIRST_MESSAGE_SOL_COST * 1e9,
                }),
            );
            const { blockhash } = await conn.getLatestBlockhash('confirmed');
            tx.recentBlockhash = blockhash;
            tx.feePayer = new PublicKey(walletAddress!);
            const signed = await signTransaction(tx);
            const sig = await conn.sendRawTransaction(signed.serialize());
            await doSend(pendingText.current, sig);
        } catch (e: any) {
            Alert.alert('Transaction failed', e?.message ?? 'Please try again');
        } finally {
            setSending(false);
        }
    };

    // Icebreaker suggestion
    const matchMode = matchedUser.looking_for[0];
    const modeData = LOOKING_FOR_MODES.find(m => m.label === matchMode);
    const icebreaker = modeData?.icebreaker?.replace('[shared NFT]', matchedUser.pinned_nfts[0]?.collection ?? 'your NFT') ?? '';

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isMine = item.sender === walletAddress;
        const prev = messages[index - 1];
        const showTime = !prev || new Date(item.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60 * 1000;

        return (
            <View>
                {showTime && (
                    <Text style={styles.timeLabel}>{format(new Date(item.created_at), 'h:mm a')}</Text>
                )}
                <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                        {item.content}
                    </Text>
                    {item.is_first_message && item.sol_tip > 0 && (
                        <View style={styles.tipTag}>
                            <Text style={styles.tipTagText}>◎ 0.001 SOL sent ✅</Text>
                            {item.tx_signature && (
                                <Text style={styles.tipTx}>{item.tx_signature.slice(0, 8)}...</Text>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <FastImage source={{ uri: matchedUser.photos[0] }} style={styles.avatar} resizeMode={FastImage.resizeMode.cover} />
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>{matchedUser.display_name}</Text>
                    <Text style={styles.headerScore}>💜 {matchedUser.seeker_score} Seeker Score</Text>
                </View>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* First message banner */}
                {showBanner && isFirstMessage && (
                    <View style={styles.banner}>
                        <View style={styles.bannerContent}>
                            <Text style={styles.bannerText}>
                                💸 First message costs 0.001 SOL — goes directly to {matchedUser.display_name}, not us. Keeps SeekHer spam-free.
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowBanner(false)}>
                            <Text style={styles.bannerX}>✕</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Messages */}
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={m => m.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => listRef.current?.scrollToEnd()}
                    ListEmptyComponent={
                        icebreaker ? (
                            <View style={styles.icebreakerCard}>
                                <Text style={styles.icebreakerLabel}>💡 Suggested opener:</Text>
                                <Text style={styles.icebreakerText}>{icebreaker}</Text>
                                <TouchableOpacity onPress={() => setText(icebreaker)}>
                                    <Text style={styles.icebreakerUse}>Use this →</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />

                {/* Input bar */}
                <View style={styles.inputBar}>
                    <TextInput
                        value={text}
                        onChangeText={setText}
                        placeholder={isFirstMessage ? `Say something to ${matchedUser.display_name}...` : 'Message...'}
                        placeholderTextColor={COLORS.textMuted}
                        style={styles.input}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={sending || !text.trim()}
                        style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
                    >
                        <Text style={styles.sendIcon}>▲</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* First-message confirmation modal */}
            <Modal visible={confirmModal} transparent animationType="slide">
                <TouchableOpacity style={styles.overlay} onPress={() => setConfirmModal(false)} />
                <View style={styles.confirmSheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.confirmTitle}>Send 0.001 SOL to unlock chat?</Text>
                    <Text style={styles.confirmSub}>
                        This goes to {matchedUser.display_name}, not SeekHer.
                    </Text>
                    {solBalance !== null && (
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>Your balance</Text>
                            <Text style={styles.balanceValue}>◎ {solBalance.toFixed(4)} SOL</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmFirstMessage}>
                        <Text style={styles.confirmBtnText}>Confirm & Send 💸</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmModal(false)}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
    },
    backBtn: { padding: 4 },
    backText: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' },
    avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: COLORS.purple },
    headerInfo: { flex: 1 },
    headerName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
    headerScore: { color: COLORS.textMuted, fontSize: 12 },
    banner: {
        backgroundColor: 'rgba(255,200,0,0.12)', borderWidth: 1, borderColor: '#FFD700',
        marginHorizontal: 16, marginTop: 8, borderRadius: 12,
        flexDirection: 'row', alignItems: 'flex-start', padding: 12, gap: 8,
    },
    bannerContent: { flex: 1 },
    bannerText: { color: '#FFD700', fontSize: 12, lineHeight: 18 },
    bannerX: { color: COLORS.textMuted, fontSize: 16, paddingLeft: 4 },
    messageList: { padding: 16, gap: 4, flexGrow: 1 },
    timeLabel: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', marginVertical: 8 },
    bubble: {
        maxWidth: '78%', borderRadius: 18, padding: 12,
        marginVertical: 2,
    },
    bubbleMine: { alignSelf: 'flex-end', backgroundColor: COLORS.purple, borderBottomRightRadius: 5 },
    bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: COLORS.card, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: COLORS.cardBorder },
    bubbleText: { fontSize: 15, lineHeight: 22 },
    bubbleTextMine: { color: '#fff' },
    bubbleTextTheirs: { color: COLORS.textPrimary },
    tipTag: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', gap: 2 },
    tipTagText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
    tipTx: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
    icebreakerCard: { margin: 16, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.cardBorder, gap: 8 },
    icebreakerLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
    icebreakerText: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 22 },
    icebreakerUse: { color: COLORS.purple, fontWeight: '700', fontSize: 13 },
    inputBar: {
        flexDirection: 'row', gap: 8, padding: 12,
        borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1, backgroundColor: COLORS.inputBg,
        borderWidth: 1, borderColor: COLORS.inputBorder,
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
        color: COLORS.textPrimary, fontSize: 15, maxHeight: 100,
    },
    sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.purple, alignItems: 'center', justifyContent: 'center' },
    sendBtnDisabled: { opacity: 0.4 },
    sendIcon: { color: '#fff', fontSize: 16, fontWeight: '800' },
    overlay: { flex: 1, backgroundColor: COLORS.overlay },
    confirmSheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
    sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.cardBorder, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
    confirmTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800' },
    confirmSub: { color: COLORS.textSecondary, fontSize: 14 },
    balanceRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.inputBg, borderRadius: 10, padding: 12 },
    balanceLabel: { color: COLORS.textSecondary, fontSize: 13 },
    balanceValue: { color: COLORS.green, fontWeight: '800', fontSize: 14 },
    confirmBtn: { backgroundColor: COLORS.purple, borderRadius: 14, padding: 16, alignItems: 'center' },
    confirmBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    cancelBtn: { borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
    cancelBtnText: { color: COLORS.textSecondary, fontWeight: '700' },
});
