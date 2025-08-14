const { detectIntentText, uuidv4 } = require('../services/ai.service');

const handleMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'El campo "message" es requerido.' });
    }

    // Si no se provee un sessionId, se crea uno nuevo para la conversación.
    const session = sessionId || uuidv4();

    const botResponse = await detectIntentText(message, session);

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
