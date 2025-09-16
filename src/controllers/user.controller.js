// src/controllers/user.controller.js

// 1. Añadimos la importación del servicio de usuario que necesitaremos
// ▼▼▼ 1. AÑADE ESTA LÍNEA QUE FALTABA ▼▼▼
const sheets = require('../services/sheets.service');
const userService = require('../services/user.service');

// ▼▼▼ 1. AÑADE LA CONSTANTE QUE FALTABA AQUÍ ▼▼▼
const POPUP_DATA_SHEET = 'PopupData';

// --- TUS FUNCIONES EXISTENTES (SIN CAMBIOS) ---
const getProfile = async (req, res) => {
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


// ▼▼▼ 2. AÑADIMOS LA NUEVA FUNCIÓN AQUÍ ▼▼▼
// ▼▼▼ REEMPLAZA LA VERSIÓN ANTERIOR DE ESTA FUNCIÓN ▼▼▼
const completeInitialProfile = async (req, res) => {
  try {
    const { email } = req.user;
    const { institucion, cargo, plazoEntregaActa } = req.body;

    if (!institucion || !cargo || !plazoEntregaActa) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // 3. Creamos la nueva fila para la hoja PopupData
    const newPopupRow = [
      email,
      institucion,
      cargo,
      plazoEntregaActa,
      new Date().toISOString(),
    ];

    // 4. Guardamos los datos en la nueva hoja 'PopupData'
    await sheets.appendSheetData(POPUP_DATA_SHEET, newPopupRow);

    // 5. Buscamos al usuario en la hoja 'Login' para actualizar la bandera
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
// ▲▲▲ FIN DE LA FUNCIÓN MODIFICADA ▲▲▲


// 3. AÑADIMOS LA NUEVA FUNCIÓN AL OBJETO DE EXPORTACIÓN
module.exports = {
  getProfile,
  updateProfile,
  verifyPasswordController,
  changePasswordController,
  getAllUsers,
  updateUserRole,
  completeInitialProfile, // <-- Se añade aquí
};