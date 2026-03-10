# 📋 Guia de Deployment - Animals Picture

Este guia detalha como fazer o deployment do Animals Picture em diferentes plataformas.

## 📑 Índice

1. [Configuração do Google OAuth](#1-configuração-do-google-oauth)
2. [Configuração do Google AdSense](#2-configuração-do-google-adsense)
3. [Deploy em Plataformas](#3-deploy-em-plataformas)
   - [GitHub Pages](#github-pages)
   - [Netlify](#netlify)
   - [Vercel](#vercel)
   - [Firebase Hosting](#firebase-hosting)
4. [Configurações Adicionais](#4-configurações-adicionais)

---

## 1. Configuração do Google OAuth

O Google Sign-In é **obrigatório** para autenticação de usuários.

### Passo 1: Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Novo Projeto" ou selecione um existente
3. Dê um nome ao projeto (ex: "Animals Picture")
4. Clique em "Criar"

### Passo 2: Ativar a API

1. No menu lateral, vá em **APIs e Serviços** → **Biblioteca**
2. Procure por "Google+ API" ou "Google Identity Services"
3. Clique em "Ativar"

### Passo 3: Criar Credenciais OAuth 2.0

1. Vá em **APIs e Serviços** → **Credenciais**
2. Clique em **+ Criar Credenciais** → **ID do cliente OAuth**
3. Se solicitado, configure a tela de consentimento OAuth:
   - Tipo de usuário: **Externo**
   - Nome do app: `Animals Picture`
   - Email de suporte: seu email
   - Domínios autorizados: adicione seu domínio
   - Salve

4. Tipo de aplicativo: **Aplicativo da Web**
5. Nome: `Animals Picture Web Client`
6. **Origens JavaScript autorizadas**:
   ```
   http://localhost:8000
   https://seu-dominio.com
   https://seu-usuario.github.io
   ```
7. **URIs de redirecionamento autorizados**:
   ```
   http://localhost:8000
   https://seu-dominio.com
   ```
8. Clique em "Criar"

### Passo 4: Copiar Client ID

1. Copie o **Client ID** gerado (formato: `xxx.apps.googleusercontent.com`)
2. Abra o arquivo `config.js`
3. Substitua:
   ```javascript
   const CONFIG = {
       GOOGLE_CLIENT_ID: "SEU-CLIENT-ID-AQUI.apps.googleusercontent.com",
       // ...
   };
   ```

---

## 2. Configuração do Google AdSense

O AdSense é **opcional** para monetização com anúncios.

### Passo 1: Criar Conta AdSense

1. Acesse [Google AdSense](https://www.google.com/adsense/)
2. Faça login com sua conta Google
3. Siga os passos para criar uma conta
4. Aguarde aprovação (pode levar dias)

### Passo 2: Obter Código do Anúncio

1. No painel do AdSense, vá em **Anúncios** → **Visão geral**
2. Clique em "Criar um novo bloco de anúncios"
3. Escolha **"Anúncios gráficos responsivos"**
4. Configure:
   - Nome: `Animals Picture Feed`
   - Tamanho: Responsivo
5. Clique em "Criar"

6. Você verá dois códigos:
   - **Client ID**: `ca-pub-SEUS-NUMEROS`
   - **Slot ID**: `números do slot`

### Passo 3: Adicionar no Config

Edite `config.js`:
```javascript
const CONFIG = {
    // ...
    ADSENSE_CLIENT_ID: "ca-pub-SEUS-NUMEROS",
    ADSENSE_SLOT: "SEU-SLOT-ID",
};
```

---

## 3. Deploy em Plataformas

### GitHub Pages

**Gratuito** | **Simples** | **Estático apenas**

#### Passos:

1. **Crie um repositório no GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/animals-picture.git
   git push -u origin main
   ```

2. **Ative o GitHub Pages**
   - Vá em **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** / (root)
   - Salve

3. **Aguarde deploy** (1-2 minutos)

4. **Acesse**: `https://SEU-USUARIO.github.io/animals-picture/`

5. **Adicione domínio no Google OAuth**
   - Console Google Cloud → Credenciais
   - Edite seu OAuth Client ID
   - Adicione: `https://SEU-USUARIO.github.io`

---

### Netlify

**Gratuito** | **CI/CD** | **Custom Domain Fácil**

#### Passos:

1. **Crie conta em** [Netlify](https://www.netlify.com/)

2. **Deploy via GitHub** (Recomendado)
   - Clique em "Add new site" → "Import an existing project"
   - Conecte com GitHub
   - Selecione o repositório `animals-picture`
   - Build settings (deixe vazio para site estático)
   - Deploy!

3. **Ou Deploy via Drag & Drop**
   - Arraste a pasta do projeto para Netlify Drop
   - Pronto!

4. **Configurar domínio**
   - Site settings → Domain management
   - Você recebe: `nome-aleatorio.netlify.app`
   - Ou adicione custom domain

5. **Atualizar OAuth**
   - Adicione `https://nome-aleatorio.netlify.app` no Google Console

#### Dica: Build otimizado

Crie `netlify.toml`:
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

### Vercel

**Gratuito** | **Super Rápido** | **Edge Network**

#### Passos:

1. **Crie conta em** [Vercel](https://vercel.com/)

2. **Deploy via GitHub**
   - Clique em "Add New Project"
   - Import Git Repository
   - Selecione `animals-picture`
   - Framework Preset: **Other**
   - Deploy!

3. **Ou via CLI**
   ```bash
   npm i -g vercel
   cd animals-picture
   vercel
   ```

4. **Domínio**
   - Você recebe: `animals-picture.vercel.app`
   - Configure custom domain em Settings

5. **Atualizar OAuth**
   - Adicione `https://animals-picture.vercel.app`

---

### Firebase Hosting

**Gratuito** | **CDN Global** | **SSL Automático**

#### Passos:

1. **Instale Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login**
   ```bash
   firebase login
   ```

3. **Inicialize projeto**
   ```bash
   cd animals-picture
   firebase init hosting
   ```
   - Use existing project ou crie novo
   - Public directory: `.` (raiz)
   - Single-page app: **No**
   - GitHub Actions: **No** (por enquanto)

4. **Deploy**
   ```bash
   firebase deploy
   ```

5. **URL**: `https://SEU-PROJETO.web.app`

6. **Atualizar OAuth**
   - Adicione URL no Google Console

---

## 4. Configurações Adicionais

### Custom Domain (Domínio Próprio)

#### Netlify
1. Site settings → Domain management → Add custom domain
2. Configure DNS do seu provedor:
   ```
   CNAME  www  nome-site.netlify.app
   A      @    75.2.60.5
   ```

#### Vercel
1. Settings → Domains → Add domain
2. Configure DNS:
   ```
   CNAME  www  cname.vercel-dns.com
   A      @    76.76.21.21
   ```

### HTTPS e SSL

**Todos os serviços acima fornecem SSL/HTTPS gratuito automaticamente!**

### Variáveis de Ambiente

Para esconder credenciais (futuro backend):

**Netlify**:
```bash
# Site settings → Build & deploy → Environment variables
GOOGLE_CLIENT_ID=xxx
ADSENSE_CLIENT_ID=yyy
```

**Vercel**:
```bash
# Settings → Environment Variables
GOOGLE_CLIENT_ID=xxx
ADSENSE_CLIENT_ID=yyy
```

### Performance Tips

1. **Minificar arquivos** (opcional):
   ```bash
   # Instalar uglify-js
   npm install -g uglify-js clean-css-cli html-minifier
   
   # Minificar
   uglifyjs app.js -c -m -o app.min.js
   cleancss -o styles.min.css styles.css
   html-minifier --collapse-whitespace --remove-comments index.html -o index.min.html
   ```

2. **Cache headers**: Já configurado nos exemplos acima

3. **CDN**: Ativado automaticamente em Netlify, Vercel e Firebase

---

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:

- [ ] Site carrega corretamente
- [ ] Login com Google funciona
- [ ] Pode criar posts
- [ ] Likes e comentários funcionam
- [ ] Busca funciona
- [ ] Temas claro/escuro funcionam
- [ ] Multi-idioma funciona
- [ ] Responsivo em mobile
- [ ] HTTPS ativo (cadeado verde)

## 🐛 Troubleshooting

### Erro: "Sign-In não funciona"

✅ **Solução**:
- Verifique se adicionou o domínio nas "Origens autorizadas" do Google Console
- Aguarde 5 minutos após adicionar (propagação)
- Limpe cache do navegador

### Erro: "localStorage não salva"

✅ **Solução**:
- Verifique se o site está em HTTPS
- Alguns navegadores bloqueiam localStorage em HTTP

### Erro: "Imagens não carregam"

✅ **Solução**:
- Verifique permissões de câmera/galeria no browser
- Teste em navegador diferente

---

## 📞 Suporte

Problemas? Entre em contato:
- Email: animalspicturehelp@gmail.com
- GitHub Issues: https://github.com/seu-usuario/animals-picture/issues

---

<div align="center">
  <p>Boa sorte com o deployment! 🚀🐾</p>
</div>
