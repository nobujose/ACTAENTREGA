const { google } = require('googleapis');

// --- Configuración ---
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const KEYFILEPATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let sheets; // Variable para mantener el cliente autenticado

/**
 * Autentica con la API de Google Sheets.
 * Se llamará automáticamente antes de cualquier operación.
 */
async function authenticate() {
  // Si ya estamos autenticados, no hacemos nada más.
  if (sheets) {
    return;
  }
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES,
    });
    const authClient = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: authClient });
    console.log('Autenticación con Google Sheets exitosa.');
  } catch (error) {
    console.error('Error al autenticar con Google Sheets:', error);
    throw new Error('No se pudo conectar con Google Sheets.');
  }
}

/**
 * Obtiene datos de un rango específico de una hoja.
 */
const getSheetData = async (range) => {
  await authenticate();
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    return response.data.values;
  } catch (error) {
    console.error(`Error al obtener datos del rango ${range}:`, error.message);
    return null;
  }
};

/**
 * Añade una nueva fila de datos al final de una hoja. (VERSIÓN CORREGIDA)
 */
const appendSheetData = async (sheetName, rowData) => {
  await authenticate();
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      // ¡CORRECCIÓN CLAVE! Se usa 'resource' en lugar de 'requestBody'
      resource: {
        values: [rowData],
      },
    });
    console.log(`Fila añadida correctamente a la hoja "${sheetName}".`);
    return response.status === 200;
  } catch (error) {
    console.error('Error al añadir la fila:', error);
    return false;
  }
};

/**
 * Busca una fila basándose en el valor de una columna. (CONSERVADA)
 */
const findRowByValueInColumn = async (sheetName, columnName, valueToFind) => {
    await authenticate();
    try {
        const allData = await getSheetData(`${sheetName}!A:Z`);
        if (!allData || allData.length < 1) return null;

        const headers = allData[0];
        const columnIndex = headers.indexOf(columnName);
        if (columnIndex === -1) throw new Error(`La columna "${columnName}" no fue encontrada.`);

        for (let i = 1; i < allData.length; i++) {
            if (allData[i][columnIndex] === valueToFind) {
                const userObject = {};
                headers.forEach((header, index) => {
                    userObject[header] = allData[i][index] || '';
                });
                return { user: userObject, rowIndex: i + 1 };
            }
        }
        return null;
    } catch (error) {
        console.error(`Error en la búsqueda en "${sheetName}":`, error);
        return null;
    }
};

/**
 * Actualiza una celda específica. (CONSERVADA Y CORREGIDA)
 */
const updateCell = async (sheetName, rowIndex, columnName, value) => {
    await authenticate();
    try {
        const headers = (await getSheetData(`${sheetName}!1:1`))[0];
        if (!headers) throw new Error("No se pudieron obtener los encabezados.");

        const columnIndex = headers.indexOf(columnName);
        if (columnIndex === -1) throw new Error(`Columna "${columnName}" no encontrada.`);

        const columnToLetter = (colIndex) => {
            let temp, letter = '';
            while (colIndex >= 0) {
                temp = colIndex % 26;
                letter = String.fromCharCode(temp + 65) + letter;
                colIndex = Math.floor(colIndex / 26) - 1;
            }
            return letter;
        };
        const columnLetter = columnToLetter(columnIndex);
        const range = `${sheetName}!${columnLetter}${rowIndex}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            // ¡CORRECCIÓN CLAVE!
            resource: {
                values: [[value]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error al actualizar la celda:', error);
        return false;
    }
};

/**
 * Elimina una fila específica. (CONSERVADA Y CORREGIDA)
 */
const deleteRow = async (sheetName, rowIndex) => {
    await authenticate();
    try {
        const { data } = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHE-ET_ID });
        const sheet = data.sheets.find(s => s.properties.title === sheetName);
        if (!sheet) throw new Error(`Hoja "${sheetName}" no encontrada.`);
        
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            // ¡CORRECCIÓN CLAVE!
            resource: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheet.properties.sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex - 1,
                            endIndex: rowIndex,
                        },
                    },
                }],
            },
        });
        return true;
    } catch (error) {
        console.error('Error al eliminar la fila:', error);
        return false;
    }
};


// Exportamos las funciones. Ya no se necesita 'init'.
module.exports = {
    getSheetData,
    appendSheetData,
    findRowByValueInColumn,
    updateCell,
    deleteRow,
};