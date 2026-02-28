import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PostCard({ post, colors, t, userEmail, onLike, onDelete, onComment }) {
    const [imageRatio, setImageRatio] = useState(1);
    const isLiked = post.likes && post.likes.includes(userEmail);
    const isOwner = userEmail && post.email === userEmail;

    const likeCount = post.likes ? post.likes.length : 0;
    const commentCount = post._comments ? post._comments.length : (post.comments ? post.comments.length : 0);

    // Fallback to square if size isn't fetched quickly
    const handleImageLoad = (e) => {
        const { width: w, height: h } = e.nativeEvent.source;
        if (w && h) setImageRatio(h / w);
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    {post.foto ? (
                        <Image source={{ uri: post.foto }} style={[styles.avatar, { borderColor: colors.border }]} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: colors.border }]} />
                    )}
                    <View>
                        <View style={styles.nameRow}>
                            <Text style={[styles.name, { color: colors.text }]}>{post.nome}</Text>
                            {post.is_premium && <Ionicons name="checkmark-circle" size={16} color={colors.blue} />}
                            {post.admin && <Ionicons name="shield-checkmark" size={14} color={colors.blue} />}
                        </View>
                        <Text style={[styles.date, { color: colors.textSecondary }]}>
                            {post.date ? new Date(post.date).toLocaleDateString() : 'Recent'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity onPress={isOwner ? () => onDelete(post.id) : null}>
                    <Feather name="more-horizontal" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* ── Image ── */}
            {post.img && (
                <Image
                    source={{ uri: post.img }}
                    style={[styles.image, { aspectRatio: imageRatio }]}
                    resizeMode="cover"
                    onLoad={handleImageLoad}
                />
            )}

            {/* ── Action Bar ── */}
            <View style={styles.actionBar}>
                <View style={styles.actionGroupLeft}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post.id)}>
                        <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={isLiked ? colors.red : colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => { }}>
                        <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => { }}>
                        <Feather name="send" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                    <Feather name="bookmark" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* ── Content (Likes, Desc, Comments) ── */}
            <View style={styles.content}>
                {likeCount > 0 && (
                    <Text style={[styles.likes, { color: colors.text }]}>
                        {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                    </Text>
                )}

                {post.desc ? (
                    <Text style={[styles.desc, { color: colors.text }]}>
                        <Text style={{ fontWeight: '700' }}>{post.nome} </Text>
                        {post.desc}
                    </Text>
                ) : null}

                {commentCount > 0 && (
                    <TouchableOpacity style={{ marginTop: 4 }}>
                        <Text style={[styles.viewComments, { color: colors.textSecondary }]}>
                            Ver todos os {commentCount} comentários
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingBottom: 16,
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
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: StyleSheet.hairlineWidth,
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
        fontSize: 12,
    },
    /* Image */
    image: {
        width: width,      // Edge to Edge
        maxHeight: 600,    // Hard limit height
    },
    /* Actions */
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 8,
    },
    actionGroupLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    actionBtn: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    /* Content */
    content: {
        paddingHorizontal: 12,
    },
    likes: {
        fontWeight: '700',
        fontSize: 14,
        marginBottom: 4,
    },
    desc: {
        fontSize: 14,
        lineHeight: 20,
    },
    viewComments: {
        fontSize: 14,
    }
});
