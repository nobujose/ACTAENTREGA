// src/controllers/user.controller.js

const bcrypt = require('bcryptjs');
const userService = require('../services/user.service');
const sheets = require('../services/sheets.service');

const POPUP_DATA_SHEET = 'PopupData';

const getProfile = async (req, res) => {
  try {
    const { email } = req.user;
    const [loginData, popupData] = await Promise.all([
      userService.findUserByEmail(email),
      userService.findPopupDataByEmail(email)
    ]);

    if (!loginData) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const profileData = {
      nombre: loginData.Nombre || '',
      apellido: loginData.Apellido || '',
      telefono: loginData.Telefono || '',
      institucion: popupData?.Institucion || '',
      cargo: popupData?.Cargo || '',
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email } = req.user;
    const { nombre, apellido, telefono, institucion, cargo } = req.body;

    if (!nombre || !apellido || !telefono || !institucion || !cargo) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    await sheets.updateCell('Login', user.rowNum, 'Nombre', nombre);
    await sheets.updateCell('Login', user.rowNum, 'Apellido', apellido);
    await sheets.updateCell('Login', user.rowNum, 'Telefono', telefono);

    const popupData = await userService.findPopupDataByEmail(email);
    if (popupData && popupData.rowNum) {
        await sheets.updateCell('PopupData', popupData.rowNum, 'Institucion', institucion);
        await sheets.updateCell('PopupData', popupData.rowNum, 'Cargo', cargo);
    } else {
        const newPopupRow = [email, institucion, cargo, '', new Date().toISOString()];
        await sheets.appendSheetData(POPUP_DATA_SHEET, newPopupRow);
    }
    
    res.json({ message: 'Perfil actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const verifyPasswordController = async (req, res) => {
    res.status(501).json({ message: "Función no implementada." });
};

const changePasswordController = async (req, res) => {
  try {
    const { email } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la actual.' });
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.Password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const success = await userService.updateUserPassword(email, hashedNewPassword);
    
    if (!success) {
      return res.status(500).json({ message: 'No se pudo actualizar la contraseña.' });
    }

    res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getAllUsers = async (req, res) => {
    res.status(501).json({ message: "Función no implementada." });
};

const updateUserRole = async (req, res) => {
    res.status(501).json({ message: "Función no implementada." });
};

// ▼▼▼ FUNCIÓN RESTAURADA ▼▼▼
const completeInitialProfile = async (req, res) => {
  try {
    const { email } = req.user;
    const { institucion, cargo, plazoEntregaActa } = req.body;
    if (!institucion || !cargo || !plazoEntregaActa) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
    const newPopupRow = [email, institucion, cargo, plazoEntregaActa, new Date().toISOString()];
    await sheets.appendSheetData(POPUP_DATA_SHEET, newPopupRow);
    const user = await userService.findUserByEmail(email);
    if (user) {
      await sheets.updateCell('Login', user.rowNum, 'isFirstLogin', 'FALSE');
    }
    res.json({ message: 'Perfil completado exitosamente.' });
  } catch (error) {
    console.error('Error al completar el perfil inicial:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
// ▲▲▲ FIN DE LA FUNCIÓN RESTAURADA ▲▲▲
// ▼▼▼ AÑADE ESTA NUEVA FUNCIÓN ▼▼▼
const deleteAccountController = async (req, res) => {
  try {
    const { email } = req.user;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'La contraseña es requerida para confirmar.' });
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.Password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'La contraseña es incorrecta.' });
    }

    // Si la contraseña es correcta, procede a eliminar todos los datos
    const success = await userService.deleteUserByEmail(email);
    if (!success) {
      return res.status(500).json({ message: 'Ocurrió un error al eliminar los datos de la cuenta.' });
    }

    res.json({ message: 'Tu cuenta y todos tus datos han sido eliminados permanentemente.' });

  } catch (error) {
    console.error('Error en deleteAccountController:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};


module.exports = {
  getProfile,
  deleteAccountController,
  updateProfile,
  verifyPasswordController,
  changePasswordController,
  getAllUsers,
  updateUserRole,
  completeInitialProfile,
};