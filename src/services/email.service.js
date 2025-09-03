const nodemailer = require('nodemailer');

// Asumiendo que EMAIL_PORT está definido en .env, si no, podría usar un valor por defecto o causar problemas.
// Para Gmail, los puertos comunes son 465 (SSL) o 587 (TLS).
// Las credenciales proporcionadas no especifican un puerto, así que asumiremos que se maneja por process.env.EMAIL_PORT.
// Si EMAIL_PORT no está configurado, la línea secure: process.env.EMAIL_PORT == 465 podría comportarse de forma inesperada.
// Es una buena práctica asegurarse de que EMAIL_PORT esté configurado en .env.

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10), // Por defecto a 587 si no se proporciona
  secure: process.env.EMAIL_PORT == 465, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envía un correo electrónico.
 * @param {string} to - El destinatario del correo.
 * @param {string} subject - El asunto del correo.
 * @param {string} html - El cuerpo del correo en formato HTML.
 * @returns {Promise<boolean>}
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Soporte" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Correo enviado a ${to}`);
    return true;
  } catch (error) {
    console.error(`Error al enviar correo a ${to}:`, error);
    return false;
  }
};

/**
 * Envía un correo de confirmación de email con un enlace.
 * @param {string} to - El email del destinatario.
 * @param {string} token - El token de confirmación.
 * @returns {Promise<boolean>}
 */
const sendConfirmationEmail = async (to, token) => {
  const confirmationUrl = `https://actaentrega.onrender.com/api/auth/confirm-email/${token}`; // Asumiendo localhost:3000 como URL base

  const htmlContent = `
    <h1>Confirma tu dirección de correo electrónico</h1>
    <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para confirmar tu dirección de correo electrónico:</p>
    <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
    <p>Si no te registraste, por favor ignora este correo.</p>
  `;

  return sendEmail(to, 'Confirma tu correo electrónico', htmlContent);
};

module.exports = {
  sendEmail,
  sendConfirmationEmail, // Exportar la nueva función
};
