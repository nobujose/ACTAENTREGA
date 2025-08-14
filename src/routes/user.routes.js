const { Router } = require('express');
const {
  getProfile,
  updateProfile,
  verifyPasswordController,
  changePasswordController,
  getAllUsers,
  updateUserRole
} = require('../controllers/user.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

const router = Router();

// Todas las rutas de perfil requieren que el usuario esté autenticado.
router.use(authenticateToken);

// Obtener y actualizar perfil
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// Cambiar contraseña
router.post('/password/verify', verifyPasswordController);
router.put('/password/change', changePasswordController);

// --- RUTAS SOLO PARA ADMINS ---
router.get('/admin/users', isAdmin, getAllUsers);
router.put('/admin/role', isAdmin, updateUserRole);

module.exports = router;
