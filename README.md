# RAG Chat Frontend

Frontend desarrollado en Next.js 15 con TypeScript para consumir un backend de FastAPI con funcionalidad RAG.

## 🚀 Características

- ✅ **Autenticación JWT** - Login/Register completo
- ✅ **Gestión de sesiones** - Crear, renombrar, eliminar
- ✅ **Upload de PDFs** - Drag & drop de documentos
- ✅ **Chat RAG** - Preguntas basadas en documentos
- ✅ **Fuentes** - Referencias con páginas y relevancia
- ✅ **Estado Zustand** - Manejo global eficiente
- ✅ **UI shadcn/ui** - Componentes elegantes
- ✅ **Error handling** - Sistema robusto

## ⚡ Instalación

```bash
npm install
npm run dev
```

**Backend requerido:** `http://localhost:8000`

## 🔐 Autenticación JWT

Login usa FormData (compatible con FastAPI OAuth2PasswordRequestForm):
- `username` (email del usuario)  
- `password`

## 📡 Endpoints Backend

```
POST /auth/login       # FormData login
POST /auth/register    # JSON register
GET /health           # Token validation
GET /sessions/        # List sessions
POST /sessions/       # Create session
GET /documents/       # List documents
POST /documents/upload # Upload PDF
GET /chat/messages/{session_id} # Get messages
POST /chat/message    # Send message
```

## 🏗 Estructura

```
app/
├── (auth)/login|register/
├── (chat)/page.tsx
└── page.tsx (redirect)

components/
├── chat/ - Interface de chat
├── sidebar/ - Sesiones y docs
└── providers/ - Auth y errors

store/ - Zustand stores
lib/ - API client y utils
types/ - TypeScript definitions
```

## 🚀 Listo!

El frontend está completo y listo para tu backend FastAPI.