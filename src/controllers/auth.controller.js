const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { findUserByEmail, createUser, updateUserPassword, findUserByConfirmationToken, verifyUserEmail, deleteUserByEmail, saveOtpForUser, findUserByOtp, clearOtpForUser } = require('../services/user.service');
const { sendConfirmationEmail, sendPasswordResetEmail } = require('../services/email.service');
const { scheduleUserDeletion, cancelUserDeletion } = require('../services/scheduler.service'); // Importar el scheduler
const sheets = require('../services/sheets.service'); // Asegúrate de que sheets está importado
// ▼▼▼ REEMPLAZA TU FUNCIÓN DE LOGIN CON ESTA ▼▼▼
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.Password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }
    
    if (user['email_confirmation'] !== 'TRUE' && user['email_confirmation'] !== true) {
        return res.status(403).json({ message: 'Por favor, verifica tu dirección de correo electrónico para acceder.' });
    }

    // ¡AQUÍ ESTÁ EL CAMBIO CLAVE!
    // Ahora incluimos el 'apellido' en el objeto que se envía al frontend.
    const tokenPayload = {
      email: user.Usuario,
      name: user.Nombre,
      apellido: user.Apellido, // <-- AÑADIMOS ESTA LÍNEA
      role: user.Rol,
      is_email_verified: true,
      isFirstLogin: user.isFirstLogin === 'TRUE' || user.isFirstLogin === true,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login exitoso.',
      token,
      user: tokenPayload, // El frontend ahora recibirá el apellido
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
// ▲▲▲ FIN DE LA FUNCIÓN MODIFICADA ▲▲▲

// ▲▲▲ FIN DE LA FUNCIÓN MODIFICADA ▲▲▲
const logoutController = async (req, res) => {
  try {
    const { email } = req.user; // Obtenemos el email del token que nos envían
    const eventData = [new Date().toISOString(), email, 'Logout', 'Cierre de sesión'];
    await sheets.logEvent('SeguimientoUsuarios', eventData);
    res.status(200).json({ message: 'Logout registrado.' });
  } catch (error) {
    console.error('Error al registrar el evento de logout:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// --- (El resto de las funciones como registerCredentialsController, etc., no cambian)

const registerCredentialsController = async (req, res) => {
    try {
        // Campos obligatorios
        const { email, password, name } = req.body;
        // Campos opcionales
        const { apellido, telefono, institucion, cargo } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Construir la fila en el orden exacto de la hoja de Google Sheets
        // ID, Usuario, Password, Nombre, Apellido, Telefono, institución, Cargo, email_confirmation, ail_confirmat, Rol
        const newUserRow = [
            uuidv4(),               // ID
            email,                  // Usuario
            hashedPassword,         // Contraseña
            name,                   // Nombre
            apellido || '',         // Apellido
            telefono || '',         // Telefono
            institucion || '',      // institución
            cargo || '',            // Cargo
            // El token y el estado de verificación son manejados por createUser en user.service.js
            // No necesitamos pasarlos aquí si createUser los genera.
            // Sin embargo, createUser espera que userDataArray sea los datos *antes* del token/verificación.
            // Ajustemos createUser para aceptar estos como parámetros o manejarlos internamente.
            // Por ahora, asumiendo que createUser maneja la generación del token y lo añade.
            // El campo 'Rol' parece faltar en la llamada original a createUser, vamos a añadirlo si se espera.
            // Basado en el controlador de login, 'Rol' es usado. Asumamos que es 'User' por defecto.
            // La llamada anterior a createUser en el resultado de read_file tenía 'User' como el último elemento, que podría ser el Rol.
            // Ajustemos la llamada a createUser en user.service.js para incluir Rol.
            // Por ahora, asumamos que los datos pasados aquí son correctos para los campos iniciales.
        ];
        
        // Llamar a createUser que generará y devolverá el token
        const confirmationToken = await createUser(newUserRow);

        if (!confirmationToken) {
            return res.status(500).json({ message: 'No se pudo registrar al usuario.' });
            
        }

        // ▼▼▼ AQUÍ SE AÑADE LA NUEVA FUNCIONALIDAD ▼▼▼
        // Justo después de confirmar que el usuario fue creado, registramos el evento.
        try {
            const eventData = [new Date().toISOString(), email, 'Registro', 'Nuevo usuario creado'];
            await sheets.logEvent('SeguimientoUsuarios', eventData);
        } catch (logError) {
            console.error('Error al registrar el evento de seguimiento:', logError);
        }

        // Enviar correo de confirmación con el token devuelto
        await sendConfirmationEmail(email, confirmationToken, name); 
        res.status(201).json({ message: 'Usuario registrado exitosamente. Por favor, revisa tu correo electrónico para confirmar tu cuenta.' });

        // Programar la eliminación del usuario si no confirma el email en 10 minutos
        scheduleUserDeletion(email);

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }

    
};

/**
 * Controla la confirmación del email.
 * @param {object} req - Objeto de petición Express.
 * @param {object} res - Objeto de respuesta Express.
 */
const confirmEmailController = async (req, res) => {
  const { token } = req.params;
  console.log('Token recibido para confirmación:', token); // Añadir log para depuración
  try {
    const user = await findUserByConfirmationToken(token); // Usar la nueva función del servicio

    if (!user) {
      return res.status(404).json({ message: 'Token de confirmación inválido o expirado.' });
    }

    // Verificar si ya está verificado
    if (user['email_confirmation'] === 'TRUE' || user['email_confirmation'] === true) {
      return res.status(400).json({ message: 'Tu dirección de correo electrónico ya ha sido verificada.' });
    }

    // Marcar usuario como verificado
    const updateSuccess = await verifyUserEmail(user.Usuario); // Usar la nueva función del servicio, pasando el email como identificador

    if (!updateSuccess) {
        return res.status(500).json({ message: 'Ocurrió un error al actualizar el estado de verificación.' });
    }

    // Cancelar la eliminación programada del usuario
    cancelUserDeletion(user.Usuario);

    res.status(200).json({ message: 'Email verificado exitosamente.' });

  } catch (error) {
    console.error('Error al confirmar el email:', error);
    res.status(500).json({ message: 'Ocurrió un error al confirmar tu correo electrónico.' });
  }
};


// Marcador de posición para otras funciones a añadir más tarde
const registerProfileController = async (req, res) => { res.status(501).send('Not Implemented'); };


// ...

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await saveOtpForUser(email, otp);

    // 2. Llama a la nueva función estilizada, pasando el email, el OTP y el nombre del usuario
    await sendPasswordResetEmail(email, otp, user.Nombre); // Asumiendo que la columna se llama 'Nombre'

    res.json({ message: 'Se ha enviado un código de recuperación a tu correo electrónico.' });
  } catch (error) {
    console.error('Error en forgotPasswordController:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { email } = req.user; // Obtenido del token JWT a través de authenticateToken

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'La nueva contraseña y la confirmación son requeridas.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(email, hashedPassword);

    res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error('Error en resetPasswordController:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await findUserByEmail(email);

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'OTP inválido.' });
    }

    const now = new Date();
    const otpExpiresAt = new Date(user.otp_expires_at);

    if (now > otpExpiresAt) {
      return res.status(400).json({ message: 'OTP expirado.' });
    }

    await clearOtpForUser(email);

    // Generar un token temporal para el reseteo de contraseña
    const resetToken = jwt.sign({ email: user.Usuario, purpose: 'password-reset' }, process.env.JWT_SECRET, { expiresIn: '10m' });

    res.json({ message: 'OTP verificado exitosamente.', resetToken });
  } catch (error) {
    console.error('Error en verifyOtpController:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
const verifyAccountController = async (req, res) => { res.status(501).send('Not Implemented'); };


module.exports = {
  loginController,
  registerCredentialsController,
  registerProfileController,
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  verifyAccountController,
  confirmEmailController, // Exportar la nueva función del controlador
  logoutController, // <-- Añade la nueva función al exporte
};
