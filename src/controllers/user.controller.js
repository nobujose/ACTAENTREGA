// Controladores para la gestión del perfil de usuario

const getProfile = async (req, res) => {
  // En un futuro, esto buscaría los datos del usuario en la hoja de cálculo
  // y los devolvería. Por ahora, devolvemos la información del token.
  res.json({
    message: "Perfil del usuario",
    user: req.user,
  });
};

const updateProfile = async (req, res) => {
  res.status(501).json({ message: "Función no implementada." });
};

const verifyPasswordController = async (req, res) => {
    res.status(501).json({ message: "Función no implementada." });
};

const changePasswordController = async (req, res) => {
    res.status(501).json({ message: "Función no implementada." });
};

// --- Controladores de Admin ---

const getAllUsers = async (req, res) => {
    res.status(501).json({ message: "Función no implementada." });
};

const updateUserRole = async (req, res) => {
    res.status(501).json({ message: "Función no implementada." });
};

module.exports = {
  getProfile,
  updateProfile,
  verifyPasswordController,
  changePasswordController,
  getAllUsers,
  updateUserRole,
};
