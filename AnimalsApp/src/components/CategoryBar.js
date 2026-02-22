import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';

export default function CategoryBar({ categories, active, onSelect, colors, t }) {
    const catKeys = ['Tudo', ...Object.keys(categories)];

    // Placeholder images for the "Stories" circles
    const catThumbs = {
        'Tudo': 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=100&q=80',
        'Cachorro': 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=100&q=80',
        'Gato': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&q=80',
        'Aves': 'https://images.unsplash.com/photo-1552728089-57105a8e7ad4?w=100&q=80',
        'Outros': 'https://images.unsplash.com/photo-1425082661705-1834bfd0999c?w=100&q=80'
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {catKeys.map(cat => {
                    const isActive = active === cat;
                    return (
                        <TouchableOpacity
                            key={cat}
                            style={styles.storyItem}
                            onPress={() => onSelect(cat)}
                        >
                            <View style={[
                                styles.storyRing,
                                { borderColor: isActive ? colors.blue : colors.border }
                            ]}>
                                <Image
                                    source={{ uri: catThumbs[cat] || catThumbs['Tudo'] }}
                                    style={styles.storyImage}
                                />
                            </View>
                            <Text style={[
                                styles.storyText,
                                { color: isActive ? colors.text : colors.textSecondary },
                                isActive && { fontWeight: '700' }
                            ]}>
                                {cat === 'Tudo' ? 'Tudo' : (t[cat] || cat)}
                            </Text>
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
        paddingVertical: 12,
    },
    scroll: {
        paddingHorizontal: 12,
        gap: 16,
    },
    storyItem: {
        alignItems: 'center',
        width: 64,
    },
    storyRing: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    storyImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    storyText: {
        marginTop: 6,
        fontSize: 11,
        textAlign: 'center',
    }
});
