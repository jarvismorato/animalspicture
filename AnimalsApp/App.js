import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Image, StyleSheet,
  Alert, ScrollView, Modal, RefreshControl, ActivityIndicator, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

import { Colors } from './src/constants/Colors';
import { CATEGORIAS, TRANSLATIONS } from './src/constants/Data';
import * as API from './src/services/api';

import PostCard from './src/components/PostCard';
import SkeletonLoader from './src/components/SkeletonLoader';
import CategoryBar from './src/components/CategoryBar';

const { width } = Dimensions.get('window');

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

function MainApp() {
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('pt');
  const [user, setUser] = useState({ nome: '', foto: '', email: '' });
  const [activeTab, setActiveTab] = useState('feed');
  const [appError, setAppError] = useState(null);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState('newest');
  const [category, setCategory] = useState('Tudo');

  const [desc, setDesc] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [serverUrl, setServerUrl] = useState('');

  const colors = Colors[theme] || Colors.dark;
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

  useEffect(() => {
    loadSavedData().catch(e => {
      console.error('Error loading config', e);
      setAppError('Failed to load settings: ' + e.message);
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'feed') {
      loadFeed(true).catch(e => console.error('Error loading feed on start', e));
    }
  }, [sort, activeTab]);

  const loadSavedData = async () => {
    const savedTheme = await AsyncStorage.getItem('theme');
    const savedLang = await AsyncStorage.getItem('lang');
    const savedUser = await AsyncStorage.getItem('user');
    const savedServer = await AsyncStorage.getItem('serverUrl');

    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLang(savedLang);
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedServer) {
      setServerUrl(savedServer);
      API.setServerUrl(savedServer);
    }
  };

  const loadFeed = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      const p = reset ? 1 : page;
      const data = await API.getPosts(p, sort);

      if (!data || !data.posts) {
        throw new Error("Invalid format from server");
      }

      const postsWithComments = await Promise.all(
        data.posts.map(async (post) => {
          try {
            const comments = await API.getComments(post.id);
            return { ...post, _comments: comments };
          } catch (e) {
            console.error("Failed to load comments for post", post.id);
            return { ...post, _comments: [] };
          }
        })
      );

      setPosts(prev => reset ? postsWithComments : [...prev, ...postsWithComments]);
      setHasMore(!!data.hasMore);
    } catch (error) {
      console.error("Feed load error", error);
      Alert.alert("Erro", "Falha ao baixar o feed de imagens.");
      if (reset) setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed(true);
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    setPage(prev => prev + 1);
    loadFeed(false);
  };

  const handleLike = async (postId) => {
    if (!user.email) return Alert.alert('Login', t.login);
    await API.toggleLike(postId, user.email);
    loadFeed(true);
  };

  const handleDelete = async (postId) => {
    await API.deletePost(postId, user.email);
    loadFeed(true);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permissão', 'Acesso negado');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const publishPost = async () => {
    if (!user.email) return Alert.alert('Login', t.loginPrompt);
    if (!imageBase64 || !selectedCat || !selectedBreed || !desc.trim()) {
      return Alert.alert('⚠️', t.imageRequired);
    }

    setPublishing(true);
    try {
      const imgUrl = await API.uploadImage(imageBase64, user.email);
      if (!imgUrl) throw new Error("Image upload failed");

      const post = {
        id: 'post_' + Date.now(),
        nome: user.nome,
        foto: user.foto,
        email: user.email,
        desc: desc.trim(),
        img: imgUrl,
        cat: selectedCat,
        sub: selectedBreed,
        likes: [],
        comments: [],
        date: new Date().toISOString(),
      };

      const ok = await API.createPost(post, user.email);
      if (ok) {
        Alert.alert('✅', t.postCreated);
        setDesc('');
        setSelectedCat('');
        setSelectedBreed('');
        setImageUri(null);
        setImageBase64(null);
        setActiveTab('feed');
        loadFeed(true);
      } else {
        throw new Error("Create post failed");
      }
    } catch (e) {
      Alert.alert('Erro', t.noServer);
    } finally {
      setPublishing(false);
    }
  };

  const handleSimpleLogin = async () => {
    if (!loginName.trim() || !loginEmail.trim()) {
      return Alert.alert('Erro', 'Preencha nome e email');
    }
    const userData = {
      nome: loginName.trim(),
      email: loginEmail.trim().toLowerCase(),
      foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(loginName.trim())}&background=${colors.green.replace('#', '')}&color=fff`,
    };
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setShowLogin(false);
  };

  const filteredPosts = category === 'Tudo' ? posts : posts.filter(p => p.cat === category);

  const renderFeed = () => (
    <View style={{ flex: 1 }}>
      <CategoryBar categories={CATEGORIAS} active={category} onSelect={setCategory} colors={colors} t={t} />

      {loading ? (
        <SkeletonLoader colors={colors} count={3} />
      ) : (
        <FlatList
          data={[...filteredPosts]}
          keyExtractor={item => item?.id || Math.random().toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PostCard post={item} colors={colors} t={t} userEmail={user.email} onLike={handleLike} onDelete={handleDelete} onComment={() => { }} />
          )}
          ListFooterComponent={hasMore ? (
            <TouchableOpacity style={[styles.loadMoreBtn, { borderColor: colors.border }]} onPress={loadMore}>
              <Text style={[styles.loadMoreText, { color: colors.blue }]}>{t.loadMore}</Text>
            </TouchableOpacity>
          ) : <View style={{ height: 40 }} />}
        />
      )}
    </View>
  );

  const renderNewPost = () => (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Sleek top header for new post */}
      <View style={[styles.newPostHeader, { borderBottomColor: colors.border }]}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{t.newPost}</Text>
        <TouchableOpacity onPress={publishPost} disabled={publishing}>
          {publishing ? <ActivityIndicator color={colors.blue} /> : <Text style={{ color: colors.blue, fontWeight: 'bold', fontSize: 16 }}>{t.publish}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {!user.email ? (
          <View style={[styles.loginPrompt, { backgroundColor: colors.inputBg }]}>
            <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 12 }}>Faça login para publicar!</Text>
            <TouchableOpacity style={[styles.greenBtn, { backgroundColor: colors.blue }]} onPress={() => setShowLogin(true)}>
              <Text style={styles.greenBtnText}>{t.login}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <Image source={{ uri: user.foto }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              <TextInput
                style={[styles.inputNoBorder, { color: colors.text, flex: 1 }]}
                placeholder={t.descPlace}
                placeholderTextColor={colors.textSecondary}
                value={desc}
                onChangeText={setDesc}
                multiline
                autoFocus
              />
            </View>

            {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />}

            <View style={styles.optionsList}>
              <TouchableOpacity style={styles.optionRowLink} onPress={pickImage}>
                <Feather name="image" size={20} color={colors.blue} />
                <Text style={{ color: colors.text, fontSize: 16 }}>Escolher da {t.gallery}</Text>
              </TouchableOpacity>
            </View>

            {/* Stories Style Category Picker */}
            <Text style={{ color: colors.textSecondary, marginBottom: 8, marginTop: 16, fontWeight: '600' }}>{t.category}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {Object.keys(CATEGORIAS).map(cat => (
                <TouchableOpacity key={cat} style={[styles.pillBtn, selectedCat === cat && { backgroundColor: colors.blue, borderColor: colors.blue }, { borderColor: colors.border }]} onPress={() => { setSelectedCat(cat); setSelectedBreed(''); }}>
                  <Text style={{ color: selectedCat === cat ? '#fff' : colors.textSecondary, fontWeight: '600' }}>{t[cat] || cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedCat ? (
              <>
                <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: '600' }}>{t.breed}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {CATEGORIAS[selectedCat].map(breed => (
                    <TouchableOpacity key={breed} style={[styles.pillBtn, selectedBreed === breed && { backgroundColor: colors.blue, borderColor: colors.blue }, { borderColor: colors.border }]} onPress={() => setSelectedBreed(breed)}>
                      <Text style={{ color: selectedBreed === breed ? '#fff' : colors.textSecondary, fontWeight: '600' }}>{breed}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <View style={{ height: 60 }} />
          </>
        )}
      </ScrollView>
    </View>
  );

  const renderSettings = () => (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: colors.bg }}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>{t.settings}</Text>

      {user.email && (
        <View style={[styles.settingsCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Image source={{ uri: user.foto }} style={{ width: 60, height: 60, borderRadius: 30 }} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{user.nome}</Text>
          <Text style={{ color: colors.textSecondary }}>{user.email}</Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.theme.toUpperCase()}</Text>
      <View style={styles.settingsGroupList}>
        <TouchableOpacity style={[styles.settingListItem]} onPress={() => { setTheme('dark'); AsyncStorage.setItem('theme', 'dark'); }}>
          <Text style={{ color: colors.text, fontSize: 16 }}>{t.dark} (OLED)</Text>
          {theme === 'dark' && <Ionicons name="checkmark" size={20} color={colors.blue} />}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingListItem, { borderBottomWidth: 0 }]} onPress={() => { setTheme('light'); AsyncStorage.setItem('theme', 'light'); }}>
          <Text style={{ color: colors.text, fontSize: 16 }}>{t.light}</Text>
          {theme === 'light' && <Ionicons name="checkmark" size={20} color={colors.blue} />}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>{t.server.toUpperCase()}</Text>
      <View style={[styles.settingsGroupList]}>
        <TextInput
          style={[styles.inputNoBorder, { color: colors.text, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0 }]}
          placeholder={t.serverPlace}
          placeholderTextColor={colors.textSecondary}
          value={serverUrl}
          onChangeText={setServerUrl}
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity style={[styles.greenBtn, { backgroundColor: colors.blue, marginTop: 12 }]} onPress={() => { API.setServerUrl(serverUrl); AsyncStorage.setItem('serverUrl', serverUrl); Alert.alert('✅', 'Salvo!'); loadFeed(true); }}>
        <Text style={styles.greenBtnText}>{t.save}</Text>
      </TouchableOpacity>

      {user.email && (
        <TouchableOpacity style={[styles.greenBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.red, marginTop: 30 }]} onPress={() => { setUser({ nome: '', foto: '', email: '' }); AsyncStorage.removeItem('user'); }}>
          <Text style={[styles.greenBtnText, { color: colors.red }]}>{t.logout}</Text>
        </TouchableOpacity>
      )}
      <View style={{ height: 60 }} />
    </ScrollView>
  );

  if (appError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#ff5555', fontSize: 18 }}>Error: {appError}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ExpoStatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.bg} />

      {/* ── Top Header ── */}
      {activeTab !== 'newPost' && (
        <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
          <Text style={[styles.logoText, { color: colors.text, fontFamily: 'sans-serif-medium' }]}>Animals Picture</Text>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => { setSort(sort === 'newest' ? 'likes' : 'newest') }}>
              <Feather name="bar-chart-2" size={24} color={sort === 'likes' ? colors.blue : colors.text} />
            </TouchableOpacity>
            {user.email ? (
              <TouchableOpacity onPress={() => setActiveTab('settings')}><Image source={{ uri: user.foto }} style={styles.headerAvatar} /></TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setShowLogin(true)}><Text style={{ color: colors.blue, fontWeight: '700' }}>{t.login}</Text></TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── Main Content ── */}
      <View style={{ flex: 1 }}>
        {activeTab === 'feed' && renderFeed()}
        {activeTab === 'newPost' && renderNewPost()}
        {activeTab === 'settings' && renderSettings()}
      </View>

      {/* ── Bottom Tab Bar (X / Instagram style) ── */}
      <View style={[styles.tabBar, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('feed')}>
          {activeTab === 'feed' ? <Ionicons name="home" size={28} color={colors.text} /> : <Ionicons name="home-outline" size={28} color={colors.textSecondary} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => { }}>
          <Ionicons name="search-outline" size={28} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('newPost')}>
          {activeTab === 'newPost' ? <Ionicons name="add-circle" size={32} color={colors.text} /> : <Ionicons name="add-circle-outline" size={32} color={colors.textSecondary} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => { }}>
          <Ionicons name="notifications-outline" size={28} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('settings')}>
          <Ionicons name="person-outline" size={28} color={activeTab === 'settings' ? colors.text : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Modal visible={showLogin} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Feather name="twitter" size={32} color={colors.text} style={{ marginBottom: 12 }} />
              <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Entrar no Animals Picture</Text>
            </View>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.textSecondary} placeholder={t.name} value={loginName} onChangeText={setLoginName} />
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.textSecondary} placeholder={t.email} value={loginEmail} onChangeText={setLoginEmail} keyboardType="email-address" autoCapitalize="none" />
            <TouchableOpacity style={[styles.greenBtn, { backgroundColor: colors.blue, marginTop: 10 }]} onPress={handleSimpleLogin}><Text style={styles.greenBtnText}>{t.login}</Text></TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setShowLogin(false)}><Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  logoText: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  headerAvatar: { width: 30, height: 30, borderRadius: 15 },
  newPostHeader: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },

  loadMoreBtn: { padding: 14, alignItems: 'center', marginVertical: 20 },
  loadMoreText: { fontWeight: '600', fontSize: 15 },

  tabBar: { flexDirection: 'row', height: 54, alignItems: 'center', justifyContent: 'space-around', borderTopWidth: StyleSheet.hairlineWidth },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 10 },

  screenTitle: { fontSize: 28, fontWeight: '800', marginBottom: 24, letterSpacing: -0.5 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8, paddingHorizontal: 16 },

  input: { borderWidth: 1, borderRadius: 4, padding: 14, fontSize: 16, marginBottom: 16 },
  inputNoBorder: { fontSize: 18, paddingTop: 8, paddingBottom: 8 },

  pillBtn: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 10 },

  previewImage: { width: '100%', height: 300, borderRadius: 12, marginBottom: 16 },
  optionsList: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#333', paddingVertical: 4 },
  optionRowLink: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },

  greenBtn: { padding: 14, borderRadius: 30, alignItems: 'center' },
  greenBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  settingsGroupList: { borderRadius: 12, backgroundColor: '#1a1a1a', overflow: 'hidden' }, // Fallback, normally driven by theme color below using View array
  settingListItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#333' },
  settingsCard: { borderWidth: 1, borderRadius: 12, padding: 20, marginBottom: 30, gap: 8, alignItems: 'center' },

  loginPrompt: { borderRadius: 12, padding: 24, marginVertical: 40 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 30, paddingBottom: 50, borderWidth: 1, borderBottomWidth: 0 },
});
