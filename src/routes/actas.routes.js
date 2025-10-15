const { Router } = require('express');
const {
  createActaEntranteGratis,
  createActaSalienteGratis,
  createActaMaximaAutoridadGratis,
  createActaMaximaAutoridadPaga,
  createActaEntrantePaga,
  createActaSalientePaga,
} = require('../controllers/actas.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = Router();

// Rutas para crear actas (versiones que solo guardan en Sheets)
router.post('/entrante-gratis', createActaEntranteGratis);
router.post('/saliente-gratis', createActaSalienteGratis);
router.post('/maxima-autoridad-gratis', createActaMaximaAutoridadGratis);

// Rutas para actas de pago (requieren autenticación)
router.post('/maxima-autoridad-paga', authenticateToken, createActaMaximaAutoridadPaga);
router.post('/entrante-paga', authenticateToken, createActaEntrantePaga);
router.post('/saliente-paga', authenticateToken, createActaSalientePaga);

module.exports = router;
