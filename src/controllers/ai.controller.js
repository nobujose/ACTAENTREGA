// src/controllers/ai.controller.js
const { detectIntentText, uuidv4 } = require('../services/ai.service');
const sheets = require('../services/sheets.service'); // 1. Importamos el servicio de Google Sheets

const CHAT_HISTORY_SHEET = 'HistorialChats'; // 2. Definimos el nombre de nuestra nueva hoja

const handleMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userEmail = req.user.email; // Obtenemos el email del usuario desde el token (gracias a authenticateToken)

    if (!message) {
      return res.status(400).json({ error: 'El campo "message" es requerido.' });
    }

    const session = sessionId || uuidv4();

    const botResponse = await detectIntentText(message, session);

    // ▼▼▼ 3. AQUÍ ESTÁ LA NUEVA LÓGICA ▼▼▼
    // Después de obtener la respuesta del bot, la guardamos en Google Sheets.
    try {
      const timestamp = new Date().toISOString();
      const newRow = [
        timestamp,
        userEmail,
        session,
        message,     // La pregunta del usuario
        botResponse, // La respuesta del bot
      ];
      
      // Usamos 'await' para asegurarnos de que se complete, pero no bloqueamos la respuesta al usuario.
      await sheets.appendSheetData(CHAT_HISTORY_SHEET, newRow);
      console.log(`[CRM] Conversación guardada para el usuario ${userEmail}`);

    } catch (error) {
      // Si falla el guardado en la hoja, solo lo mostramos en la consola del servidor.
      // No queremos que un error aquí impida que el usuario reciba la respuesta del bot.
      console.error('[CRM] Error al guardar el historial del chat:', error);
    }
    // ▲▲▲ FIN DE LA NUEVA LÓGICA ▲▲▲

    res.json({
      sessionId: session,
      response: botResponse,
    });
  } catch (error) {
    console.error('Error en el controlador de IA:', error);
    res.status(500).json({ error: 'Error al procesar el mensaje.' });
  }
};

module.exports = {
  handleMessage,
};