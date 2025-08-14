const sheets = require('./sheets.service');

const USERS_SHEET = 'Login';

/**
 * Busca un usuario por su email.
 * @param {string} email - El email a buscar.
 * @returns {Promise<object|null>}
 */
const findUserByEmail = async (email) => {
  try {
    return await sheets.findRowByValueInColumn(USERS_SHEET, 'Usuario', email);
  } catch (error) {
    console.error('Error al buscar usuario por email en el servicio:', error);
    return null;
  }
};

/**
 * Busca un usuario por su token de reseteo.
 * @param {string} token - El token a buscar.
 * @returns {Promise<object|null>}
 */
const findUserByResetToken = async (token) => {
  try {
    return await sheets.findRowByValueInColumn(USERS_SHEET, 'resetToken', token);
  } catch (error) {
    console.error('Error al buscar usuario por token en el servicio:', error);
    return null;
  }
};

/**
 * Crea un nuevo usuario en la hoja de cálculo.
 * @param {Array<string>} userData - Array con los datos del usuario en el orden de las columnas.
 * @returns {Promise<boolean>}
 */
const createUser = async (userData) => {
    try {
        return await sheets.appendSheetData(USERS_SHEET, userData);
    } catch (error) {
        console.error('Error al crear usuario en el servicio:', error);
        return false;
    }
};

/**
 * Actualiza una celda específica para un usuario.
 * @param {string} sheetName - El nombre de la hoja.
 * @param {string} range - La celda a actualizar (ej: 'C5').
 * @param {string} value - El nuevo valor.
 * @returns {Promise<boolean>}
 */
const updateUserCell = async (sheetName, range, value) => {
    try {
        return await sheets.updateCell(sheetName, range, value);
    } catch (error) {
        console.error('Error al actualizar celda en el servicio:', error);
        return false;
    }
};


module.exports = {
  findUserByEmail,
  findUserByResetToken,
  createUser,
  updateUserCell,
};
