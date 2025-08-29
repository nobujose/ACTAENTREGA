const rateLimit = require('express-rate-limit');

// Limiter para el endpoint de login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Limitar cada IP a 10 solicitudes por windowMs
    message: 'Demasiadas solicitudes de inicio de sesión desde esta IP, por favor intente de nuevo después de 15 minutos',
    standardHeaders: true, // Devolver información de limitación de tasa en las cabeceras `RateLimit-*`
    legacyHeaders: false, // Deshabilitar las cabeceras `X-RateLimit-*`
});

// Limiter para el endpoint de registro
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Limitar cada IP a 5 solicitudes por windowMs para registro
    message: 'Demasiadas solicitudes de registro desde esta IP, por favor intente de nuevo después de 15 minutos',
    standardHeaders: true,
    legacyHeaders: false,
});

// Wrapper para añadir logs al loginLimiter
const loginLimiterWithLog = async (req, res, next) => {
    console.log(`[RateLimiter] Intentando acceder a la ruta protegida por ${loginLimiter}. IP: ${req.ip}`);
    loginLimiter(req, res, next);
};

module.exports = {
    loginLimiter: loginLimiterWithLog,
    registerLimiter, // Exportar el nuevo limiter
};
