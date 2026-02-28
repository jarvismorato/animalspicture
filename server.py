"""
=======================================================
  ANIMALS PICTURE - SERVIDOR LOCAL V2
  Armazena posts e comentários em arquivos JSON no PC
  Imagens salvas como arquivos no disco
  Acesse: http://localhost:5000
=======================================================
"""

import os
import json
import uuid
import base64
import webbrowser
import threading
from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS

# ── Configuração ─────────────────────────────────────
app = Flask(__name__, static_folder='.')
CORS(app)

# Limite de payload (5MB)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Em producao (Render), usa o disco persistente montado em /data
# Em desenvolvimento local, usa a pasta ./data
if os.path.isdir('/data'):
    DATA_DIR = '/data'
else:
    DATA_DIR = os.path.join(BASE_DIR, 'data')

POSTS_FILE = os.path.join(DATA_DIR, 'posts.json')
COMMENTS_FILE = os.path.join(DATA_DIR, 'comments.json')
IMAGES_DIR = os.path.join(DATA_DIR, 'images')

# ── Helpers ───────────────────────────────────────────
def _load(path, default):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except Exception:
                return default
    return default


def _save(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _require_email():
    """Exige header X-User-Email em endpoints de escrita."""
    email = request.headers.get('X-User-Email', '').strip()
    if not email:
        abort(401, description='Header X-User-Email é obrigatório')
    return email


def _sanitize_text(text, max_len=2000):
    """Limpa e limita o tamanho de texto."""
    if not isinstance(text, str):
        return ''
    return text.strip()[:max_len]


# ── Servir o site estático ────────────────────────────
@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    # Servir imagens da pasta data/images
    if filename.startswith('data/images/'):
        img_name = filename.replace('data/images/', '', 1)
        return send_from_directory(IMAGES_DIR, img_name)
    return send_from_directory(BASE_DIR, filename)


# ── API: Upload de Imagem ─────────────────────────────
@app.route('/api/upload', methods=['POST'])
def upload_image():
    _require_email()
    data = request.get_json(force=True)
    base64_data = data.get('image', '')

    if not base64_data:
        return jsonify({'error': 'Nenhuma imagem enviada'}), 400

    # Remove o prefixo data:image/...;base64,
    if ',' in base64_data:
        header, base64_data = base64_data.split(',', 1)
    else:
        header = ''

    # Detecta extensão
    ext = 'jpg'
    if 'png' in header:
        ext = 'png'
    elif 'webp' in header:
        ext = 'webp'

    try:
        img_bytes = base64.b64decode(base64_data)
    except Exception:
        return jsonify({'error': 'Imagem inválida'}), 400

    # Limita tamanho (2MB decodificado)
    if len(img_bytes) > 2 * 1024 * 1024:
        return jsonify({'error': 'Imagem muito grande (máx 2MB)'}), 400

    os.makedirs(IMAGES_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(IMAGES_DIR, filename)

    with open(filepath, 'wb') as f:
        f.write(img_bytes)

    url = f"/data/images/{filename}"
    return jsonify({'ok': True, 'url': url}), 201


# ── API: Posts ────────────────────────────────────────
@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = _load(POSTS_FILE, [])

    # Paginação
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    limit = min(limit, 50)  # máximo 50 por página

    # Ordenação
    sort = request.args.get('sort', 'newest')
    if sort == 'likes':
        posts.sort(key=lambda p: len(p.get('likes', [])), reverse=True)
    # 'newest' já é a ordem padrão (inseridos no topo)

    total = len(posts)
    start = (page - 1) * limit
    end = start + limit
    paginated = posts[start:end]

    # Attach premium flag to posts
    premium_users = _load(os.path.join(DATA_DIR, 'premium_users.json'), [])
    premium_emails = [u.lower() for u in premium_users] + ["jarvismorato@gmail.com"]

    for post in paginated:
        post_email = post.get('email', '').lower()
        post['is_premium'] = post_email in premium_emails

    return jsonify({
        'posts': paginated,
        'total': total,
        'page': page,
        'hasMore': end < total
    })


@app.route('/api/posts', methods=['POST'])
def create_post():
    email = _require_email()
    post = request.get_json(force=True)

    # Validação de campos obrigatórios
    required = ['id', 'nome', 'desc', 'img', 'cat', 'sub']
    for field in required:
        if not post.get(field):
            return jsonify({'error': f'Campo "{field}" é obrigatório'}), 400

    # Sanitiza textos
    post['nome'] = _sanitize_text(post['nome'], 100)
    post['desc'] = _sanitize_text(post['desc'], 2000)
    post['cat'] = _sanitize_text(post['cat'], 50)
    post['sub'] = _sanitize_text(post['sub'], 50)
    post['email'] = _sanitize_text(email, 200)

    # Garante arrays
    post['likes'] = []
    post['comments'] = []

    # Validação de limites (15 por dia para não-premium)
    from datetime import datetime
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    # Simple JSON check, not optimal for millions of users but works for MVP
    posts = _load(POSTS_FILE, [])
    
    # We ideally should have a users.json or read from the app if they are premium. 
    # For now, let's accept a flag from the frontend (which is insecure but works for MVP without DB redesign)
    # The better way is to keep a list of premium emails. We will use a premium_users.json
    premium_users = _load(os.path.join(DATA_DIR, 'premium_users.json'), [])
    is_premium = email.lower() in [u.lower() for u in premium_users] or email.lower() == "jarvismorato@gmail.com"

    if not is_premium:
        posts_today = [p for p in posts if p.get('email', '').lower() == email.lower() and p.get('date', '').startswith(today_str)]
        if len(posts_today) >= 15:
             return jsonify({'error': 'LIMIT_REACHED', 'message': 'Limite diário de 15 publicações atingido. Assine o Premium!'}), 403

    posts.insert(0, post)
    _save(POSTS_FILE, posts)
    return jsonify({'ok': True, 'post': post}), 201


@app.route('/api/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    email = _require_email()
    posts = _load(POSTS_FILE, [])

    # Só o dono ou admin pode deletar
    ADMIN_EMAIL = "jarvismorato@gmail.com"
    post_found = None
    for p in posts:
        if p.get('id') == post_id:
            post_found = p
            break

    if post_found:
        if email.lower() != post_found.get('email', '').lower() and email.lower() != ADMIN_EMAIL:
            return jsonify({'error': 'Sem permissão'}), 403

    posts = [p for p in posts if p.get('id') != post_id]
    _save(POSTS_FILE, posts)
    return jsonify({'ok': True})


@app.route('/api/posts/<post_id>/like', methods=['POST'])
def toggle_like(post_id):
    email = _require_email()
    posts = _load(POSTS_FILE, [])
    for p in posts:
        if p.get('id') == post_id:
            likes = p.get('likes', [])
            if email in likes:
                likes.remove(email)
            else:
                likes.append(email)
            p['likes'] = likes
            break
    _save(POSTS_FILE, posts)
    return jsonify({'ok': True})


# ── API: Comentários ──────────────────────────────────
@app.route('/api/comments/<post_id>', methods=['GET'])
def get_comments(post_id):
    all_comments = _load(COMMENTS_FILE, {})
    return jsonify(all_comments.get(post_id, []))


@app.route('/api/comments/<post_id>', methods=['POST'])
def add_comment(post_id):
    _require_email()
    comment = request.get_json(force=True)

    # Validação
    if not comment.get('text') or not comment.get('user'):
        return jsonify({'error': 'Comentário inválido'}), 400

    # Limite de 300 caracteres
    comment['text'] = _sanitize_text(comment['text'], 300)
    comment['user'] = _sanitize_text(comment['user'], 100)

    all_comments = _load(COMMENTS_FILE, {})
    if post_id not in all_comments:
        all_comments[post_id] = []
    all_comments[post_id].append(comment)
    _save(COMMENTS_FILE, all_comments)
    return jsonify({'ok': True}), 201


# ── API: Contagem para polling ────────────────────────
@app.route('/api/posts/count', methods=['GET'])
def posts_count():
    posts = _load(POSTS_FILE, [])
    return jsonify({'count': len(posts)})


# ── Inicialização ─────────────────────────────────────
def open_browser():
    webbrowser.open('http://localhost:5000')


if __name__ == '__main__':
    import sys
    no_browser = '--no-browser' in sys.argv

    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(IMAGES_DIR, exist_ok=True)
    if not os.path.exists(POSTS_FILE):
        _save(POSTS_FILE, [])
    if not os.path.exists(COMMENTS_FILE):
        _save(COMMENTS_FILE, {})

    print("=" * 50)
    print("  Animals Picture - Servidor V2 iniciado!")
    print("  Web:    http://localhost:5000")
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        print(f"  Mobile: http://{local_ip}:5000")
    except Exception:
        pass
    print("  Pressione Ctrl+C para parar")
    print("=" * 50)

    if not no_browser:
        threading.Timer(1.0, open_browser).start()

    app.run(host='0.0.0.0', port=5000, debug=False)

