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
 * @param {string} userName - El nombre del usuario para personalizar el saludo.
 * @returns {Promise<boolean>}
 */
const sendConfirmationEmail = async (to, token, userName) => {
  // Asegúrate de que esta URL sea la correcta para tu frontend.
  const frontendUrl = process.env.FRONTEND_URL || 'https://acta-entrega.netlify.app';
  const confirmationUrl = `${frontendUrl}/verificar-email?token=${token}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        
        <h2 style="color: #001A70; text-align: center;">¡Bienvenido a Universitas!</h2>
        <p style="font-size: 16px;">¡Hola, <strong>${userName || 'nuevo usuario'}</strong>!</p>
        <p>Gracias por registrarte en nuestra plataforma de Actas de Entrega. Para completar tu registro y activar tu cuenta, por favor haz clic en el botón de abajo.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #001A70; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                Activar mi Cuenta
            </a>
        </div>
        
        <p>Una vez que actives tu cuenta, podrás iniciar sesión y comenzar a gestionar tus actas de forma eficiente.</p>
        
        <p style="font-size: 12px; color: #777;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
        <p style="font-size: 12px; color: #777; word-break: break-all;">${confirmationUrl}</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <p style="font-size: 12px; color: #777; text-align: center;">Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
    </div>
  `;

  return sendEmail(to, 'Confirma tu correo electrónico en Universitas', htmlContent);
};

module.exports = {
  sendEmail,
  sendConfirmationEmail,
};
