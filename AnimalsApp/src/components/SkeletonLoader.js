import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function SkeletonLoader({ colors, count = 3 }) {
    const animValue = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animValue, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(animValue, { toValue: 0.3, duration: 800, useNativeDriver: true })
            ])
        ).start();
    }, [animValue]);

    const items = Array.from({ length: count }, (_, i) => i);

    return (
        <View style={styles.container}>
            {items.map(i => (
                <Animated.View key={i} style={[styles.skeletonCard, { backgroundColor: colors.bg, borderBottomColor: colors.border, opacity: animValue }]}>
                    <View style={styles.header}>
                        <View style={[styles.avatar, { backgroundColor: colors.border }]} />
                        <View style={styles.textStack}>
                            <View style={[styles.name, { backgroundColor: colors.border }]} />
                            <View style={[styles.sub, { backgroundColor: colors.border }]} />
                        </View>
                    </View>
                    <View style={[styles.image, { backgroundColor: colors.border }]} />
                    <View style={{ padding: 12, gap: 10 }}>
                        <View style={[styles.action, { backgroundColor: colors.border }]} />
                        <View style={[styles.descLine, { backgroundColor: colors.border }]} />
                        <View style={[styles.descLine, { backgroundColor: colors.border, width: '60%' }]} />
                    </View>
                </Animated.View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 0
    },
    skeletonCard: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingBottom: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 10
    },
    avatar: { width: 36, height: 36, borderRadius: 18 },
    textStack: { gap: 6 },
    name: { height: 14, width: 100, borderRadius: 4 },
    sub: { height: 10, width: 60, borderRadius: 3 },
    image: { width: width, height: width },
    action: { height: 20, width: 80, borderRadius: 4 },
    descLine: { height: 12, width: '90%', borderRadius: 4 }
});
