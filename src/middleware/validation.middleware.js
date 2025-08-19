const { validationResult, body, check } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Reglas de validación para el registro
const validateRegistration = [
    check('email')
        .isEmail().withMessage('Debe ser un correo electrónico válido'),
    check('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    check('name')
        .notEmpty().withMessage('El nombre es requerido'),
    // Añadir validaciones para apellido, telefono, institucion, cargo si son necesarios
    handleValidationErrors
];

// Reglas de validación para el login
const validateLogin = [
    check('email')
        .isEmail().withMessage('Debe ser un correo electrónico válido'),
    check('password')
        .notEmpty().withMessage('La contraseña es requerida'),
    handleValidationErrors
];

module.exports = {
    validateRegistration,
    validateLogin,
};
