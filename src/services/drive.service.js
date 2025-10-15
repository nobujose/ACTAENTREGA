const { google } = require('googleapis');
const stream = require('stream');

// --- Configuración ---
const KEYFILEPATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; // Necesitarás añadir esto a tu .env

let drive; // Variable para mantener el cliente autenticado

/**
 * Autentica con la API de Google Drive.
 */
async function authenticate() {
  if (drive) {
    return;
  }
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES,
    });
    const authClient = await auth.getClient();
    drive = google.drive({ version: 'v3', auth: authClient });
    console.log('Autenticación con Google Drive exitosa.');
  } catch (error) {
    console.error('Error al autenticar con Google Drive:', error);
    throw new Error('No se pudo conectar con Google Drive.');
  }
}

/**
 * Sube un archivo (buffer) a una carpeta específica en Google Drive.
 *
 * @param {Buffer} fileBuffer - El buffer del archivo a subir.
 * @param {string} fileName - El nombre que tendrá el archivo en Google Drive.
 * @param {string} mimeType - El tipo MIME del archivo (ej: 'application/pdf').
 * @returns {Promise<string|null>} - Una promesa que se resuelve con el ID del archivo subido o null si falla.
 */
const uploadFile = async (fileBuffer, fileName, mimeType) => {
  await authenticate();

  if (!FOLDER_ID) {
    console.error('Error: La variable de entorno GOOGLE_DRIVE_FOLDER_ID no está configurada.');
    throw new Error('El ID de la carpeta de destino en Google Drive no está configurado.');
  }

  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [FOLDER_ID],
        mimeType: mimeType,
      },
      media: {
        mimeType: mimeType,
        body: bufferStream,
      },
      fields: 'id',
    });

    const fileId = response.data.id;
    console.log(`Archivo "${fileName}" subido con éxito. ID: ${fileId}`);
    return fileId;
  } catch (error) {
    console.error(`Error al subir el archivo "${fileName}" a Google Drive:`, error);
    return null;
  }
};

/**
 * Hace que un archivo en Google Drive sea públicamente accesible a través de un enlace.
 *
 * @param {string} fileId - El ID del archivo a hacer público.
 * @returns {Promise<string|null>} - Una promesa que se resuelve con el enlace web del archivo o null si falla.
 */
const makeFilePublic = async (fileId) => {
  await authenticate();
  try {
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const result = await drive.files.get({
      fileId: fileId,
      fields: 'webViewLink',
    });

    const publicUrl = result.data.webViewLink;
    console.log(`El archivo con ID ${fileId} ahora es público. Enlace: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`Error al hacer público el archivo con ID ${fileId}:`, error);
    return null;
  }
};

module.exports = {
  uploadFile,
  makeFilePublic,
};
