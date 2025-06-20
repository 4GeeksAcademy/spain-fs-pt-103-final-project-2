# 📦 Instrucciones de despliegue: Render (Backend) + Vercel (Frontend)

---

## 🚀 Backend en Render

### 1. Crear nuevo servicio web
- Ve a [https://dashboard.render.com](https://dashboard.render.com)
- Crea un nuevo servicio **Web Service**
- Conecta tu repositorio de GitHub (donde hayas subido este proyecto)

### 2. Configuración
- **Name:** smart-recipe-backend
- **Environment:** Python
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `flask run --host=0.0.0.0 --port=10000`
- **Port:** 10000
- **Region:** Frankfurt (opcional)
- **Plan:** Free
- **Env Vars:**
  - `OPENAI_API_KEY` → tu clave personal de OpenAI

Render detectará automáticamente `render.yaml` y usará esa configuración si lo subes al repositorio.

---

## 🌐 Frontend en Vercel

### 1. Subir a GitHub la carpeta `src/front`

Puedes mover la carpeta `src/front` a un repositorio separado si lo prefieres.

### 2. Crear proyecto en Vercel

- Ve a [https://vercel.com](https://vercel.com)
- Importa tu repositorio
- **Framework preset:** Vite
- **Build Command:** `npm run build`
- **Output directory:** `dist`

### 3. Añadir variable de entorno en Vercel

- `VITE_API_URL` → URL pública de tu backend en Render (por ejemplo `https://smart-recipe-backend.onrender.com`)

---

## ✅ ¡Todo listo!

Una vez desplegados, el frontend se conectará automáticamente al backend y podrás probar registro, login, y generación de recetas vía OpenAI.

