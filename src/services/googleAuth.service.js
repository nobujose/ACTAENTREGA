const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library'); // Importar GoogleAuth para Service Accounts

// Los SCOPES necesarios para las APIs que usamos
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/docs', // Aunque Puppeteer genera el PDF, este scope podría ser útil si se usara la API de Docs para algo más.
    'https://www.googleapis.com/auth/gmail.send' // Para enviar correos a través de Gmail API si se decide usar.
];

const KEYFILEPATH = 'service-account.json'; // Ruta al archivo de la cuenta de servicio

let authClient = null; // Cliente de autenticación global
let sheetsService = null;
let docsService = null;
let gmailService = null;

/**
 * Autentica con las APIs de Google usando una Cuenta de Servicio.
 * @returns {Promise<GoogleAuth>} El cliente de autenticación de Google.
 */
async function authenticateGoogle() {
    if (authClient) {
        return authClient;
    }

    try {
        const auth = new GoogleAuth({
            keyFile: KEYFILEPATH,
            scopes: SCOPES,
        });
        authClient = await auth.getClient();
        console.log('      -> ✅ Autenticación con Cuenta de Servicio exitosa.');
        return authClient;
    } catch (error) {
        console.error(`Error al autenticar con Cuenta de Servicio desde ${KEYFILEPATH}:`, error);
        throw new Error('No se pudo autenticar con la Cuenta de Servicio. Asegúrate de que service-account.json exista y sea válido.');
    }
}

/**
 * Inicializa y devuelve los clientes de las APIs de Google.
 * @returns {Promise<{sheets: import('googleapis').sheets_v4.Sheets, docs: import('googleapis').docs_v1.Docs, gmail: import('googleapis').gmail_v1.Gmail}>}
 */
async function getGoogleClients() {
    if (!authClient) {
        await authenticateGoogle();
    }

    if (!sheetsService) { // Solo inicializamos sheets, docs y gmail
        sheetsService = google.sheets({ version: 'v4', auth: authClient });
        docsService = google.docs({ version: 'v1', auth: authClient });
        gmailService = google.gmail({ version: 'v1', auth: authClient });
    }

    return {
        sheets: sheetsService,
        docs: docsService,
        gmail: gmailService
    };
}

module.exports = {
    authenticateGoogle,
    getGoogleClients,
};
