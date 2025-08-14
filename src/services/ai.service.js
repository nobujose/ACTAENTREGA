const { SessionsClient } = require('@google-cloud/dialogflow-cx');
const { v4: uuidv4 } = require('uuid');

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const location = process.env.DIALOGFLOW_LOCATION;
const agentId = process.env.DIALOGFLOW_AGENT_ID;

const client = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

/**
 * Envía un texto a Dialogflow CX y devuelve la respuesta del agente.
 * @param {string} text - El mensaje del usuario.
 * @param {string} sessionId - Un identificador único para la conversación.
 * @returns {Promise<string>} - La respuesta de texto del agente.
 */
async function detectIntentText(text, sessionId) {
  const sessionPath = client.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: text,
      },
      languageCode: 'es',
    },
  };

  try {
    const [response] = await client.detectIntent(request);
    let botResponse = '';

    for (const message of response.queryResult.responseMessages) {
      if (message.text) {
        botResponse += message.text.text.join(' ');
      }
    }
    
    return botResponse || "No he podido entender eso. ¿Puedes decirlo de otra forma?";
  } catch (error) {
    console.error('Error al contactar con Dialogflow CX:', error);
    return 'Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo más tarde.';
  }
}

module.exports = { detectIntentText, uuidv4 };
