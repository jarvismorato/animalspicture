import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Image, StyleSheet,
  Alert, ScrollView, Modal, RefreshControl, ActivityIndicator, Dimensions, Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { Colors } from './src/constants/Colors';
import { CATEGORIAS, TRANSLATIONS } from './src/constants/Data';
import * as API from './src/services/api';

import PostCard from './src/components/PostCard';
import SkeletonLoader from './src/components/SkeletonLoader';
import CategoryBar from './src/components/CategoryBar';

const { width } = Dimensions.get('window');

const CATEGORY_COLORS = {
  'Perdidos': '#ef4444',
  'Encontrados': '#22c55e',
  'Adoção': '#3b82f6',
};

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

  const handleExternalPayment = () => {
    const externalPaymentUrl = "https://buy.stripe.com/test_v2_mock_product";
    Alert.alert(
      "Tornar-se Premium",
      "Você será redirecionado para a página segura de pagamento ($2.99).\n\nApós pagar, envie um email com o comprovante para suporte@animalspicture.com!",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Pagar agora", onPress: () => {
            Alert.alert('Simulação', 'Abrindo navegador no link: ' + externalPaymentUrl);
          }
        }
      ]
    );
  }

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
    Alert.alert('Excluir?', 'Tem certeza que deseja excluir este post?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await API.deletePost(postId, user.email);
        loadFeed(true);
      }}
    ]);
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

      const res = await fetch(`${API.SERVER_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': user.email },
        body: JSON.stringify({ ...post, email: user.email })
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert('✅', t.postCreated);
        setDesc('');
        setSelectedCat('');
        setSelectedBreed('');
        setImageUri(null);
        setImageBase64(null);
        setActiveTab('feed');
        loadFeed(true);
      } else {
        if (data.error === 'LIMIT_REACHED') {
          Alert.alert('Limite Atingido!', data.message, [
            { text: 'Assinar Premium', onPress: () => setActiveTab('premium') },
            { text: 'Cancelar', style: 'cancel' }
          ]);
        } else {
          throw new Error(data.message || "Create post failed");
        }
      }
    } catch (e) {
      Alert.alert('Erro', "Falha ao publicar. " + (e.message || t.noServer));
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
      foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(loginName.trim())}&background=${colors.blue.replace('#', '')}&color=fff`,
    };
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setShowLogin(false);
  };

  const filteredPosts = category === 'Tudo' ? posts : posts.filter(p => p.cat === category);

  // ════════════════════════════════════════
  //  FEED SCREEN
  // ════════════════════════════════════════
  const renderFeed = () => (
    <View style={{ flex: 1 }}>
      <CategoryBar categories={CATEGORIAS} active={category} onSelect={setCategory} colors={colors} t={t} />

      {loading ? (
        <SkeletonLoader colors={colors} count={3} />
      ) : (
        <FlatList
          data={[...filteredPosts]}
          keyExtractor={item => item?.id || Math.random().toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.welcomeBanner, { borderColor: colors.border, backgroundColor: colors.cardBg || colors.bg }]}>
              <Text style={{ fontSize: 40, marginBottom: 6 }}>🌟</Text>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>{t.welcome}</Text>
              <Text style={[styles.welcomeDesc, { color: colors.textSecondary }]}>{t.welcomeDesc}</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity style={[styles.welcomeBtn, { backgroundColor: colors.gold }]} onPress={() => setActiveTab('donate')}>
                  <Ionicons name="heart" size={16} color="#fff" />
                  <Text style={styles.welcomeBtnText}>Doar 💛</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.welcomeBtn, { backgroundColor: colors.blue }]} onPress={() => { if (!user.email) setShowLogin(true); else { document?.getElementById?.('postBox'); setActiveTab('newPost'); } }}>
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.welcomeBtnText}>Publicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item, index }) => (
            <>
              <PostCard post={item} colors={colors} t={t} userEmail={user.email} onLike={handleLike} onDelete={handleDelete} onComment={() => { }} />
              {(index + 1) % 5 === 0 && (
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                  <BannerAd
                    unitId={TestIds.BANNER}
                    size={BannerAdSize.BANNER}
                    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                  />
                </View>
              )}
            </>
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

  // ════════════════════════════════════════
  //  NEW POST SCREEN
  // ════════════════════════════════════════
  const renderNewPost = () => (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.newPostHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setActiveTab('feed')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{t.newPost}</Text>
        <TouchableOpacity onPress={publishPost} disabled={publishing}>
          {publishing ? <ActivityIndicator color={colors.blue} /> : <Text style={{ color: colors.blue, fontWeight: 'bold', fontSize: 16 }}>{t.publish}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {!user.email ? (
          <View style={[styles.loginPrompt, { backgroundColor: colors.cardBg || colors.inputBg }]}>
            <Ionicons name="person-circle-outline" size={48} color={colors.textSecondary} />
            <Text style={{ color: colors.text, textAlign: 'center', marginTop: 12, fontSize: 16 }}>Faça login para publicar!</Text>
            <TouchableOpacity style={[styles.greenBtn, { backgroundColor: colors.blue, marginTop: 16 }]} onPress={() => setShowLogin(true)}>
              <Text style={styles.greenBtnText}>{t.login}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
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

            <TouchableOpacity style={[styles.imagePickerBtn, { borderColor: colors.blue }]} onPress={pickImage}>
              <Ionicons name="images" size={24} color={colors.blue} />
              <Text style={{ color: colors.blue, fontSize: 16, fontWeight: '600' }}>Escolher da {t.gallery}</Text>
            </TouchableOpacity>

            {/* Category Picker */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t.category}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {Object.keys(CATEGORIAS).map(cat => {
                const catColor = CATEGORY_COLORS[cat] || colors.blue;
                const isActive = selectedCat === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, { borderColor: isActive ? catColor : colors.border, backgroundColor: isActive ? catColor + '15' : 'transparent' }]}
                    onPress={() => { setSelectedCat(cat); setSelectedBreed(''); }}
                  >
                    <Text style={{ color: isActive ? catColor : colors.textSecondary, fontWeight: '600' }}>{t[cat] || cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedCat ? (
              <>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t.breed}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {CATEGORIAS[selectedCat].map(breed => (
                    <TouchableOpacity key={breed} style={[styles.catChip, { borderColor: selectedBreed === breed ? colors.blue : colors.border, backgroundColor: selectedBreed === breed ? colors.blue + '15' : 'transparent' }]} onPress={() => setSelectedBreed(breed)}>
                      <Text style={{ color: selectedBreed === breed ? colors.blue : colors.textSecondary, fontWeight: '600' }}>{breed}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <View style={{ height: 80 }} />
          </>
        )}
      </ScrollView>
    </View>
  );

  // ════════════════════════════════════════
  //  PREMIUM SCREEN
  // ════════════════════════════════════════
  const renderPremium = () => (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 30 }}>
        <View style={[styles.premiumIcon, { backgroundColor: colors.gold }]}>
          <Text style={{ fontSize: 36 }}>💎</Text>
        </View>
        <Text style={[styles.premiumTitle, { color: colors.text }]}>Animals Picture Premium</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>Destaque-se na comunidade e sem limites.</Text>
      </View>

      <View style={[styles.benefitCard, { backgroundColor: colors.cardBg || colors.inputBg, borderColor: colors.border }]}>
        {[
          { icon: 'checkmark-circle', color: colors.blue, text: 'Selo de Verificado exclusivo' },
          { icon: 'images', color: colors.blue, text: 'Posts ilimitados (sem limite diário)' },
          { icon: 'heart', color: colors.red, text: 'Ajude a manter os servidores no ar!' },
          { icon: 'eye-off', color: colors.textSecondary, text: 'Sem anúncios (em breve)' },
        ].map((item, i) => (
          <View key={i} style={styles.benefitRow}>
            <View style={[styles.benefitIconBg, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={{ color: colors.text, fontSize: 15, flex: 1, lineHeight: 20 }}>{item.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: colors.gold }]} onPress={handleExternalPayment}>
        <Text style={styles.ctaBtnText}>Desbloquear por R$ 14,90</Text>
        <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12, marginTop: 3 }}>Pagamento único. Sem assinaturas.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 24, padding: 10, alignItems: 'center' }} onPress={() => setActiveTab('feed')}>
        <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '600' }}>Talvez mais tarde</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ════════════════════════════════════════
  //  DONATION SCREEN
  // ════════════════════════════════════════
  const renderDonation = () => (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 24 }}>
        <View style={[styles.premiumIcon, { backgroundColor: '#e85d04' }]}>
          <Ionicons name="heart" size={40} color="#fff" />
        </View>
        <Text style={[styles.premiumTitle, { color: colors.text }]}>{t.donateTitle}</Text>
      </View>

      <View style={[styles.benefitCard, { backgroundColor: colors.cardBg || colors.inputBg, borderColor: colors.border }]}>
        <Text style={{ color: colors.text, fontSize: 15, lineHeight: 24, textAlign: 'center' }}>{t.donateDesc}</Text>
      </View>

      <TouchableOpacity
        style={[styles.ctaBtn, { backgroundColor: '#e85d04' }]}
        onPress={() => Linking.openURL('https://amparanimal.org.br/doar/')}
      >
        <Text style={styles.ctaBtnText}>{t.donateBtn}</Text>
      </TouchableOpacity>

      <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 14, lineHeight: 16, paddingHorizontal: 10 }}>{t.donateDisclaimer}</Text>

      {/* Social Links */}
      <View style={{ marginTop: 36, alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 16 }}>Siga-nos 🐾</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {[
            { icon: 'logo-youtube', color: '#FF0000', url: 'https://www.youtube.com/channel/UCCDTiSlJKsn9PyOJGnn7aWQ', label: 'YouTube' },
            { icon: 'logo-instagram', color: '#E1306C', url: 'https://instagram.com/animalspicture', label: 'Instagram' },
            { icon: 'logo-tiktok', color: colors.text, url: 'https://tiktok.com/@animalspicture', label: 'TikTok' },
          ].map((s, i) => (
            <TouchableOpacity key={i} style={[styles.socialBtn, { backgroundColor: colors.cardBg || colors.inputBg, borderColor: colors.border }]} onPress={() => Linking.openURL(s.url)}>
              <Ionicons name={s.icon} size={22} color={s.color} />
              <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={{ marginTop: 24, padding: 10, alignItems: 'center' }} onPress={() => setActiveTab('feed')}>
        <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '600' }}>Voltar ao Feed</Text>
      </TouchableOpacity>
      <View style={{ height: 60 }} />
    </ScrollView>
  );

  // ════════════════════════════════════════
  //  SETTINGS SCREEN
  // ════════════════════════════════════════
  const renderSettings = () => (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: colors.bg }}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>{t.settings}</Text>

      {user.email && (
        <View style={[styles.profileCard, { backgroundColor: colors.cardBg || colors.bg, borderColor: colors.border }]}>
          <Image source={{ uri: user.foto }} style={styles.profileAvatar} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{user.nome}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{user.email}</Text>
        </View>
      )}

      <Text style={[styles.settingSectionTitle, { color: colors.textSecondary }]}>{t.theme?.toUpperCase()}</Text>
      <View style={[styles.settingsGroupList, { backgroundColor: colors.cardBg || colors.inputBg }]}>
        <TouchableOpacity style={[styles.settingListItem, { borderBottomColor: colors.border }]} onPress={() => { setTheme('dark'); AsyncStorage.setItem('theme', 'dark'); }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="moon" size={18} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 16 }}>{t.dark} (OLED)</Text>
          </View>
          {theme === 'dark' && <Ionicons name="checkmark" size={20} color={colors.blue} />}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingListItem, { borderBottomWidth: 0 }]} onPress={() => { setTheme('light'); AsyncStorage.setItem('theme', 'light'); }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="sunny" size={18} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 16 }}>{t.light}</Text>
          </View>
          {theme === 'light' && <Ionicons name="checkmark" size={20} color={colors.blue} />}
        </TouchableOpacity>
      </View>

      <Text style={[styles.settingSectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>{t.server?.toUpperCase()}</Text>
      <View style={[styles.settingsGroupList, { backgroundColor: colors.cardBg || colors.inputBg }]}>
        <TextInput
          style={[styles.inputNoBorder, { color: colors.text, paddingHorizontal: 16, paddingVertical: 14 }]}
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

      {/* Social Links in Settings */}
      <View style={{ marginTop: 30, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[
            { icon: 'logo-youtube', color: '#FF0000', url: 'https://www.youtube.com/channel/UCCDTiSlJKsn9PyOJGnn7aWQ' },
            { icon: 'logo-instagram', color: '#E1306C', url: 'https://instagram.com/animalspicture' },
            { icon: 'logo-tiktok', color: colors.text, url: 'https://tiktok.com/@animalspicture' },
            { icon: 'globe-outline', color: colors.blue, url: 'https://animalspicture.social' },
          ].map((s, i) => (
            <TouchableOpacity key={i} style={[styles.socialBtnSmall, { backgroundColor: colors.cardBg || colors.inputBg }]} onPress={() => Linking.openURL(s.url)}>
              <Ionicons name={s.icon} size={20} color={s.color} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {user.email && (
        <TouchableOpacity style={[styles.greenBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.red, marginTop: 30 }]} onPress={() => { setUser({ nome: '', foto: '', email: '' }); AsyncStorage.removeItem('user'); }}>
          <Text style={[styles.greenBtnText, { color: colors.red }]}>{t.logout}</Text>
        </TouchableOpacity>
      )}

      <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 24, opacity: 0.6 }}>Animals Picture v2.0 • animalspicture.social</Text>
      <View style={{ height: 80 }} />
    </ScrollView>
  );

  // ════════════════════════════════════════
  //  ERROR STATE
  // ════════════════════════════════════════
  if (appError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="warning" size={48} color="#ff5555" />
        <Text style={{ color: '#ff5555', fontSize: 16, marginTop: 12, textAlign: 'center', paddingHorizontal: 30 }}>Erro: {appError}</Text>
      </SafeAreaView>
    )
  }

  // ════════════════════════════════════════
  //  MAIN RENDER
  // ════════════════════════════════════════
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ExpoStatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.bg} />

      {/* ── Top Header ── */}
      {activeTab !== 'newPost' && (
        <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.logoText, { color: colors.text }]}>Animals Picture</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 1 }}>Encontre e Ajude 🐾</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TouchableOpacity style={[styles.donateBtnHeader, { borderColor: colors.gold }]} onPress={() => setActiveTab('donate')}>
              <Text style={{ color: colors.gold, fontWeight: '700', fontSize: 12 }}>Doar 💛</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSort(sort === 'newest' ? 'likes' : 'newest') }} style={styles.headerIconBtn}>
              <Feather name="bar-chart-2" size={22} color={sort === 'likes' ? colors.blue : colors.textSecondary} />
            </TouchableOpacity>
            {user.email ? (
              <TouchableOpacity onPress={() => setActiveTab('settings')}><Image source={{ uri: user.foto }} style={styles.headerAvatar} /></TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setShowLogin(true)} style={[styles.loginBtnHeader, { backgroundColor: colors.blue }]}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{t.login}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── Main Content ── */}
      <View style={{ flex: 1 }}>
        {activeTab === 'feed' && renderFeed()}
        {activeTab === 'newPost' && renderNewPost()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'premium' && renderPremium()}
        {activeTab === 'donate' && renderDonation()}
      </View>

      {/* ── Bottom Tab Bar ── */}
      <View style={[styles.tabBar, { backgroundColor: colors.tabBarBg || colors.bg, borderTopColor: colors.border }]}>
        {[
          { tab: 'feed', icon: 'home', iconActive: 'home', label: 'Feed' },
          { tab: 'donate', icon: 'heart-outline', iconActive: 'heart', label: 'Doar', color: colors.gold },
          { tab: 'newPost', icon: 'add-circle-outline', iconActive: 'add-circle', label: '', size: 34 },
          { tab: 'premium', icon: 'star-outline', iconActive: 'star', label: 'Premium', color: colors.gold },
          { tab: 'settings', icon: 'person-outline', iconActive: 'person', label: 'Perfil' },
        ].map((item, i) => {
          const isAct = activeTab === item.tab;
          const iconColor = isAct ? (item.color || colors.text) : colors.textSecondary;
          const iconSize = item.size || 26;
          return (
            <TouchableOpacity key={i} style={styles.tabItem} onPress={() => item.tab === 'newPost' && !user.email ? setShowLogin(true) : setActiveTab(item.tab)}>
              <Ionicons name={isAct ? item.iconActive : item.icon} size={iconSize} color={iconColor} />
              {item.label ? <Text style={[styles.tabLabel, { color: iconColor }]}>{item.label}</Text> : null}
              {isAct && <View style={[styles.tabDot, { backgroundColor: item.color || colors.blue }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Login Modal ── */}
      <Modal visible={showLogin} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={[styles.premiumIcon, { backgroundColor: colors.blue, width: 56, height: 56, borderRadius: 28, marginBottom: 12 }]}>
                <Ionicons name="person" size={28} color="#fff" />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Entrar no Animals Picture</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>Encontre e ajude animais 🐾</Text>
            </View>
            <TextInput style={[styles.input, { backgroundColor: colors.cardBg || colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.textSecondary} placeholder={t.name} value={loginName} onChangeText={setLoginName} />
            <TextInput style={[styles.input, { backgroundColor: colors.cardBg || colors.inputBg, color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.textSecondary} placeholder={t.email} value={loginEmail} onChangeText={setLoginEmail} keyboardType="email-address" autoCapitalize="none" />
            <TouchableOpacity style={[styles.greenBtn, { backgroundColor: colors.blue, marginTop: 10 }]} onPress={handleSimpleLogin}><Text style={styles.greenBtnText}>{t.login}</Text></TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setShowLogin(false)}><Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  logoText: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  headerAvatar: { width: 32, height: 32, borderRadius: 16 },
  headerIconBtn: { padding: 6 },
  donateBtnHeader: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
  loginBtnHeader: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },

  /* New Post Header */
  newPostHeader: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },

  /* Welcome Banner */
  welcomeBanner: { borderWidth: 1, borderRadius: 20, padding: 24, marginHorizontal: 12, marginTop: 12, marginBottom: 8, alignItems: 'center' },
  welcomeTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  welcomeDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  welcomeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  welcomeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  /* Load More */
  loadMoreBtn: { padding: 14, alignItems: 'center', marginVertical: 20 },
  loadMoreText: { fontWeight: '600', fontSize: 15 },

  /* Tab Bar */
  tabBar: { flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'space-around', borderTopWidth: StyleSheet.hairlineWidth },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 6, position: 'relative' },
  tabLabel: { fontSize: 10, marginTop: 2, fontWeight: '500' },
  tabDot: { position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2 },

  /* Screens */
  screenTitle: { fontSize: 28, fontWeight: '800', marginBottom: 24, letterSpacing: -0.5 },
  settingSectionTitle: { fontSize: 12, fontWeight: '700', marginBottom: 8, paddingHorizontal: 4, letterSpacing: 1 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },

  /* Inputs */
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12 },
  inputNoBorder: { fontSize: 17, paddingTop: 8, paddingBottom: 8 },

  /* Category Chips */
  catChip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, marginRight: 10 },

  /* Image Picker */
  imagePickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderStyle: 'dashed', padding: 20, borderRadius: 16, marginVertical: 16 },
  previewImage: { width: '100%', height: 280, borderRadius: 16, marginBottom: 8 },

  /* Buttons */
  greenBtn: { padding: 14, borderRadius: 30, alignItems: 'center' },
  greenBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  ctaBtn: { padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 18 },

  /* Settings */
  settingsGroupList: { borderRadius: 14, overflow: 'hidden' },
  settingListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#333' },
  profileCard: { borderWidth: 1, borderRadius: 16, padding: 24, marginBottom: 24, gap: 6, alignItems: 'center' },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 8 },

  /* Premium */
  premiumIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  premiumTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  benefitCard: { borderWidth: 1, borderRadius: 16, padding: 20, marginBottom: 16, gap: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  /* Social */
  socialBtn: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  socialBtnSmall: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  /* Login */
  loginPrompt: { borderRadius: 16, padding: 32, marginVertical: 40, alignItems: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 30, paddingBottom: 50, borderWidth: 1, borderBottomWidth: 0 },
});
