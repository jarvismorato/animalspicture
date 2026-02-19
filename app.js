/* ===================================================================
   ANIMALS PICTURE - JAVASCRIPT V22
   Rede social para amantes de animais
   Backend: servidor Python local em http://localhost:5000
   =================================================================== */

const API = 'http://localhost:5000/api';

// === VARIÁVEIS GLOBAIS ===
let usuario = { nome: "", foto: "", email: "", premium: false };
let postsHoje = 0;
let contadorSessao = 0;
let idiomaAtual = localStorage.getItem('app_lang') || 'pt';

// === INICIALIZAÇÃO ===
window.onload = function () {
    // Inicializa Google Sign-In
    google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleLogin
    });

    google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", type: "icon" }
    );

    // Carrega Tema e Idioma Salvos
    const temaSalvo = localStorage.getItem('app_theme') || 'dark';
    mudarTema(temaSalvo);
    document.getElementById('selectTema').value = temaSalvo;

    mudarIdioma(idiomaAtual);

    // Carrega dados do usuário
    carregarDados();

    // Inicializa componentes
    initCategorias();
    renderizarFeed();

    // Event listeners
    document.getElementById('searchInput')?.addEventListener('input', buscarPosts);
};

// === AUTENTICAÇÃO ===
function handleLogin(res) {
    const d = decodeJwt(res.credential);
    usuario = {
        nome: d.name,
        foto: d.picture,
        email: d.email,
        premium: localStorage.getItem('app_premium') === 'true'
    };

    localStorage.setItem('app_email', d.email);
    localStorage.setItem('app_nome', d.name);
    localStorage.setItem('app_foto', d.picture);

    atualizarUI();
    mostrarToast(TRANSLATIONS[idiomaAtual].postCreated, 'success');
}

function carregarDados() {
    usuario.nome = localStorage.getItem('app_nome') || "";
    usuario.foto = localStorage.getItem('app_foto') || "";
    usuario.email = localStorage.getItem('app_email') || "";
    usuario.premium = localStorage.getItem('app_premium') === 'true';

    // Reseta contador diário
    const ultimaData = localStorage.getItem('app_ultima_data');
    const hoje = new Date().toDateString();
    if (ultimaData !== hoje) {
        postsHoje = 0;
        localStorage.setItem('app_qtd', '0');
        localStorage.setItem('app_ultima_data', hoje);
    } else {
        postsHoje = parseInt(localStorage.getItem('app_qtd') || '0');
    }

    atualizarUI();
}

async function logout() {
    const t = TRANSLATIONS[idiomaAtual];

    const confirmar = await mostrarConfirm(
        'Sair da Conta',
        'Tem certeza que deseja sair? Seus dados locais serão mantidos.',
        { textoOk: 'Sair', textoCancelar: 'Cancelar', tipoOk: 'danger' }
    );

    if (confirmar) {
        localStorage.clear();
        location.reload();
    }
}

// === INTERFACE DO USUÁRIO ===
function atualizarUI() {
    if (usuario.email) {
        document.getElementById('googleBtn').style.display = 'none';
        document.getElementById('loggedArea').style.display = 'flex';
        document.getElementById('postBox').style.display = 'block';
        document.getElementById('headerImg').src = usuario.foto;
        document.getElementById('userEmailDisplay').innerText = usuario.email;

        // Atualiza modal de perfil
        document.getElementById('editNome').value = usuario.nome;
        document.getElementById('editFoto').value = usuario.foto;
        document.getElementById('previewImg').src = usuario.foto;
    }

    atualizarLimite();
    renderizarFeed();
}

function atualizarLimite() {
    const limite = document.getElementById('limitDisplay');
    if (!limite) return;

    if (isAdmin() || usuario.premium) {
        limite.innerText = "Ilimitado ✨";
        limite.style.color = "var(--gold)";
    } else {
        const restantes = CONFIG.LIMITE_POSTS_GRATIS - postsHoje;
        limite.innerText = `Restam ${restantes} posts`;
        limite.style.color = restantes < 5 ? "var(--red)" : "#888";
    }
}

// === IDIOMA E TEMA ===
function mudarIdioma(lang) {
    idiomaAtual = lang;
    localStorage.setItem('app_lang', lang);
    document.getElementById('selectIdioma').value = lang;

    const t = TRANSLATIONS[lang];

    // Atualiza textos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if (t[k]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t[k];
            } else {
                el.innerText = t[k];
            }
        }
    });

    // Atualiza placeholders específicos
    const descPost = document.getElementById('descPost');
    const searchInput = document.getElementById('searchInput');
    if (descPost) descPost.placeholder = t.descPlace;
    if (searchInput) searchInput.placeholder = t.search;

    renderizarFeed();
}

function mudarTema(tema) {
    if (tema === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
    localStorage.setItem('app_theme', tema);
}

// === BANCO DE DADOS (SERVIDOR LOCAL) ===
async function getDB() {
    try {
        const res = await fetch(`${API}/posts`);
        return await res.json();
    } catch (e) {
        mostrarToast('⚠️ Servidor offline! Inicie o start.bat', 'error');
        return [];
    }
}

async function savePostDB(post) {
    try {
        const res = await fetch(`${API}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post)
        });
        return res.ok;
    } catch (e) {
        mostrarToast('⚠️ Servidor offline! Inicie o start.bat', 'error');
        return false;
    }
}

async function deletePostDB(id) {
    try {
        await fetch(`${API}/posts/${id}`, { method: 'DELETE' });
    } catch (e) {
        mostrarToast('⚠️ Servidor offline!', 'error');
    }
}

// === RENDERIZAÇÃO DE POSTS ===
async function renderizarFeed() {
    const feed = document.getElementById('feed');
    feed.innerHTML = '';

    // Post Demo do Admin
    criarPostHTML({
        id: 'demo',
        nome: 'Animals Picture',
        foto: 'https://ui-avatars.com/api/?name=Admin&background=00C853&color=fff',
        desc: 'Bem-vindo ao Animals Picture! 🐾 Compartilhe fotos dos seus animais favoritos.',
        img: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&q=80',
        cat: 'Sistema',
        sub: 'Boas-vindas',
        admin: true,
        likes: [],
        comments: []
    });

    // Posts do servidor
    const posts = await getDB();
    posts.forEach(p => criarPostHTML(p));
}

function criarPostHTML(post) {
    if (!post.likes) post.likes = [];
    if (!post.comments) post.comments = [];

    const div = document.createElement('div');
    div.className = 'card post';
    div.setAttribute('data-id', post.id);
    div.setAttribute('data-cat', post.cat);
    div.setAttribute('data-desc', post.desc.toLowerCase());
    div.setAttribute('data-user', post.nome.toLowerCase());

    const userPic = post.foto || avatarFallback(post.nome);
    let badge = (post.admin || post.email === CONFIG.ADMIN_EMAIL)
        ? " <span class='badge-admin'>DONO</span>"
        : "";
    let border = (post.admin || post.email === CONFIG.ADMIN_EMAIL)
        ? "admin-border"
        : (post.premium ? "premium-border" : "");

    const isOwner = (usuario.email && post.email === usuario.email) || isAdmin();
    const t = TRANSLATIONS[idiomaAtual];

    let actionBtn = isOwner
        ? `<button class="action-btn btn-delete" onclick="deletarPost('${post.id}')" aria-label="${t.delete}">🗑️ ${t.delete}</button>`
        : `<button class="action-btn btn-report" onclick="denunciarPost('${post.id}')" aria-label="${t.report}">⚠️ ${t.report}</button>`;

    const liked = post.likes.includes(usuario.email);
    const likeIcon = liked ? "❤️" : "🤍";
    const likeClass = liked ? "btn-like liked" : "btn-like";

    div.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <img src="${userPic}" class="post-avatar ${border}" 
                     onerror="this.src='${avatarFallback(post.nome)}'"
                     alt="${post.nome}">
                <div><b>${post.nome}${badge}</b></div>
            </div>
        </div>
        <p>${escapeHtml(post.desc)}</p>
        <span style="font-size:11px; opacity:0.7; border:1px solid var(--border); padding:2px 6px; border-radius:4px;">
            ${post.cat} › ${post.sub}
        </span>
        <img src="${post.img}" loading="lazy" alt="${post.desc}" onclick="abrirImagemFullscreen('${post.img}')">
        
        <div class="post-actions-bar">
            <button class="action-btn ${likeClass}" onclick="toggleLike('${post.id}')" aria-label="Curtir">
                ${likeIcon} ${post.likes.length}
            </button>
            <button class="action-btn" onclick="compartilharPost('${post.id}')" aria-label="Compartilhar">
                🔗 Compartilhar
            </button>
            ${actionBtn}
        </div>
        
        <div class="post-comments">
            <div class="comments-list" id="list-${post.id}"></div>
            ${usuario.email ? `
                <div class="comment-form">
                    <input type="text" class="comment-text" placeholder="Comentar..." 
                           id="input-${post.id}" aria-label="Escrever comentário">
                    <button class="btn-green" onclick="addComentario('${post.id}')" aria-label="Enviar">›</button>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('feed').appendChild(div);
    carregarComentarios(post.id);
}

// === POSTS - CRIAÇÃO E GERENCIAMENTO ===
async function publicar(e) {
    e.preventDefault();

    const t = TRANSLATIONS[idiomaAtual];

    // Verifica limite
    if (!usuario.premium && !isAdmin() && postsHoje >= CONFIG.LIMITE_POSTS_GRATIS) {
        mostrarToast(t.limitReached, 'error');
        abrirModal('modalPremium');
        return;
    }

    const desc = document.getElementById('descPost').value;
    const img = document.getElementById('finalImageBase64').value;
    const cat = document.getElementById('catSelect').value;
    const sub = document.getElementById('subSelect').value;

    if (!img || !cat) {
        mostrarToast(t.imageRequired, 'error');
        return;
    }

    // Cria novo post
    const novo = {
        id: 'post_' + Date.now(),
        nome: usuario.nome,
        foto: usuario.foto,
        email: usuario.email,
        desc: desc,
        img: img,
        cat: cat,
        sub: sub,
        likes: [],
        comments: [],
        date: new Date().toISOString(),
        premium: usuario.premium
    };

    const ok = await savePostDB(novo);
    if (!ok) return;

    await renderizarFeed();

    // Atualiza contadores
    if (!usuario.premium && !isAdmin()) {
        postsHoje++;
        localStorage.setItem('app_qtd', postsHoje);
        contadorSessao++;

        // Insere anúncio a cada 10 posts
        if (contadorSessao % 10 === 0) {
            inserirAnuncio();
        }

        atualizarLimite();
    }

    // Limpa formulário
    e.target.reset();
    document.getElementById('previewUpload').style.display = 'none';
    document.getElementById('finalImageBase64').value = '';

    mostrarToast(t.postCreated, 'success');
}

async function deletarPost(id) {
    const t = TRANSLATIONS[idiomaAtual];

    const confirmar = await mostrarConfirm(
        t.delete,
        t.confirmDelete,
        { textoOk: t.delete, textoCancelar: 'Cancelar', tipoOk: 'danger' }
    );

    if (!confirmar) return;

    await deletePostDB(id);
    await renderizarFeed();

    mostrarToast(t.postDeleted, 'success');
}

function denunciarPost(id) {
    const t = TRANSLATIONS[idiomaAtual];
    mostrarToast(t.reported, 'info');
}

// === LIKES ===
async function toggleLike(id) {
    if (!usuario.email) {
        mostrarAlerta('Login Necessário', TRANSLATIONS[idiomaAtual].loginRequired, 'error');
        return;
    }

    if (id === 'demo') return;

    try {
        await fetch(`${API}/posts/${id}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: usuario.email })
        });
        await renderizarFeed();
    } catch (e) {
        mostrarToast('⚠️ Servidor offline!', 'error');
    }
}

// === COMENTÁRIOS ===
async function addComentario(id) {
    const input = document.getElementById(`input-${id}`);
    const txt = input.value.trim();
    if (!txt) return;

    const novo = {
        user: usuario.nome,
        text: txt,
        foto: usuario.foto,
        date: new Date().toISOString()
    };

    try {
        await fetch(`${API}/comments/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novo)
        });
        input.value = '';
        carregarComentarios(id);
    } catch (e) {
        mostrarToast('⚠️ Servidor offline!', 'error');
    }
}

async function carregarComentarios(id) {
    const list = document.getElementById(`list-${id}`);
    if (!list) return;

    try {
        const res = await fetch(`${API}/comments/${id}`);
        const comments = await res.json();

        list.innerHTML = '';
        comments.forEach(c => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `
                <img src="${c.foto || avatarFallback(c.user)}" class="comment-avatar"
                     onerror="this.src='${avatarFallback(c.user)}'"
                     alt="${escapeHtml(c.user)}">
                <div class="comment-content">
                    <span class="comment-user">${escapeHtml(c.user)}</span>
                    <span class="comment-text">${escapeHtml(c.text)}</span>
                </div>
            `;
            list.appendChild(div);
        });
    } catch (e) {
        // servidor offline, silencioso
    }
}

// === UPLOAD DE IMAGEM ===
function lerArquivo(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];

        // Valida tamanho
        if (file.size > CONFIG.MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            mostrarToast(TRANSLATIONS[idiomaAtual].imageTooBig, 'error');
            input.value = '';
            return;
        }

        // Valida tipo
        if (!file.type.startsWith('image/')) {
            mostrarToast("Formato inválido! Use JPG, PNG ou WebP.", 'error');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('previewUpload').src = e.target.result;
            document.getElementById('previewUpload').style.display = 'block';
            comprimir(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function comprimir(base64) {
    const img = new Image();
    img.src = base64;
    img.onload = function () {
        const cvs = document.createElement('canvas');
        const ctx = cvs.getContext('2d');

        let w = img.width;
        let h = img.height;
        const max = CONFIG.MAX_IMAGE_WIDTH;

        if (w > max) {
            h *= max / w;
            w = max;
        }

        cvs.width = w;
        cvs.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        document.getElementById('finalImageBase64').value = cvs.toDataURL('image/jpeg', CONFIG.IMAGE_QUALITY);
    };
}

// === BUSCA ===
function buscarPosts() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();

    document.querySelectorAll('.post').forEach(post => {
        if (!query) {
            post.style.display = 'block';
            return;
        }

        const desc = post.getAttribute('data-desc') || '';
        const cat = post.getAttribute('data-cat')?.toLowerCase() || '';
        const user = post.getAttribute('data-user') || '';

        const match = desc.includes(query) || cat.includes(query) || user.includes(query);
        post.style.display = match ? 'block' : 'none';
    });
}

// === FILTROS DE CATEGORIA ===
function initCategorias() {
    const sel = document.getElementById('catSelect');
    const top = document.getElementById('topicBar');
    const t = TRANSLATIONS[idiomaAtual];

    for (let c in CATEGORIAS) {
        sel.innerHTML += `<option value="${c}">${t[c] || c}</option>`;
        top.innerHTML += `<button class="topic-btn" onclick="filtrarFeed('${c}', this)" aria-pressed="false">${t[c] || c}</button>`;
    }
}

function carregarSub() {
    const c = document.getElementById('catSelect').value;
    const s = document.getElementById('subSelect');
    const t = TRANSLATIONS[idiomaAtual];

    s.innerHTML = `<option value="">${t.racePlace}</option>`;
    s.disabled = !c;

    if (c && CATEGORIAS[c]) {
        CATEGORIAS[c].forEach(r => {
            s.innerHTML += `<option value="${r}">${r}</option>`;
        });
    }
}

function filtrarFeed(cat, btn) {
    // Remove busca ativa
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    // Atualiza botões - corrige bug do "Tudo"
    document.querySelectorAll('.topic-btn').forEach(b => {
        b.classList.remove('active');
        // Atualiza aria-pressed
        b.setAttribute('aria-pressed', 'false');
    });

    if (btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
    }

    // Filtra posts
    document.querySelectorAll('.post').forEach(p => {
        const postCat = p.getAttribute('data-cat');
        p.style.display = (cat === 'Tudo' || postCat === cat) ? 'block' : 'none';
    });
}

// === COMPARTILHAMENTO ===
function compartilharPost(id) {
    const url = window.location.href + '#post-' + id;

    // Tenta usar Web Share API (mobile)
    if (navigator.share) {
        navigator.share({
            title: 'Animals Picture',
            text: 'Confira este post!',
            url: url
        }).catch(() => { });
    } else {
        // Fallback: copia para clipboard
        navigator.clipboard.writeText(url).then(() => {
            mostrarToast('Link copiado! 🔗', 'success');
        });
    }
}

// === VISUALIZAÇÃO FULLSCREEN ===
function abrirImagemFullscreen(imgSrc) {
    const modal = document.createElement('div');
    modal.className = 'modal-bg open';
    modal.innerHTML = `
        <div class="modal-box" style="max-width: 90%; max-height: 90%; padding: 0; background: transparent; border: none;">
            <span class="close-btn" onclick="this.parentElement.parentElement.remove()" style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 50%;">×</span>
            <img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">
        </div>
    `;
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    document.body.appendChild(modal);
}

// === ANÚNCIOS ===
function inserirAnuncio() {
    const div = document.createElement('div');
    div.className = 'card post post-ad';
    const sc = '<scr' + 'ipt>(adsbygoogle = window.adsbygoogle || []).push({});</scr' + 'ipt>';
    div.innerHTML = `
        <span style="background:#FFD700;color:black; padding:4px 8px; border-radius:4px; font-weight:bold;">ANÚNCIO</span>
        <ins class="adsbygoogle"
             style="display:block; margin-top:10px;"
             data-ad-client="${CONFIG.ADSENSE_CLIENT_ID}"
             data-ad-slot="${CONFIG.ADSENSE_SLOT}"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
    ` + sc;
    document.getElementById('feed').prepend(div);
}

// === PERFIL ===
function salvarPerfil() {
    usuario.nome = document.getElementById('editNome').value.trim();
    usuario.foto = document.getElementById('editFoto').value.trim();

    if (!usuario.nome) {
        mostrarAlerta('Erro', 'Nome não pode estar vazio!', 'error');
        return;
    }

    localStorage.setItem('app_nome', usuario.nome);
    localStorage.setItem('app_foto', usuario.foto);

    atualizarUI();
    fecharModal('modalPerfil');
    mostrarToast("Perfil atualizado!", 'success');
}

function atualizarPreview() {
    const url = document.getElementById('editFoto').value;
    document.getElementById('previewImg').src = url || avatarFallback(usuario.nome);
}

// === PREMIUM ===
async function assinarPremium() {
    const t = TRANSLATIONS[idiomaAtual];

    const confirmar = await mostrarConfirm(
        'Premium 💎',
        t.confirmPremium,
        { textoOk: 'Assinar', textoCancelar: 'Cancelar', tipoOk: 'premium' }
    );

    if (confirmar) {
        usuario.premium = true;
        localStorage.setItem('app_premium', 'true');
        atualizarUI();
        fecharModal('modalPremium');
        mostrarToast("Bem-vindo ao Premium! ✨", 'success');
    }
}

// === EXPORTAR/IMPORTAR DADOS ===
function exportarDados() {
    const data = {
        posts: getDB(),
        comments: JSON.parse(localStorage.getItem('comments_v3') || '{}'),
        user: usuario,
        version: CONFIG.VERSAO,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animals-picture-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    mostrarToast(TRANSLATIONS[idiomaAtual].exportSuccess, 'success');
}

function importarDados() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (data.posts) {
                    saveDB(data.posts);
                }
                if (data.comments) {
                    localStorage.setItem('comments_v3', JSON.stringify(data.comments));
                }

                renderizarFeed();
                mostrarToast(TRANSLATIONS[idiomaAtual].importSuccess, 'success');
            } catch (error) {
                mostrarToast(TRANSLATIONS[idiomaAtual].importError, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// === GERENCIAMENTO DE DADOS ===
async function limparDados() {
    const t = TRANSLATIONS[idiomaAtual];

    const confirmar = await mostrarConfirm(
        '⚠️ Limpar Tudo',
        t.confirmClear,
        { textoOk: 'Sim, limpar tudo', textoCancelar: 'Cancelar', tipoOk: 'danger' }
    );

    if (confirmar) {
        localStorage.removeItem('db_posts_v3');
        localStorage.removeItem('comments_v3');
        location.reload();
    }
}

// === MODAIS ===
function abrirModal(id) {
    document.getElementById(id).classList.add('open');
}

function fecharModal(id) {
    document.getElementById(id).classList.remove('open');
}

// === NOTIFICAÇÕES TOAST ===
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// === MODAL DE CONFIRMAÇÃO CUSTOMIZADO ===
function mostrarConfirm(titulo, mensagem, opcoes = {}) {
    return new Promise((resolve) => {
        const {
            textoOk = 'Confirmar',
            textoCancelar = 'Cancelar',
            tipoOk = 'normal' // 'normal', 'danger', 'premium'
        } = opcoes;

        const modal = document.createElement('div');
        modal.className = 'modal-bg confirm-modal open';
        modal.innerHTML = `
            <div class="modal-box">
                <h3>${titulo}</h3>
                <p>${mensagem}</p>
                <div class="confirm-buttons">
                    <button class="btn-confirm-cancel" id="btnCancelar">${textoCancelar}</button>
                    <button class="btn-confirm-ok ${tipoOk}" id="btnConfirmar">${textoOk}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const btnCancelar = modal.querySelector('#btnCancelar');
        const btnConfirmar = modal.querySelector('#btnConfirmar');

        btnCancelar.onclick = () => {
            modal.remove();
            resolve(false);
        };

        btnConfirmar.onclick = () => {
            modal.remove();
            resolve(true);
        };

        // Fechar ao clicar fora
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        };

        // Focar no botão OK
        setTimeout(() => btnConfirmar.focus(), 100);
    });
}

function mostrarAlerta(titulo, mensagem, tipo = 'info') {
    const modal = document.createElement('div');
    modal.className = 'modal-bg confirm-modal open';
    modal.innerHTML = `
        <div class="modal-box">
            <h3>${titulo}</h3>
            <p>${mensagem}</p>
            <button class="btn-green" onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// === UTILITÁRIOS ===
function isAdmin() {
    return usuario.email && usuario.email.trim().toLowerCase() === CONFIG.ADMIN_EMAIL.trim().toLowerCase();
}

function avatarFallback(nome) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=1e1e1e&color=00C853`;
}

function decodeJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        window.atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
