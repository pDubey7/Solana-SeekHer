import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import type { LookingFor } from '@app-types/index';
import { LOOKING_FOR_MODES } from '@constants/modes';
import { COLORS } from '@constants/colors';

interface Props {
    selected: LookingFor[];
    onChange: (modes: LookingFor[]) => void;
    maxSelect?: number;
}

export default function ProfileModeSelector({ selected, onChange, maxSelect = 4 }: Props) {
    const atLimit = selected.length >= maxSelect;

    const toggle = (label: LookingFor) => {
        if (selected.includes(label)) {
            onChange(selected.filter(m => m !== label));
        } else if (!atLimit) {
            onChange([...selected, label]);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.hint}>Looking for</Text>
                <Text style={styles.count}>{selected.length}/{maxSelect}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {LOOKING_FOR_MODES.map(mode => {
                    const isSelected = selected.includes(mode.label as LookingFor);
                    const isDimmed = atLimit && !isSelected;
                    return (
                        <TouchableOpacity
                            key={mode.id}
                            onPress={() => toggle(mode.label as LookingFor)}
                            activeOpacity={0.75}
                            style={[
                                styles.chip,
                                isSelected
                                    ? { backgroundColor: mode.color, borderColor: mode.color }
                                    : { backgroundColor: COLORS.cardBorder, borderColor: 'transparent' },
                                isDimmed && styles.chipDimmed,
                            ]}
                        >
                            <Text style={styles.emoji}>{mode.emoji}</Text>
                            <Text style={[styles.label, isSelected ? styles.labelSelected : styles.labelUnselected]}>
                                {mode.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            <Text style={styles.sub}>Pick up to {maxSelect}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 8 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    hint: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
    count: { color: COLORS.purple, fontSize: 12, fontWeight: '700' },
    scroll: { gap: 8, paddingVertical: 4, paddingHorizontal: 2 },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 24,
        borderWidth: 1,
    },
    chipDimmed: { opacity: 0.4 },
    emoji: { fontSize: 16 },
    label: { fontSize: 13, fontWeight: '600' },
    labelSelected: { color: '#fff' },
    labelUnselected: { color: COLORS.textSecondary },
    sub: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
});
