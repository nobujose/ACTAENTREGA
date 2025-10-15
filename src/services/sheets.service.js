const { getGoogleClients } = require('./googleAuth.service');

// --- Configuración ---
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

let sheetsClient; // Variable para mantener el cliente de Sheets autenticado

/**
 * Obtiene el cliente de Google Sheets autenticado.
 * @returns {Promise<import('googleapis').sheets_v4.Sheets>} Cliente de Google Sheets.
 */
async function getSheetsClient() {
  if (!sheetsClient) {
    const clients = await getGoogleClients();
    sheetsClient = clients.sheets;
  }
  return sheetsClient;
}

/**
 * Obtiene datos de un rango específico de una hoja.
 */
const getSheetData = async (range) => {
  const sheets = await getSheetsClient();
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
 * Añade una nueva fila de datos al final de una hoja.
 */
const appendSheetData = async (sheetName, rowData) => {
  const sheets = await getSheetsClient();
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
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
 * Busca una fila basándose en el valor de una columna.
 */
const findRowByValueInColumn = async (sheetName, columnName, valueToFind) => {
    const sheets = await getSheetsClient();
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
 * Actualiza una celda específica.
 */
const updateCell = async (sheetName, rowIndex, columnName, value) => {
    const sheets = await getSheetsClient();
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
 * Elimina una fila específica.
 */
const deleteRow = async (sheetName, rowIndex) => {
    const sheets = await getSheetsClient();
    try {
        const { data } = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const sheet = data.sheets.find(s => s.properties.title === sheetName);
        if (!sheet) throw new Error(`Hoja "${sheetName}" no encontrada.`);
        
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
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
/**
 * Añade una fila de evento a una hoja de seguimiento.
 * @param {string} sheetName - El nombre de la hoja de seguimiento.
 * @param {Array<any>} eventData - Un array con los datos del evento.
 */
const logEvent = async (sheetName, eventData) => {
  const sheets = await getSheetsClient();
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [eventData],
      },
    });
    console.log(`Evento registrado correctamente en la hoja "${sheetName}".`);
    return true;
  } catch (error) {
    console.error(`Error al registrar el evento en la hoja "${sheetName}":`, error);
    return false;
  }
};


// Exportamos las funciones.
module.exports = {
    getSheetData,
    appendSheetData,
    findRowByValueInColumn,
    updateCell,
    deleteRow,
    logEvent,
};
