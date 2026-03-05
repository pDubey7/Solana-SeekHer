import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Alert,
    Modal,
    FlatList,
    Image,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {
    launchImageLibrary,
} from 'react-native-image-picker';
import type { LookingFor } from '@app-types/index';
import { useUser } from '@context/UserContext';
import { uploadProfilePhoto } from '@services/cloudinary';
import ProfileModeSelector from '@components/ProfileModeSelector';
import VibeTagSelector from '@components/VibeTagSelector';
import NFTBadge from '@components/NFTBadge';
import TokenChip from '@components/TokenChip';
import SeekerScoreRing from '@components/SeekerScoreRing';
import { LOOKING_FOR_MODES } from '@constants/modes';
import { COLORS } from '@constants/colors';

const { width: W } = Dimensions.get('window');

// ─── Country Data ─────────────────────────────────────────────────────────────

const COUNTRIES = [
    { name: 'Nigeria', flag: '🇳🇬' }, { name: 'India', flag: '🇮🇳' },
    { name: 'Philippines', flag: '🇵🇭' }, { name: 'Brazil', flag: '🇧🇷' },
    { name: 'United States', flag: '🇺🇸' }, { name: 'United Kingdom', flag: '🇬🇧' },
    { name: 'Germany', flag: '🇩🇪' }, { name: 'Vietnam', flag: '🇻🇳' },
    { name: 'Indonesia', flag: '🇮🇩' }, { name: 'Turkey', flag: '🇹🇷' },
    { name: 'Argentina', flag: '🇦🇷' }, { name: 'Mexico', flag: '🇲🇽' },
    { name: 'Canada', flag: '🇨🇦' }, { name: 'Singapore', flag: '🇸🇬' },
    { name: 'Japan', flag: '🇯🇵' }, { name: 'South Korea', flag: '🇰🇷' },
    { name: 'UAE', flag: '🇦🇪' }, { name: 'Australia', flag: '🇦🇺' },
];

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({
    photos, setPhotos,
    name, setName,
    age, setAge,
    country, setCountry,
    onNext,
}: {
    photos: string[];
    setPhotos: (p: string[]) => void;
    name: string; setName: (s: string) => void;
    age: string; setAge: (s: string) => void;
    country: string; setCountry: (s: string) => void;
    onNext: () => void;
}) {
    const [countryModal, setCountryModal] = useState(false);
    const [cSearch, setCSearch] = useState('');
    const [uploading, setUploading] = useState(false);

    const filteredCountries = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(cSearch.toLowerCase()),
    );

    const pickPhoto = async (slot: number) => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.85 as 1 });
        if (result.assets?.[0]?.uri) {
            setUploading(true);
            try {
                const url = await uploadProfilePhoto(result.assets[0].uri, `photo_${slot}`);
                const next = [...photos];
                next[slot] = url;
                setPhotos(next);
            } catch {
                Alert.alert('Upload failed', 'Please try again');
            } finally {
                setUploading(false);
            }
        }
    };

    const removePhoto = (slot: number) => {
        const next = [...photos];
        next[slot] = '';
        setPhotos(next);
    };

    const canProceed =
        photos.some(Boolean) &&
        name.trim().length >= 2 &&
        parseInt(age) >= 18 &&
        country.length > 0;

    return (
        <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>Tell us about you</Text>

            {/* Photos */}
            <Text style={styles.fieldLabel}>Photos</Text>
            <View style={styles.photoGrid}>
                {[0, 1, 2, 3].map(i => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.photoSlot, photos[i] ? styles.photoSlotFilled : styles.photoSlotEmpty]}
                        onPress={() => photos[i] ? removePhoto(i) : pickPhoto(i)}
                        disabled={uploading}
                    >
                        {photos[i] ? (
                            <>
                                <Image source={{ uri: photos[i] }} style={styles.photoImg} />
                                <View style={styles.photoX}><Text style={styles.photoXText}>✕</Text></View>
                            </>
                        ) : (
                            <Text style={styles.photoPlus}>+</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Name */}
            <Text style={styles.fieldLabel}>Display Name</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name or alias..."
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
                maxLength={30}
            />

            {/* Age */}
            <Text style={styles.fieldLabel}>Age</Text>
            <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="18+"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
                keyboardType="number-pad"
                maxLength={2}
            />

            {/* Country */}
            <Text style={styles.fieldLabel}>Country</Text>
            <TouchableOpacity style={styles.input} onPress={() => setCountryModal(true)}>
                <Text style={country ? styles.inputText : styles.inputPlaceholder}>
                    {country ? `${COUNTRIES.find(c => c.name === country)?.flag} ${country}` : 'Select your country'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
                disabled={!canProceed}
                onPress={onNext}
            >
                <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>

            {/* Country Modal */}
            <Modal visible={countryModal} transparent animationType="slide">
                <TouchableOpacity style={styles.overlay} onPress={() => setCountryModal(false)} />
                <View style={styles.countrySheet}>
                    <View style={styles.sheetHandle} />
                    <TextInput
                        value={cSearch}
                        onChangeText={setCSearch}
                        placeholder="Search country..."
                        placeholderTextColor={COLORS.textMuted}
                        style={styles.search}
                    />
                    <FlatList
                        data={filteredCountries}
                        keyExtractor={c => c.name}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.countryRow}
                                onPress={() => { setCountry(item.name); setCountryModal(false); }}
                            >
                                <Text style={styles.countryFlag}>{item.flag}</Text>
                                <Text style={[styles.countryName, item.name === country && { color: COLORS.purple }]}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </ScrollView>
    );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function Step2({ modes, setModes, onNext }: {
    modes: LookingFor[];
    setModes: (m: LookingFor[]) => void;
    onNext: () => void;
}) {
    return (
        <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>What are you here for?</Text>
            <Text style={styles.stepSub}>Pick up to 4 — be honest 👀</Text>

            <View style={styles.modeGrid}>
                {LOOKING_FOR_MODES.map(m => {
                    const selected = modes.includes(m.label as LookingFor);
                    const atLimit = modes.length >= 4 && !selected;
                    return (
                        <TouchableOpacity
                            key={m.id}
                            style={[
                                styles.modeCard,
                                selected && { borderColor: m.color, backgroundColor: `${m.color}18` },
                                atLimit && styles.modeCardDimmed,
                            ]}
                            onPress={() => {
                                if (selected) setModes(modes.filter(x => x !== m.label));
                                else if (!atLimit) setModes([...modes, m.label as LookingFor]);
                            }}
                        >
                            <Text style={styles.modeEmoji}>{m.emoji}</Text>
                            <Text style={[styles.modeLabel, selected && { color: m.color }]}>{m.label}</Text>
                            <Text style={styles.modeDesc} numberOfLines={2}>{m.icebreaker?.slice(0, 50) ?? ''}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                style={[styles.nextBtn, modes.length === 0 && styles.nextBtnDisabled]}
                disabled={modes.length === 0}
                onPress={onNext}
            >
                <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function Step3({ tags, setTags, onFinish, loading }: {
    tags: string[];
    setTags: (t: string[]) => void;
    onFinish: () => void;
    loading: boolean;
}) {
    const { user, seekerScore } = useUser();
    return (
        <View style={styles.step3}>
            <Text style={styles.stepTitle}>Your Vibe Check</Text>
            <Text style={styles.stepSub}>Pick up to 8 tags that describe you</Text>

            <VibeTagSelector selected={tags} onChange={setTags} maxSelect={8} />

            {/* Wallet data preview */}
            {user && (
                <View style={styles.walletPreview}>
                    <Text style={styles.walletPreviewTitle}>Auto-detected from your wallet:</Text>
                    {user.pinned_nfts.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                            {user.pinned_nfts.slice(0, 5).map(n => (
                                <NFTBadge key={n.mint} nft={n} size="sm" />
                            ))}
                        </ScrollView>
                    )}
                    {user.tokens.length > 0 && (
                        <View style={styles.tokenRow}>
                            {user.tokens.slice(0, 5).map(t => (
                                <TokenChip key={t.mint} token={t} />
                            ))}
                        </View>
                    )}
                    {seekerScore && (
                        <View style={styles.scoreRow}>
                            <SeekerScoreRing score={seekerScore} size="sm" />
                            <Text style={styles.scoreNote}>Updates as you use Solana</Text>
                        </View>
                    )}
                </View>
            )}

            <TouchableOpacity
                style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
                disabled={loading}
                onPress={onFinish}
            >
                <Text style={styles.nextBtnText}>{loading ? 'Setting up...' : '✨ Finish Setup'}</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Onboarding Root ─────────────────────────────────────────────────────────

export default function OnboardingScreen() {
    const { updateUserProfile } = useUser();
    const [step, setStep] = useState(1);
    const [photos, setPhotos] = useState<string[]>(['', '', '', '']);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [country, setCountry] = useState('');
    const [modes, setModes] = useState<LookingFor[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const finish = async () => {
        setSaving(true);
        try {
            await updateUserProfile({
                display_name: name.trim(),
                age: parseInt(age),
                country,
                photos: photos.filter(Boolean),
                looking_for: modes,
                vibe_tags: tags,
            });
            // AppNavigator watches hasCompletedProfile and redirects automatically
        } catch (e) {
            Alert.alert('Error', 'Could not save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const progress = step / 3;

    return (
        <SafeAreaView style={styles.screen}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Progress bar */}
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                </View>
                <Text style={styles.stepIndicator}>Step {step} of 3</Text>

                {step === 1 && (
                    <Step1
                        photos={photos} setPhotos={setPhotos}
                        name={name} setName={setName}
                        age={age} setAge={setAge}
                        country={country} setCountry={setCountry}
                        onNext={() => setStep(2)}
                    />
                )}
                {step === 2 && <Step2 modes={modes} setModes={setModes} onNext={() => setStep(3)} />}
                {step === 3 && <Step3 tags={tags} setTags={setTags} onFinish={finish} loading={saving} />}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SLOT = (W - 48 - 12) / 2;

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    progressTrack: { height: 3, backgroundColor: COLORS.cardBorder, marginHorizontal: 24, marginTop: 12, borderRadius: 2 },
    progressFill: { height: 3, backgroundColor: COLORS.purple, borderRadius: 2 },
    stepIndicator: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: 6, marginBottom: 2 },
    stepContent: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
    step3: { flex: 1, paddingHorizontal: 24, gap: 12 },
    stepTitle: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '800', marginTop: 8 },
    stepSub: { color: COLORS.textSecondary, fontSize: 15 },
    fieldLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', marginTop: 4 },
    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    photoSlot: { width: SLOT, height: SLOT * 1.1, borderRadius: 16, overflow: 'hidden' },
    photoSlotEmpty: { borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center' },
    photoSlotFilled: { position: 'relative' },
    photoImg: { width: '100%', height: '100%' },
    photoX: {
        position: 'absolute', top: 6, right: 6,
        backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 12,
        width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
    },
    photoXText: { color: '#fff', fontSize: 11, fontWeight: '800' },
    photoPlus: { color: COLORS.textMuted, fontSize: 36, fontWeight: '300' },
    input: {
        backgroundColor: COLORS.inputBg,
        borderWidth: 1, borderColor: COLORS.inputBorder,
        borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
        color: COLORS.textPrimary, fontSize: 15,
        justifyContent: 'center',
    },
    inputText: { color: COLORS.textPrimary, fontSize: 15 },
    inputPlaceholder: { color: COLORS.textMuted, fontSize: 15 },
    nextBtn: { backgroundColor: COLORS.purple, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
    nextBtnDisabled: { opacity: 0.4 },
    nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    overlay: { flex: 1, backgroundColor: COLORS.overlay },
    countrySheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '65%' },
    sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.cardBorder, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
    search: { backgroundColor: COLORS.inputBg, borderRadius: 10, padding: 10, color: COLORS.textPrimary, marginBottom: 8 },
    countryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
    countryFlag: { fontSize: 22 },
    countryName: { color: COLORS.textPrimary, fontSize: 15 },
    modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    modeCard: {
        width: (W - 60) / 2, borderRadius: 16,
        backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder,
        padding: 14, gap: 4, alignItems: 'center',
    },
    modeCardDimmed: { opacity: 0.4 },
    modeEmoji: { fontSize: 30 },
    modeLabel: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 13, textAlign: 'center' },
    modeDesc: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 14 },
    walletPreview: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
    walletPreviewTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    row: { gap: 8 },
    tokenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    scoreNote: { color: COLORS.textMuted, fontSize: 12, flex: 1 },
});
