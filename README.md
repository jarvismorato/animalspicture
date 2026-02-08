# 🐾 Animals Picture

![Animals Picture](https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=1200&q=80)

**A melhor rede social para amantes de animais!** Compartilhe fotos de cães, gatos, pássaros e mais. Descubra raças, conecte-se com outros tutores e faça parte de nossa comunidade.

## ✨ Características

- 📸 **Compartilhamento de Fotos** - Publique fotos dos seus animais favoritos
- 🔍 **Busca Inteligente** - Encontre posts por descrição, categoria ou usuário
- 🌍 **Multi-idioma** - Suporte para Português, Inglês e Espanhol
- 🌙 **Temas** - Modo escuro e claro
- 💬 **Interação Social** - Likes, comentários e compartilhamento
- 💎 **Premium** - Posts ilimitados e sem anúncios
- 📱 **Responsivo** - Funciona perfeitamente em mobile e desktop
- ♿ **Acessível** - Otimizado para screen readers e navegação por teclado
- 💾 **Backup** - Exporte e importe seus dados

## 🚀 Início Rápido

### Pré-requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conta Google (para autenticação)

### Instalação

1. **Clone ou baixe o repositório**
   ```bash
   git clone https://github.com/seu-usuario/animals-picture.git
   cd animals-picture
   ```

2. **Abra o arquivo `index.html` em um navegador**
   ```bash
   # Windows
   start index.html
   
   # Mac
   open index.html
   
   # Linux
   xdg-open index.html
   ```

3. **Ou use um servidor local (recomendado)**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (http-server)
   npx http-server -p 8000
   ```
   Acesse: `http://localhost:8000`

## 📁 Estrutura do Projeto

```
animals-picture/
├── index.html          # Página principal (HTML semântico com SEO)
├── styles.css          # Estilos (tema escuro/claro, responsivo)
├── app.js              # Lógica da aplicação
├── config.js           # Configurações e traduções
├── README.md           # Este arquivo
└── DEPLOYMENT.md       # Guia de deployment
```

## 🎨 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com variáveis CSS
- **Vanilla JavaScript** - Sem dependências externas
- **Google Sign-In** - Autenticação OAuth2
- **Google AdSense** - Monetização (opcional)
- **LocalStorage API** - Armazenamento local de dados

## 🔧 Configuração

### 1. Google OAuth (Obrigatório)

Edite `config.js` e substitua o Client ID:

```javascript
const CONFIG = {
    GOOGLE_CLIENT_ID: "SEU-CLIENT-ID-AQUI.apps.googleusercontent.com",
    // ...
};
```

Veja [DEPLOYMENT.md](DEPLOYMENT.md) para instruções detalhadas.

### 2. Google AdSense (Opcional)

Se quiser monetizar com anúncios:

```javascript
const CONFIG = {
    // ...
    ADSENSE_CLIENT_ID: "ca-pub-SEUS-NUMEROS",
    ADSENSE_SLOT: "SEU-SLOT-ID",
};
```

### 3. Email do Administrador

```javascript
const CONFIG = {
    // ...
    ADMIN_EMAIL: "seu-email@exemplo.com",
};
```

## 🌟 Funcionalidades Principais

### 📝 Publicar Posts

1. Faça login com sua conta Google
2. Selecione uma categoria e raça
3. Tire uma foto ou escolha da galeria
4. Escreva uma descrição
5. Publique!

### 🔍 Buscar Posts

Use a barra de busca no topo para encontrar posts por:
- Descrição
- Categoria
- Nome do usuário

### 💬 Interagir

- **Curtir** - Clique no coração
- **Comentar** - Escreva no campo abaixo do post
- **Compartilhar** - Use o botão de compartilhamento
- **Denunciar** - Reporte conteúdo inadequado

### 💎 Premium

Benefícios:
- ✨ Posts ilimitados (vs 29 posts grátis)
- 🎨 Badge Premium exclusivo
- 🚫 Sem anúncios

Preço: R$ 2,99/mês

### 💾 Backup de Dados

1. **Exportar**: Configurações → Backup → Exportar Dados
2. **Importar**: Configurações → Backup → Importar Dados

## 🌍 Idiomas Suportados

- 🇧🇷 Português (Brasil)
- 🇺🇸 English (Estados Unidos)
- 🇪🇸 Español (Espanha)

Altere em: Configurações → Idioma

## ⚡ Performance

- ⚡ **Leve** - Sem frameworks pesados
- 📦 **Compressão de Imagens** - Reduz tamanho automático
- 🚀 **Lazy Loading** - Carrega imagens sob demanda
- 💨 **Cache Inteligente** - LocalStorage para dados

## ♿ Acessibilidade

- ✅ ARIA labels completos
- ✅ Navegação por teclado
- ✅ Alto contraste
- ✅ Compatível com screen readers
- ✅ Textos alternativos em imagens

## 🔒 Segurança e Privacidade

- 🔐 **Autenticação Google OAuth2** - Seguro e confiável
- 💾 **Dados Locais** - Armazenados apenas no seu navegador
- ⚠️ **Limitação** - Dados podem ser perdidos ao limpar cache

> **Nota**: Para produção real, recomendamos implementar um backend para persistência e segurança dos dados.

## 🐛 Problemas Conhecidos

- Dados armazenados apenas localmente (pode ser perdidos)
- Limite de ~5-10MB do localStorage
- Sem sincronização entre dispositivos

## 📝 TODO / Melhorias Futuras

- [ ] Backend real (Firebase, Node.js)
- [ ] Sincronização multi-dispositivo
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Chat em tempo real
- [ ] Moderação automática de conteúdo
- [ ] Analytics de posts
- [ ] Suporte a vídeos

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📧 Suporte

Precisa de ajuda? Entre em contato:

- 📧 Email: animalspicturehelp@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/animals-picture/issues)

## 👏 Agradecimentos

- Ícones: Emoji nativo
- Imagens de exemplo: [Unsplash](https://unsplash.com)
- Avatars: [UI Avatars](https://ui-avatars.com)
- Autenticação: [Google Identity Services](https://developers.google.com/identity)

---

<div align="center">
  <p>Feito com ❤️ para amantes de animais 🐾</p>
  <p>© 2024-2026 Animals Picture. Todos os direitos reservados.</p>
</div>
