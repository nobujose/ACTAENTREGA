const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // TOKEN Bearer

  if (token == null) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido o expirado.' });
    }
    
    // Verificar si el email está verificado antes de continuar
    if (!user.is_email_verified) {
        return res.status(403).json({ message: 'Por favor, verifica tu dirección de correo electrónico para acceder.' });
    }

    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
    // Este middleware asume que req.user ya está poblado y verificado
    // y que req.user contiene la propiedad 'role'.
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
};

module.exports = {
  authenticateToken,
  isAdmin,
};
