/* ===================================================================
   ANIMALS PICTURE - CONFIGURAÇÃO
   Arquivo centralizado de configurações
   =================================================================== */

// === CONFIGURAÇÕES DE AUTENTICAÇÃO ===
const CONFIG = {
    // Google OAuth Client ID
    GOOGLE_CLIENT_ID: "1011026636052-883kh3h1md3m98tpvgvm5gqlie40lecc.apps.googleusercontent.com",

    // Email do administrador
    ADMIN_EMAIL: "jarvismorato@gmail.com",

    // Google AdSense
    ADSENSE_CLIENT_ID: "ca-pub-6566744182494017",
    ADSENSE_SLOT: "7402439022",

    // Limites
    LIMITE_POSTS_GRATIS: 29,
    MAX_IMAGE_SIZE_MB: 2,
    MAX_IMAGE_WIDTH: 500,
    IMAGE_QUALITY: 0.6,

    // Premium
    PRECO_PREMIUM: "R$ 2,99",

    // Versão
    VERSAO: "V21"
};

// === TRADUÇÕES ===
const TRANSLATIONS = {
    pt: {
        all: "Tudo",
        welcomeTitle: "Bem-vindo à Animals Picture",
        welcomeDesc: "Animals Picture é a comunidade líder para amantes de animais. Compartilhe fotos, descubra raças e faça amigos.",
        newPost: "Nova Publicação",
        cameraBtn: "Câmera / Galeria",
        publishBtn: "Publicar",
        rights: "Todos os direitos reservados.",
        month: "mês",
        subscribe: "Assinar Agora",
        profile: "Perfil",
        save: "Salvar",
        config: "Configurações",
        lang: "Idioma",
        theme: "Tema",
        support: "Suporte",
        localData: "Dados Locais",
        clearData: "🗑️ Limpar Tudo",
        logout: "Sair",
        catPlace: "Categoria...",
        racePlace: "Raça...",
        descPlace: "Escreva algo...",
        delete: "Excluir",
        report: "Denunciar",
        search: "Buscar posts...",
        confirmDelete: "Tem certeza que deseja excluir este post?",
        confirmClear: "Isso irá apagar TODOS os seus posts e dados. Deseja continuar?",
        confirmPremium: "Assinar Premium por R$ 2,99/mês?",
        loginRequired: "Você precisa fazer login para curtir posts!",
        postCreated: "Post publicado com sucesso! 🎉",
        postDeleted: "Post excluído!",
        reported: "Post denunciado! Nossa equipe irá revisar.",
        limitReached: "Você atingiu o limite gratuito de 29 posts!",
        imageRequired: "Por favor, selecione uma imagem e categoria!",
        imageTooBig: "Imagem muito grande! Máximo 2MB.",
        exportSuccess: "Dados exportados com sucesso!",
        importSuccess: "Dados importados com sucesso!",
        importError: "Erro ao importar dados. Verifique o arquivo.",
        // Categorias
        "Cães": "Cães",
        "Gatos": "Gatos",
        "Pássaros": "Pássaros",
        "Outros": "Outros",
        // Novos
        sortBy: "Ordenar por:",
        sortNewest: "Mais Recentes",
        sortLikes: "Mais Curtidos",
        loadMore: "Carregar Mais",
        share: "Compartilhar",
        commentPlace: "Comentar...",
        newPosts: "novo(s) post(s)"
    },
    en: {
        all: "All",
        welcomeTitle: "Welcome to Animals Picture",
        welcomeDesc: "Animals Picture is the leading community for animal lovers. Share photos, discover breeds, and make friends.",
        newPost: "New Post",
        cameraBtn: "Camera / Gallery",
        publishBtn: "Publish",
        rights: "All rights reserved.",
        month: "month",
        subscribe: "Subscribe Now",
        profile: "Profile",
        save: "Save",
        config: "Settings",
        lang: "Language",
        theme: "Theme",
        support: "Support",
        localData: "Local Data",
        clearData: "🗑️ Clear All",
        logout: "Logout",
        catPlace: "Category...",
        racePlace: "Breed...",
        descPlace: "Write something...",
        delete: "Delete",
        report: "Report",
        search: "Search posts...",
        confirmDelete: "Are you sure you want to delete this post?",
        confirmClear: "This will delete ALL your posts and data. Continue?",
        confirmPremium: "Subscribe to Premium for $2.99/month?",
        loginRequired: "You need to login to like posts!",
        postCreated: "Post published successfully!",
        postDeleted: "Post deleted!",
        reported: "Post reported! Our team will review it.",
        // Categories
        "Cães": "Dogs",
        "Gatos": "Cats",
        "Pássaros": "Birds",
        "Outros": "Others",
        limitReached: "You've reached the free post limit! Subscribe to Premium for unlimited posts.",
        imageRequired: "Please select an image and category!",
        imageTooBig: "Image too large! Max 2MB.",
        exportSuccess: "Data exported successfully!",
        importSuccess: "Data imported successfully!",
        importError: "Error importing data. Check the file.",
        // New
        sortBy: "Sort by:",
        sortNewest: "Newest",
        sortLikes: "Most Liked",
        loadMore: "Load More",
        share: "Share",
        commentPlace: "Comment...",
        newPosts: "new post(s)"
    },
    es: {
        all: "Todo",
        welcomeTitle: "Bienvenido a Animals Picture",
        welcomeDesc: "Animals Picture es la comunidad líder para amantes de los animales. Comparte fotos, descubre razas y haz amigos.",
        newPost: "Nueva Publicación",
        cameraBtn: "Cámara / Galería",
        publishBtn: "Publicar",
        rights: "Todos los derechos reservados.",
        month: "mes",
        subscribe: "Suscribirse",
        profile: "Perfil",
        save: "Guardar",
        config: "Configuración",
        lang: "Idioma",
        theme: "Tema",
        support: "Soporte",
        localData: "Datos Locales",
        clearData: "🗑️ Borrar Todo",
        logout: "Cerrar Sesión",
        catPlace: "Categoría...",
        racePlace: "Raza...",
        descPlace: "Escribe algo...",
        delete: "Eliminar",
        report: "Reportar",
        search: "Buscar publicaciones...",
        confirmDelete: "¿Estás seguro de que quieres eliminar esta publicación?",
        confirmClear: "Esto eliminará TODOS tus posts y datos. ¿Continuar?",
        confirmPremium: "¿Suscribirse a Premium por $2.99/mes?",
        loginRequired: "¡Necesitas iniciar sesión para dar me gusta!",
        postCreated: "¡Publicación creada con éxito!",
        postDeleted: "¡Publicación eliminada!",
        reported: "¡Publicación reportada! Nuestro equipo la revisará.",
        limitReached: "¡Has alcanzado el límite de publicaciones gratis! Suscríbete a Premium para publicaciones ilimitadas.",
        imageRequired: "¡Por favor selecciona una imagen y categoría!",
        imageTooBig: "¡Imagen demasiado grande! Máximo 2MB.",
        exportSuccess: "¡Datos exportados con éxito!",
        importSuccess: "¡Datos importados con éxito!",
        importError: "Error al importar datos. Verifica el archivo.",
        // Categorías
        "Cães": "Perros",
        "Gatos": "Gatos",
        "Pássaros": "Pájaros",
        "Outros": "Otros",
        // Nuevos
        sortBy: "Ordenar por:",
        sortNewest: "Más Recientes",
        sortLikes: "Más Gustados",
        loadMore: "Cargar Más",
        share: "Compartir",
        commentPlace: "Comentar...",
        newPosts: "nueva(s) publicación(es)"
    }
};

// === CATEGORIAS E RAÇAS ===
const CATEGORIAS = {
    "Cães": [
        "Vira-lata", "Labrador", "Poodle", "Bulldog", "Golden Retriever",
        "Pastor Alemão", "Shih Tzu", "Yorkshire", "Pug", "Rottweiler",
        "Husky Siberiano", "Pinscher", "Beagle", "Pitbull", "Boxer",
        "Chihuahua", "Dálmata", "Border Collie"
    ],
    "Gatos": [
        "Vira-lata", "Siamês", "Persa", "Maine Coon", "Sphynx",
        "Angorá", "Bengal", "Ragdoll", "British Shorthair", "Exótico"
    ],
    "Pássaros": [
        "Calopsita", "Canário", "Papagaio", "Periquito", "Arara",
        "Cacatua", "Agapornis", "Mandarim"
    ],
    "Outros": [
        "Hamster", "Coelho", "Tartaruga", "Peixe", "Cavalo",
        "Porquinho-da-Índia", "Iguana", "Exótico"
    ]
};
