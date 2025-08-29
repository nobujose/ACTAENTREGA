const { google } = require('googleapis');

let sheets;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

/**
 * Inicializa el cliente de Google Sheets.
 * Esta función debe ser llamada antes de usar cualquier otra función de este módulo.
 */
const init = async () => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const authClient = await auth.getClient();
        sheets = google.sheets({ version: 'v4', auth: authClient });
        console.log("Google Sheets API inicializada correctamente.");
    } catch (error) {
        console.error("Error fatal al inicializar Google Sheets API. El servidor no puede iniciar.", error);
        process.exit(1);
    }
};

/**
 * Obtiene datos de un rango específico de una hoja.
 */
const getSheetData = async (range) => {
    if (!sheets) throw new Error("Google Sheets API no inicializada. Llama a init() primero.");
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range,
        });
        return response.data.values;
    } catch (error) {
        console.error(`Error fetching sheet data for range ${range}:`, error.message);
        return null;
    }
};

/**
 * Añade una nueva fila de datos al final de una hoja.
 */
const appendSheetData = async (sheetName, rowData) => {
    if (!sheets) throw new Error("Google Sheets API no inicializada. Llama a init() primero.");
    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: sheetName,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [rowData],
            },
        });
        return response.status === 200;
    } catch (error) {
        console.error('Error appending sheet data:', error);
        return false;
    }
};

/**
 * Busca una fila basándose en el valor de una columna de forma eficiente.
 * @returns {Promise<{user: object, rowIndex: number}|null>}
 */
const findRowByValueInColumn = async (sheetName, columnName, valueToFind) => {
    if (!sheets) throw new Error("Google Sheets API no inicializada. Llama a init() primero.");
    try {
        const allData = await getSheetData(`${sheetName}!A:Z`); // Lee un rango amplio
        if (!allData || allData.length < 1) {
            return null;
        }

        const headers = allData[0];
        const columnIndex = headers.indexOf(columnName);
        if (columnIndex === -1) {
            throw new Error(`La columna "${columnName}" no fue encontrada.`);
        }

        let foundRowData = null;
        let sheetRowIndex = -1;
        for (let i = 1; i < allData.length; i++) {
            if (allData[i][columnIndex] === valueToFind) {
                foundRowData = allData[i];
                sheetRowIndex = i + 1;
                break;
            }
        }

        if (!foundRowData) {
            return null;
        }

        const userObject = {};
        headers.forEach((header, index) => {
            userObject[header] = foundRowData[index] || '';
        });

        return { user: userObject, rowIndex: sheetRowIndex };
    } catch (error) {
        console.error(`Error en la búsqueda eficiente en "${sheetName}":`, error);
        return null;
    }
};

/**
 * Actualiza una celda específica usando el número de fila y el nombre de la columna.
 */
const updateCell = async (sheetName, rowIndex, columnName, value) => {
    if (!sheets) throw new Error("Google Sheets API no inicializada. Llama a init() primero.");
    try {
        const headersResponse = await getSheetData(`${sheetName}!1:1`);
        if (!headersResponse) throw new Error("No se pudieron obtener los encabezados.");

        const headers = headersResponse[0];
        const columnIndex = headers.indexOf(columnName);
        if (columnIndex === -1) {
            throw new Error(`Columna "${columnName}" no encontrada.`);
        }

        const columnLetter = String.fromCharCode(65 + columnIndex);
        const range = `${sheetName}!${columnLetter}${rowIndex}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[value]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error updating cell:', error);
        return false;
    }
};

/**
 * Elimina una fila específica de una hoja de cálculo.
 */
const deleteRow = async (sheetName, rowIndex) => {
    if (!sheets) throw new Error("Google Sheets API no inicializada. Llama a init() primero.");
    try {
        const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const sheet = sheetMetadata.data.sheets.find(s => s.properties.title === sheetName);
        if (!sheet) throw new Error(`Hoja "${sheetName}" no encontrada.`);
        const sheetId = sheet.properties.sheetId;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
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

module.exports = {
    init,
    getSheetData,
    appendSheetData,
    findRowByValueInColumn,
    updateCell,
    deleteRow,
};
