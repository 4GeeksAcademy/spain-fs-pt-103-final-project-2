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

---

### 🔧 Backend (Flask)

1. Instala dependencias:

```bash
pip install -r requirements.txt
```

2. Crea un archivo `.env` con tu clave de OpenAI:

```bash
echo "OPENAI_API_KEY=tu_clave_aqui" > .env
```

3. Exporta las variables de entorno necesarias:

```bash
export FLASK_APP=src/api/routes.py
export FLASK_RUN_HOST=0.0.0.0
export FLASK_RUN_PORT=5000
```

4. Inicia el servidor Flask:

```bash
flask run
```

---

### 💻 Frontend (React + Vite)

1. Abre una nueva terminal:

```bash
cd src/front
npm install
npm run dev
```

2. Abre el puerto `5173` en Codespaces para visualizar la app.

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
