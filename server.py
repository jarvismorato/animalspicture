"""
=======================================================
  ANIMALS PICTURE - SERVIDOR LOCAL
  Armazena posts e comentários em arquivos JSON no PC
  Acesse: http://localhost:5000
=======================================================
"""

import os
import json
import webbrowser
import threading
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# ── Configuração ─────────────────────────────────────
app = Flask(__name__, static_folder='.')
CORS(app)

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_DIR  = os.path.join(BASE_DIR, 'data')
POSTS_FILE    = os.path.join(DATA_DIR, 'posts.json')
COMMENTS_FILE = os.path.join(DATA_DIR, 'comments.json')

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

# ── Servir o site estático ────────────────────────────
@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)

# ── API: Posts ────────────────────────────────────────
@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = _load(POSTS_FILE, [])
    return jsonify(posts)

@app.route('/api/posts', methods=['POST'])
def create_post():
    post = request.get_json(force=True)
    posts = _load(POSTS_FILE, [])
    posts.insert(0, post)
    _save(POSTS_FILE, posts)
    return jsonify({'ok': True, 'post': post}), 201

@app.route('/api/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    posts = _load(POSTS_FILE, [])
    posts = [p for p in posts if p.get('id') != post_id]
    _save(POSTS_FILE, posts)
    return jsonify({'ok': True})

@app.route('/api/posts/<post_id>/like', methods=['POST'])
def toggle_like(post_id):
    data  = request.get_json(force=True)
    email = data.get('email', '')
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
    comment = request.get_json(force=True)
    all_comments = _load(COMMENTS_FILE, {})
    if post_id not in all_comments:
        all_comments[post_id] = []
    all_comments[post_id].append(comment)
    _save(COMMENTS_FILE, all_comments)
    return jsonify({'ok': True}), 201

# ── Inicialização ─────────────────────────────────────
def open_browser():
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    import sys
    no_browser = '--no-browser' in sys.argv

    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(POSTS_FILE):
        _save(POSTS_FILE, [])
    if not os.path.exists(COMMENTS_FILE):
        _save(COMMENTS_FILE, {})

    print("=" * 50)
    print("  Animals Picture - Servidor iniciado!")
    print("  Acesse: http://localhost:5000")
    print("  Pressione Ctrl+C para parar")
    print("=" * 50)

    if not no_browser:
        # Abre o browser 1 segundo após o servidor iniciar
        threading.Timer(1.0, open_browser).start()

    app.run(host='0.0.0.0', port=5000, debug=False)

