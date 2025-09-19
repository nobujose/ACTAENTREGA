

// ▼▼▼ FUNCIÓN authenticateToken ACTUALIZADA ▼▼▼
// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const sheets = require('../services/sheets.service');

// ▼▼▼ REEMPLAZA TU FUNCIÓN authenticateToken CON ESTA VERSIÓN COMPLETA ▼▼▼
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación.' });
  }

  try {
    // Paso 1: Verificar si el token está en la lista negra
    const denylistData = await sheets.getSheetData('TokenDenylist!A:A');
    if (denylistData && denylistData.flat().includes(token)) {
      return res.status(403).json({ message: 'El token ha sido invalidado (sesión cerrada).' });
    }

    // Paso 2: Si no está en la lista negra, verificar el token con jwt
    const user = jwt.verify(token, process.env.JWT_SECRET);
    
    // Paso 3: Verificar si el email está confirmado
    if (!user.is_email_verified) {
        return res.status(403).json({ message: 'Por favor, verifica tu dirección de correo electrónico para acceder.' });
    }

    // Si todo está bien, adjuntamos el usuario a la petición y continuamos
    req.user = user;
    next();

  } catch (error) {
    // Este catch atrapará errores de jwt.verify (token expirado, inválido)
    // y también errores de la lectura de la hoja de cálculo.
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Token no válido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expirado.' });
    }
    console.error("Error en el middleware de autenticación:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};



const isAdmin = (req, res, next) => {
    // Este middleware asume que req.user ya está poblado y verificado
    // y que req.user contiene la propiedad 'role'.
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
};

const authenticateResetToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'No se proporcionó token de reseteo.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token de reseteo no válido o expirado.' });
    }

    // Asegurarse de que el token es específicamente para reseteo de contraseña
    if (user.purpose !== 'password-reset') {
      return res.status(403).json({ message: 'Token no válido para esta operación.' });
    }

    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
  isAdmin,
  authenticateResetToken,
};
