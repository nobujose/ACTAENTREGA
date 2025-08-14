const { Router } = require('express');
const { 
  createActaEntranteGratis,
  createActaSalienteGratis,
  createActaMaximaAutoridadGratis,
  createActaMaximaAutoridadPaga,
  createActaEntrantePaga,
  createActaSalientePaga
} = require('../controllers/actas.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = Router();

// Todas las rutas de actas requieren autenticación
router.use(authenticateToken);

// Ruta para crear un Acta de Entrega Entrante (Gratis)
router.post('/entrante-gratis', createActaEntranteGratis);

// Ruta para crear un Acta de Entrega Saliente (Gratis)
router.post('/saliente-gratis', createActaSalienteGratis);

// Ruta para crear un Acta Máxima Autoridad (Gratis)
router.post('/maxima-autoridad-gratis', createActaMaximaAutoridadGratis);

// Ruta para crear un Acta Máxima Autoridad (Paga)
router.post('/maxima-autoridad-paga', createActaMaximaAutoridadPaga);

// Ruta para crear un Acta de Entrega Entrante (Paga)
router.post('/entrante-paga', createActaEntrantePaga);

// Ruta para crear un Acta de Entrega Saliente (Paga)
router.post('/saliente-paga', createActaSalientePaga);


// Aquí se añadirán las otras rutas para las demás actas

module.exports = router;
