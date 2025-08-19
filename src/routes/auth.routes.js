const { Router } = require('express');
const {
  loginController,
  registerCredentialsController,
  // registerProfileController, // Comentado porque no está implementado
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  // verifyAccountController, // Comentado porque no está implementado
  confirmEmailController // Importar la nueva función del controlador
} = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { loginLimiter } = require('../middleware/rateLimiter.middleware'); // Importar el middleware de limitación de tasa
const { validateRegistration, validateLogin } = require('../middleware/validation.middleware'); // Importar validaciones
const { registerLimiter } = require('../middleware/rateLimiter.middleware'); // Importar el middleware de limitación de tasa para registro

const router = Router();

// Ruta de Login
router.post('/login', loginLimiter, validateLogin, loginController); // Aplicar limitación de tasa y validación

// Ruta de Registro
router.post('/register', registerLimiter, validateRegistration, registerCredentialsController); // Aplicar limitación de tasa y validación

// --- Rutas Adicionales (actualmente no implementadas en el controlador) ---

// Se deja la estructura por si se implementa el registro en 2 pasos
// router.post('/register/profile', authenticateToken, registerProfileController);

// Rutas para recuperación de contraseña
router.post('/forgot-password', forgotPasswordController);
router.post('/verify-otp', verifyOtpController);
router.post('/reset-password', authenticateToken, resetPasswordController);

// Ruta para verificar cuenta
// router.post('/verify-account', verifyAccountController);

// Ruta para confirmar el email
router.get('/confirm-email/:token', confirmEmailController); // Ruta de confirmación añadida

module.exports = router;
