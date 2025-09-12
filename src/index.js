// src/index.js

// 1. Detectives de errores globales (se quedan como estaban)
process.on('uncaughtException', (error, origin) => {
  console.error('<<<<< ERROR INESPERADO (UNCAUGHT EXCEPTION) >>>>>');
  console.error(error);
  console.error('Origen del error:', origin);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('<<<<< PROMESA NO CONTROLADA (UNHANDLED REJECTION) >>>>>');
  console.error('Razón del fallo:', reason);
});


// 2. Importaciones
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Importamos todas tus rutas y servicios
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const aiRoutes = require('./routes/ai.routes');
const actasRoutes = require('./routes/actas.routes');
const redirectRoutes = require('./routes/redirect.routes');


// 3. Inicialización de Express
const app = express();
const PORT = process.env.PORT || 3000;


// 4. Middlewares
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`-> Petición Recibida: ${req.method} ${req.originalUrl}`);
  next();
});


// 5. Rutas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/actas', actasRoutes);
app.use('/api/redirect', redirectRoutes);

app.get('/', (req, res) => {
  res.send('API de Asistente de Manuales 2.0 está funcionando.');
});


// 6. Middlewares de Manejo de Errores (al final)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});


// 7. Iniciar Servidor (con try-catch)
try {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log('El servidor arrancó exitosamente y está en espera de peticiones.');
  });
} catch (error) {
  console.error('<<<<< ERROR CRÍTICO AL INICIAR EL SERVIDOR >>>>>');
  console.error(error);
  process.exit(1);
}

// 8. "Oyente" del proceso de salida
process.on('exit', (code) => {
  console.log(`El proceso está a punto de terminar con el código: ${code}`);
});