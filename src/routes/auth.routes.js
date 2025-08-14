const { Router } = require('express');
const { 
  loginController, 
  registerCredentialsController,
  registerProfileController,
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  verifyAccountController,
} = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = Router();

// Ruta de Login
router.post('/login', loginController);

// Ruta de Registro
router.post('/register', registerCredentialsController);

// --- Rutas Adicionales (actualmente no implementadas en el controlador) ---

// Se deja la estructura por si se implementa el registro en 2 pasos
router.post('/register/profile', authenticateToken, registerProfileController);

// Rutas para recuperación de contraseña
router.post('/forgot-password', forgotPasswordController);
router.post('/verify-otp', verifyOtpController);
router.post('/reset-password', authenticateToken, resetPasswordController);

// Ruta para verificar cuenta
router.post('/verify-account', verifyAccountController);

module.exports = router;
