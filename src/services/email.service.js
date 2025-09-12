// src/services/email.service.js
const nodemailer = require('nodemailer');

// 1. CONFIGURACIÓN DEL TRANSPORTER
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_PORT == 465, // true para puerto 465, false para otros
  auth: {
    user: process.env.EMAIL_USER, // ej: universitas.legaltech@gmail.com
    pass: process.env.EMAIL_PASS, // La contraseña de aplicación de 16 letras
  },
});

// 2. FUNCIÓN BASE PARA ENVIAR CORREOS
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Universitas - Actas de Entrega" <${process.env.EMAIL_USER}>`,
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

// 3. FUNCIÓN PARA EL CORREO DE CONFIRMACIÓN DE CUENTA
const sendConfirmationEmail = async (to, token, userName) => {
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

// 4. FUNCIÓN PARA EL CORREO DE RECUPERACIÓN DE CONTRASEÑA
const sendPasswordResetEmail = async (to, otp, userName) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #001A70; text-align: center;">Recuperación de Contraseña</h2>
      <p style="font-size: 16px;">Hola, <strong>${userName || 'usuario'}</strong>,</p>
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código para completar el proceso. El código es válido por 10 minutos.</p>
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 18px;">Tu código de verificación es:</p>
        <div style="background-color: #f2f2f2; color: #333; padding: 12px 25px; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 24px; letter-spacing: 5px; border: 1px dashed #ccc;">
          ${otp}
        </div>
      </div>
      <p>Una vez que ingreses este código en la aplicación, podrás establecer una nueva contraseña.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo.</p>
    </div>
  `;

  return sendEmail(to, 'Tu código para restablecer la contraseña', htmlContent);
};


// 5. EXPORTACIÓN DE TODAS LAS FUNCIONES (AL FINAL DEL ARCHIVO)
module.exports = {
  sendEmail,
  sendConfirmationEmail,
  sendPasswordResetEmail,
};