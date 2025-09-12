// --- 1. Importaciones ---
require('dotenv').config(); // Carga las variables de entorno desde .env
const express = require('express');
const cors = require('cors');
const sheets = require('./services/sheets.service'); // Importar el servicio

// --- 2. Inicialización ---
const app = express();
const PORT = process.env.PORT || 3000;

// ▼▼▼ AÑADE ESTA LÍNEA AQUÍ ▼▼▼
app.set('trust proxy', 1); // Confía en el primer proxy (el de Render)

// --- 3. Middlewares ---
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Permite al servidor entender JSON en el cuerpo de las peticiones
app.use(express.urlencoded({ extended: true })); // Permite entender cuerpos de formularios

// --- 4. Rutas ---
// Mensaje de bienvenida en la raíz
app.get('/', (req, res) => {
  res.send('API de Asistente de Manuales 2.0 está funcionando.');
});

// Montaje de las rutas de la API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/actas', require('./routes/actas.routes'));
app.use('/api/redirect', require('./routes/redirect.routes'));


// --- 5. Middleware de Manejo de Errores ---

// Este middleware se ejecutará si ninguna ruta anterior coincide
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Este middleware se ejecutará si ocurre un error en alguna ruta
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// --- 6. Iniciar Servidor ---
const startServer = async () => {
  //await sheets.init(); // Inicializar Google Sheets antes de iniciar el servidor
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
};

startServer();
