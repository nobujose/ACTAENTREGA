// src/services/email.service.js
const { Resend } = require('resend');

// 1. CONFIGURACIÓN DE RESEND
// La API key se toma automáticamente de la variable de entorno RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL; // ej: 'noreply@universitasdev.com'

// 2. FUNCIÓN BASE PARA ENVIAR CORREOS CON RESEND (CON SOPORTE PARA ADJUNTOS)
const sendEmail = async (to, subject, html, attachments = []) => {
  if (!fromEmail) {
    console.error('Error: La variable de entorno FROM_EMAIL no está configurada.');
    return false;
  }

  try {
    await resend.emails.send({
      from: `Universitas <${fromEmail}>`,
      to,
      subject,
      html,
      attachments, // Se añade el array de adjuntos
    });
    console.log(`Correo con ${attachments.length} adjunto(s) enviado a ${to} a través de Resend`);
    return true;
  } catch (error) {
    console.error(`Error al enviar correo con Resend a ${to}:`, error);
    return false;
  }
};

// 3. FUNCIÓN PARA EL CORREO DE CONFIRMACIÓN DE CUENTA (SIN CAMBIOS)
// Esta función sigue igual, ya que solo prepara el contenido y llama a sendEmail.
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

// 4. FUNCIÓN PARA EL CORREO DE RECUPERACIÓN DE CONTRASEÑA (SIN CAMBIOS)
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
// ▼▼▼ NUEVA FUNCIÓN DE CORREO UNIFICADA ▼▼▼

/**
 * Envía el correo estandarizado para CUALQUIER acta generada (solo con adjunto).
 * @param {string} to - Email del destinatario.
 * @param {Array} attachments - El documento para adjuntar al correo.
 */
const sendActaGeneratedEmail = async (to, attachments) => {
  const subject = 'Has completado el primer paso. Aquí está tu Acta Express.';
  const proLink = 'https://api.whatsapp.com/send?phone=+584125253023&text=Hola,%20quiero%20adquirir%20Actas%20de%20Entregas%20PRO';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px;">
      <div style="padding: 20px;">
        <h2 style="color: #001A70;">¡Excelente trabajo!</h2>
        <p>Has generado con éxito tu borrador de Acta de Entrega. Lo encontrarás adjunto en este correo.</p>
        <h3 style="color: #001A70; border-top: 1px solid #eee; padding-top: 15px;">Próximos pasos (Instrucciones Clave):</h3>
        <p>📌 Descarga y revisa el documento adjunto.<br>📌 Imprime las copias necesarias (original y tres copias).<br>📌 Procede con la firma y distribuirlas según la normativa.</p>
      </div>
      <div style="background-color: #f7f7f7; padding: 20px; border-top: 1px solid #ddd;">
        <h3 style="color: #001A70; text-align: center;">¿Sabías que este es solo el comienzo?</h3>
        <p style="font-size: 14px;">Un proceso de entrega formal implica mucho más: anexos detallados, análisis de riesgos y la verificación de cada punto para evitar futuras responsabilidades.</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${proLink}" style="background-color: #ff8c00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">¡Quiero actualizar a la versión PRO!</a>
        </div>
      </div>
      <div style="padding: 20px; text-align: center; font-size: 12px; color: #777;">
        <p>Si tienes alguna pregunta, nuestro equipo está listo para ayudarte.<br>Atentamente,<br><strong>El equipo de Universitas Legal</strong></p>
      </div>
    </div>
  `;
  // Enviamos el correo solo con el adjunto
  return sendEmail(to, subject, htmlContent, attachments);
};
// 5. EXPORTACIÓN DE TODAS LAS FUNCIONES
module.exports = {
  sendEmail,
  sendConfirmationEmail,
  sendPasswordResetEmail,
  sendActaGeneratedEmail,
};
