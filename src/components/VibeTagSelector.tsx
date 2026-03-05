import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { VIBE_TAGS, VIBE_TAGS_FLAT, type TagCategory, type VibeTag } from '@constants/tags';
import { COLORS } from '@constants/colors';

interface Props {
    selected: string[];
    onChange: (tags: string[]) => void;
    maxSelect?: number;
}

const CATEGORIES: TagCategory[] = ['Niches', 'Roles', 'Community', 'Vibe'];

export default function VibeTagSelector({ selected, onChange, maxSelect = 8 }: Props) {
    const [query, setQuery] = useState('');
    const atLimit = selected.length >= maxSelect;

    const filtered = useMemo(() => {
        if (!query.trim()) return null;
        const q = query.toLowerCase();
        return VIBE_TAGS_FLAT.filter(t => t.label.toLowerCase().includes(q));
    }, [query]);

    const toggle = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter(s => s !== id));
        } else if (!atLimit) {
            onChange([...selected, id]);
        }
    };

    const renderTag = (tag: VibeTag) => {
        const isSelected = selected.includes(tag.id);
        const isDimmed = atLimit && !isSelected;
        return (
            <TouchableOpacity
                key={tag.id}
                onPress={() => toggle(tag.id)}
                activeOpacity={0.7}
                style={[
                    styles.tag,
                    isSelected && styles.tagSelected,
                    tag.isRare && styles.tagRare,
                    isDimmed && styles.tagDimmed,
                ]}
            >
                <Text style={[styles.tagText, isSelected && styles.tagTextSelected, tag.isRare && styles.tagTextRare]}>
                    {tag.isRare ? '⭐' : ''}{tag.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Search */}
            <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search tags..."
                placeholderTextColor={COLORS.textMuted}
                style={styles.search}
            />
            {/* Counter */}
            <View style={styles.counter}>
                <Text style={styles.counterText}>{selected.length}/{maxSelect} selected</Text>
                {atLimit && <Text style={styles.limitText}>Limit reached</Text>}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Search results */}
                {filtered ? (
                    <View style={styles.tagRow}>
                        {filtered.map(renderTag)}
                    </View>
                ) : (
                    CATEGORIES.map(cat => (
                        <View key={cat} style={styles.section}>
                            <Text style={styles.catHeader}>{cat.toUpperCase()}</Text>
                            <View style={styles.tagRow}>
                                {VIBE_TAGS[cat].map(renderTag)}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, gap: 12 },
    search: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.textPrimary, fontSize: 14 },
    counter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    counterText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
    limitText: { color: COLORS.bearish, fontSize: 12, fontWeight: '700' },
    section: { marginBottom: 16 },
    catHeader: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
        backgroundColor: COLORS.tagDefault,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    tagSelected: { backgroundColor: COLORS.tagActive, borderColor: COLORS.purple },
    tagRare: { borderColor: COLORS.tagRare, backgroundColor: 'rgba(255,215,0,0.08)' },
    tagDimmed: { opacity: 0.4 },
    tagText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
    tagTextSelected: { color: '#fff' },
    tagTextRare: { color: COLORS.tagRare },
});
