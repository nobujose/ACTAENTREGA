const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
  // 1. Usar una variable de entorno para la URL del frontend.
  const frontendUrl = process.env.FRONTEND_URL || 'https://acta-entrega.netlify.app/login';
  
  // 2. Construir el enlace que apunta al frontend.
  const confirmationUrl = `${frontendUrl}/verificar-email?token=${token}`;

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
  sendConfirmationEmail,
};
