const sheets = require('./sheets.service');
const crypto = require('crypto'); // Importar crypto para generación de tokens

const USERS_SHEET = 'Login';
const EMAIL_CONFIRMATION_TOKEN_COLUMN = 'ail_confirmat'; // Corregido según la imagen del usuario
const IS_EMAIL_VERIFIED_COLUMN = 'email_confirmation'; // Corregido según el log de encabezados
const REGISTRATION_TIMESTAMP_COLUMN = 'registration_timestamp'; // Nueva columna para el timestamp

// Helper para obtener la letra de la columna a partir del índice (basado en 0)
// A=0, B=1, ..., Z=25, AA=26, AB=27, ...
const getColumnLetter = (colIndex) => {
    let temp, letter = '';
    while (colIndex >= 0) {
        temp = colIndex % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        colIndex = Math.floor(colIndex / 26) - 1;
    }
    return letter;
};

/**
 * Busca un usuario por su email.
 * @param {string} email - El email a buscar.
 * @returns {Promise<object|null>} - Objeto de usuario incluyendo rowNum, email, token y estado de verificación.
 */
const findUserByEmail = async (email) => {
  try {
    const result = await sheets.findRowByValueInColumn(USERS_SHEET, 'Usuario', email);
    if (result && result.user) {
        const userObject = result.user;
        userObject.rowNum = result.rowIndex; // Add row number to the user object
        // Añadiremos valores por defecto para las nuevas columnas si faltan en el objeto devuelto.
        userObject[EMAIL_CONFIRMATION_TOKEN_COLUMN] = userObject[EMAIL_CONFIRMATION_TOKEN_COLUMN] || null;
        userObject[IS_EMAIL_VERIFIED_COLUMN] = userObject[IS_EMAIL_VERIFIED_COLUMN] || false;
        return userObject;
    }
    return null;
  } catch (error) {
    console.error('Error al buscar usuario por email en el servicio:', error);
    return null;
  }
};

/**
 * Busca un usuario por su token de reseteo.
 * @param {string} token - El token a buscar.
 * @returns {Promise<object|null>} - Objeto de usuario incluyendo rowNum, email, token y estado de verificación.
 */
const findUserByResetToken = async (token) => {
  try {
    const result = await sheets.findRowByValueInColumn(USERS_SHEET, 'resetToken', token);
    if (result && result.user) {
        const userObject = result.user;
        userObject.rowNum = result.rowIndex; // Add row number to the user object
        userObject[EMAIL_CONFIRMATION_TOKEN_COLUMN] = userObject[EMAIL_CONFIRMATION_TOKEN_COLUMN] || null;
        userObject[IS_EMAIL_VERIFIED_COLUMN] = userObject[IS_EMAIL_VERIFIED_COLUMN] || false;
        return userObject;
    }
    return null;
  } catch (error) {
    console.error('Error al buscar usuario por token en el servicio:', error);
    return null;
  }
};

/**
 * Busca un usuario por su token de confirmación de email.
 * @param {string} token - El token de confirmación a buscar.
 * @returns {Promise<object|null>} - Objeto de usuario incluyendo rowNum, email, token y estado de verificación.
 */
const findUserByConfirmationToken = async (token) => {
  try {
    const result = await sheets.findRowByValueInColumn(USERS_SHEET, EMAIL_CONFIRMATION_TOKEN_COLUMN, token);
    if (result && result.user) {
        const userObject = result.user;
        userObject.rowNum = result.rowIndex; // Add row number to the user object
        userObject[EMAIL_CONFIRMATION_TOKEN_COLUMN] = userObject[EMAIL_CONFIRMATION_TOKEN_COLUMN] || null;
        userObject[IS_EMAIL_VERIFIED_COLUMN] = userObject[IS_EMAIL_VERIFIED_COLUMN] || false;
        return userObject;
    }
    return null;
  } catch (error) {
    console.error('Error al buscar usuario por token de confirmación en el servicio:', error);
    return null;
  }
};

// ▼▼▼ REEMPLAZA LA FUNCIÓN createUser CON ESTA VERSIÓN CORREGIDA ▼▼▼
/**
 * Crea un nuevo usuario en la hoja de cálculo, coincidiendo con la estructura de 15 columnas.
 * @param {Array<any>} userDataArray - Array con los datos iniciales [ID, Usuario, Password, Nombre, Apellido, Telefono].
 * @returns {Promise<string|null>} - El token de confirmación.
 */
const createUser = async (userDataArray) => {
    try {
        const [id, email, password, nombre, apellido, telefono] = userDataArray;

        // Generamos los valores necesarios para el registro
        const token = crypto.randomBytes(20).toString('hex');
        const isEmailVerified = 'FALSE';
        const rol = 'User';
        const isFirstLogin = 'TRUE'; // ¡Clave! Marcamos al nuevo usuario para que vea el popup.

        // Creamos la fila completa con 15 columnas, en el orden exacto de tu hoja.
        // Los campos que se llenan después (como otp o plazoEntrega) se dejan vacíos.
        const newUserRowData = [
            id,                     // 1. ID
            email,                  // 2. Usuario
            password,               // 3. Password
            nombre,                 // 4. Nombre
            apellido,               // 5. Apellido
            telefono,               // 6. Telefono
            isEmailVerified,        // 7. email_confirmation
            token,                  // 8. ail_confirmat (token de confirmación)
            '',                     // 9. otp (vacío)
            '',                     // 10. otp_expires_at (vacío)
            rol,                    // 11. Rol
            new Date().toLocaleTimeString(), // 12. hora
            new Date().toLocaleDateString(), // 13. fecha
            '',                     // 14. plazoEntregaActa (vacío)
            isFirstLogin,           // 15. isFirstLogin
        ];

        const success = await sheets.appendSheetData(USERS_SHEET, newUserRowData);
        return success ? token : null;

    } catch (error) {
        console.error('Error al crear usuario en el servicio:', error);
        return null;
    }
};
// ▲▲▲ FIN DE LA FUNCIÓN CORREGIDA ▲▲▲

/**
 * Actualiza el estado de verificación de email de un usuario.
 * @param {string} userIdentifier - El email o ID del usuario.
 * @returns {Promise<boolean>}
 */
const verifyUserEmail = async (userIdentifier) => {
    try {
        // Primero, encontrar al usuario para obtener su número de fila y datos actuales
        const user = await findUserByEmail(userIdentifier); // Usar findUserByEmail para obtener datos del usuario incluyendo rowNum

        if (!user || user.rowNum === undefined) {
            console.error('Usuario no encontrado para verificar email.');
            return false;
        }

        // Actualizar la celda con 'true'
        return await sheets.updateCell(USERS_SHEET, user.rowNum, IS_EMAIL_VERIFIED_COLUMN, true);
    } catch (error) {
        console.error('Error al verificar email del usuario en el servicio:', error);
        return false;
    }
};

/**
 * Elimina una fila específica de una hoja de cálculo.
 * @param {string} email - El email del usuario a eliminar.
 * @returns {Promise<boolean>}
 */
const deleteUserByEmail = async (email) => {
    try {
        const user = await findUserByEmail(email);
        if (!user || user.rowNum === undefined) {
            console.error('Usuario no encontrado para eliminar.');
            return false;
        }
        return await sheets.deleteRow(USERS_SHEET, user.rowNum);
    } catch (error) {
        console.error('Error al eliminar usuario por email:', error);
        return false;
    }
};


const updateUserPassword = async (email, newPassword) => {
  try {
    const user = await findUserByEmail(email);
    if (!user || user.rowNum === undefined) {
      console.error('Usuario no encontrado para actualizar contraseña.');
      return false;
    }

    return await sheets.updateCell(USERS_SHEET, user.rowNum, 'Password', newPassword);
  } catch (error) {
    console.error('Error al actualizar la contraseña del usuario en el servicio:', error);
    return false;
  }
};

const saveOtpForUser = async (email, otp) => {
  try {
    const user = await findUserByEmail(email);
    if (!user) return false;

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos de expiración
    await sheets.updateCell(USERS_SHEET, user.rowNum, 'otp', otp);
    await sheets.updateCell(USERS_SHEET, user.rowNum, 'otp_expires_at', expiresAt.toISOString());
    return true;
  } catch (error) {
    console.error('Error al guardar el OTP para el usuario:', error);
    return false;
  }
};

const findUserByOtp = async (otp) => {
  try {
    const result = await sheets.findRowByValueInColumn(USERS_SHEET, 'otp', otp);
    if (result && result.user) {
        const userObject = result.user;
        userObject.rowNum = result.rowIndex;
        return userObject;
    }
    return null;
  } catch (error) {
    console.error('Error al buscar usuario por OTP:', error);
    return null;
  }
};

const clearOtpForUser = async (email) => {
  try {
    const user = await findUserByEmail(email);
    if (!user) return false;

    await sheets.updateCell(USERS_SHEET, user.rowNum, 'otp', '');
    await sheets.updateCell(USERS_SHEET, user.rowNum, 'otp_expires_at', '');
    return true;
  } catch (error) {
    console.error('Error al limpiar el OTP para el usuario:', error);
    return false;
  }
};

module.exports = {
  findUserByEmail,
  findUserByResetToken,
  createUser,
  updateUserPassword,
  findUserByConfirmationToken, // Exportar la nueva función
  verifyUserEmail, // Exportar la nueva función
  deleteUserByEmail, // Exportar la nueva función
  saveOtpForUser,
  findUserByOtp,
  clearOtpForUser,
};
