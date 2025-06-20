# Smart Recipe

Proyecto Full Stack con integración de IA para generar recetas personalizadas, login, registro y dashboard con conexión a OpenAI GPT-4.

## 🧠 ¿Qué hace?

- Registro e inicio de sesión de usuarios (JWT).
- Generador de recetas personalizado vía OpenAI (`/api/openai/chat`).
- Frontend en React con Vite y Context API.
- Backend en Flask con SQLAlchemy.
- Comunicación full API RESTful (`/api/login`, `/api/register`, `/api/hello`, `/api/openai/chat`).

---

## ⚙️ Puesta en marcha en GitHub Codespaces

1. **Abre este repositorio en Codespaces**  
   (haz clic en "Code" → "Codespaces" → "Create codespace")

2. **Instala dependencias del backend:**

```bash
pip install -r requirements.txt
```

3. **Arranca el backend Flask:**

```bash
flask run --host=0.0.0.0 --port=5000
```

4. **Configura tu API Key de OpenAI:**  
   Crea un archivo `.env` en la raíz con:

```env
OPENAI_API_KEY=tu_clave_aqui
```

---

### 🚀 Frontend (React + Vite)

1. En una nueva terminal:

```bash
cd src/front
npm install
npm run dev
```

2. Abre el puerto `5173` en Codespaces para ver la app.

---

## 🧪 Rutas útiles

- `POST /api/register` – Registro de usuario
- `POST /api/login` – Login y JWT
- `POST /api/openai/chat` – Consulta personalizada a OpenAI
- `GET /api/hello` – Prueba de conexión

---

## 👥 Autores

- **Erik**
- **Ousama**
- **Samuel**
- **Tito**
