import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CATEGORY_COLORS = {
    'Perdidos': '#ef4444',
    'Encontrados': '#22c55e',
    'Adoção': '#3b82f6',
};

const CATEGORY_EMOJI = {
    'Perdidos': '🔍',
    'Encontrados': '✅',
    'Adoção': '💛',
};

export default function PostCard({ post, colors, t, userEmail, onLike, onDelete, onComment }) {
    const [imageRatio, setImageRatio] = useState(1);
    const isLiked = post.likes && post.likes.includes(userEmail);
    const isOwner = userEmail && post.email === userEmail;

    const likeCount = post.likes ? post.likes.length : 0;
    const commentCount = post._comments ? post._comments.length : (post.comments ? post.comments.length : 0);
    const catColor = CATEGORY_COLORS[post.cat] || colors.blue;
    const catEmoji = CATEGORY_EMOJI[post.cat] || '📌';

    const handleImageLoad = (e) => {
        const { width: w, height: h } = e.nativeEvent.source;
        if (w && h) setImageRatio(h / w);
    };

    return (
        <View style={[styles.cardOuter]}>
            <View style={[styles.card, { backgroundColor: colors.cardBg || colors.bg, borderColor: colors.border }]}>

                {/* ── Category Tag ── */}
                {post.cat && (
                    <View style={[styles.categoryTag, { backgroundColor: catColor + '18' }]}>
                        <Text style={{ fontSize: 11 }}>{catEmoji}</Text>
                        <Text style={[styles.categoryTagText, { color: catColor }]}>
                            {t[post.cat] || post.cat}
                        </Text>
                        {post.sub && (
                            <Text style={[styles.categorySubText, { color: catColor, opacity: 0.7 }]}>
                                • {post.sub}
                            </Text>
                        )}
                    </View>
                )}

                {/* ── Header ── */}
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={[styles.avatarRing, { borderColor: catColor }]}>
                            {post.foto ? (
                                <Image source={{ uri: post.foto }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, { backgroundColor: colors.border }]} />
                            )}
                        </View>
                        <View>
                            <View style={styles.nameRow}>
                                <Text style={[styles.name, { color: colors.text }]}>{post.nome}</Text>
                                {post.is_premium && <Ionicons name="checkmark-circle" size={16} color={colors.blue} />}
                                {post.admin && <Ionicons name="shield-checkmark" size={14} color={colors.blue} />}
                            </View>
                            <Text style={[styles.date, { color: colors.textSecondary }]}>
                                {post.date ? new Date(post.date).toLocaleDateString() : 'Recente'}
                            </Text>
                        </View>
                    </View>

                    {isOwner && (
                        <TouchableOpacity onPress={() => onDelete(post.id)} style={styles.moreBtn}>
                            <Feather name="trash-2" size={18} color={colors.red} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Description (above image) ── */}
                {post.desc ? (
                    <View style={styles.descAbove}>
                        <Text style={[styles.desc, { color: colors.text }]}>
                            {post.desc}
                        </Text>
                    </View>
                ) : null}

                {/* ── Image ── */}
                {post.img && (
                    <View style={styles.imageWrap}>
                        <Image
                            source={{ uri: post.img }}
                            style={[styles.image, { aspectRatio: 1 / imageRatio }]}
                            resizeMode="cover"
                            onLoad={handleImageLoad}
                        />
                    </View>
                )}

                {/* ── Action Bar ── */}
                <View style={styles.actionBar}>
                    <View style={styles.actionGroupLeft}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post.id)}>
                            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? colors.red : colors.textSecondary} />
                            {likeCount > 0 && <Text style={[styles.actionCount, { color: isLiked ? colors.red : colors.textSecondary }]}>{likeCount}</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => { }}>
                            <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} />
                            {commentCount > 0 && <Text style={[styles.actionCount, { color: colors.textSecondary }]}>{commentCount}</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => { }}>
                            <Feather name="share" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Feather name="bookmark" size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardOuter: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    /* Category Tag */
    categoryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 12,
        marginTop: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    categoryTagText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    categorySubText: {
        fontSize: 11,
        fontWeight: '600',
    },
    /* Header */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatarRing: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    name: {
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.1,
    },
    date: {
        fontSize: 11,
        marginTop: 1,
    },
    moreBtn: {
        padding: 8,
        borderRadius: 20,
    },
    /* Description */
    descAbove: {
        paddingHorizontal: 12,
        paddingBottom: 8,
    },
    desc: {
        fontSize: 14,
        lineHeight: 20,
    },
    /* Image */
    imageWrap: {
        marginHorizontal: 0,
    },
    image: {
        width: '100%',
        maxHeight: 500,
    },
    /* Actions */
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    actionGroupLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionCount: {
        fontSize: 13,
        fontWeight: '600',
    },
});
