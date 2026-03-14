import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';

const CATEGORY_CONFIG = {
    'Tudo': {
        emoji: '🌍',
        thumb: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=100&q=80',
        color: null, // uses default blue
    },
    'Perdidos': {
        emoji: '🔍',
        thumb: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&q=80',
        color: '#ef4444',
    },
    'Encontrados': {
        emoji: '✅',
        thumb: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&q=80',
        color: '#22c55e',
    },
    'Adoção': {
        emoji: '💛',
        thumb: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80',
        color: '#3b82f6',
    },
};

export default function CategoryBar({ categories, active, onSelect, colors, t }) {
    const catKeys = ['Tudo', ...Object.keys(categories)];

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {catKeys.map(cat => {
                    const isActive = active === cat;
                    const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG['Tudo'];
                    const ringColor = isActive ? (config.color || colors.blue) : colors.border;

                    return (
                        <TouchableOpacity
                            key={cat}
                            style={styles.storyItem}
                            onPress={() => onSelect(cat)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.storyRing,
                                { borderColor: ringColor },
                                isActive && styles.storyRingActive,
                            ]}>
                                <Image
                                    source={{ uri: config.thumb }}
                                    style={styles.storyImage}
                                />
                            </View>
                            <View style={styles.labelRow}>
                                <Text style={{ fontSize: 10 }}>{config.emoji}</Text>
                                <Text style={[
                                    styles.storyText,
                                    { color: isActive ? colors.text : colors.textSecondary },
                                    isActive && { fontWeight: '700' }
                                ]}>
                                    {cat === 'Tudo' ? (t.all || 'Tudo') : (t[cat] || cat)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingVertical: 14,
    },
    scroll: {
        paddingHorizontal: 16,
        gap: 14,
    },
    storyItem: {
        alignItems: 'center',
        width: 72,
    },
    storyRing: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 2.5,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    storyRingActive: {
        shadowColor: '#1d9bf0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    storyImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: 6,
    },
    storyText: {
        fontSize: 11,
        textAlign: 'center',
    }
});
