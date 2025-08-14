const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { findUserByEmail, createUser, updateUserCell } = require('../services/user.service');
const { sendEmail } = require('../services/email.service');

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    const data = await findUserByEmail(email);
    if (!data) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const user = data.user;
    const isPasswordCorrect = await bcrypt.compare(password, user.Password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    const tokenPayload = {
      email: user.Usuario,
      name: user.Nombre,
      role: user.Rol,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login exitoso.',
      token,
      user: tokenPayload,
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

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
        const newUserRow = [
            uuidv4(),               // ID
            email,                  // Usuario
            hashedPassword,         // Contraseña
            name,                   // Nombre
            apellido || '',         // Apellido
            telefono || '',         // Telefono
            institucion || '',      // institución
            cargo || '',            // Cargo
            '',                     // resetToken
            '',                     // TokenTimeE
            'User'                  // Rol
        ];
        
        const success = await createUser(newUserRow);

        if (!success) {
            return res.status(500).json({ message: 'No se pudo registrar al usuario.' });
        }

        res.status(201).json({ message: 'Usuario registrado exitosamente. Por favor, inicie sesión.' });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// Placeholder for other functions to be added later
const registerProfileController = async (req, res) => { res.status(501).send('Not Implemented'); };
const forgotPasswordController = async (req, res) => { res.status(501).send('Not Implemented'); };
const resetPasswordController = async (req, res) => { res.status(501).send('Not Implemented'); };
const verifyOtpController = async (req, res) => { res.status(501).send('Not Implemented'); };
const verifyAccountController = async (req, res) => { res.status(501).send('Not Implemented'); };


module.exports = {
  loginController,
  registerCredentialsController,
  registerProfileController,
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  verifyAccountController,
};
