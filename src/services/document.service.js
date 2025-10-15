// src/services/document.service.js

const fs = require('fs').promises;
const path = require('path');
const HTMLToDOCX = require('html-to-docx');

/**
 * Genera un documento .docx a partir de una plantilla HTML con estilos en línea.
 * Primero elimina las líneas de los anexos no seleccionados y luego reemplaza los datos.
 */
const generateDocFromTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', templateName);
    let htmlContent = await fs.readFile(templatePath, 'utf-8');

    // --- INICIO DE LA NUEVA LÓGICA ---

    // 1. Eliminación condicional de líneas de anexos
    // Este bucle se encarga de los anexos que no fueron seleccionados (su valor es vacío).
    for (const key in data) {
      if (key.startsWith('Anexo_') && !data[key]) {
        // Esta expresión regular busca la etiqueta <p> que contiene el marcador del anexo
        // y la elimina por completo, incluyendo saltos de línea.
        const regex = new RegExp(`<p[^>]*>\\s*{{${key}}}\\s*<\\/p>[\\r\\n]*`, 'g');
        htmlContent = htmlContent.replace(regex, '');
      }
    }

    // 2. Reemplazo estándar de todos los demás datos
    // Este bucle reemplaza todos los marcadores restantes con sus valores correspondientes.
    for (const key in data) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const value = data[key] || ''; // Si algún valor es nulo, se reemplaza por vacío.
      htmlContent = htmlContent.replace(placeholder, value);
    }
    
    // 3. Limpieza final (opcional pero recomendado)
    // Elimina cualquier marcador {{...}} que pudiera haber quedado sin reemplazar.
    htmlContent = htmlContent.replace(/{{[^}}]+}}/g, '');

    // --- FIN DE LA NUEVA LÓGICA ---

    const docxBuffer = await HTMLToDOCX(htmlContent, null, {
      table: { row: { cantSplit: true } },
      footer: false,
      header: false,
    });

    console.log(`Documento .docx real generado desde la plantilla ${templateName}.`);
    return docxBuffer;

  } catch (error) {
    console.error(`Error al generar el .docx desde la plantilla ${templateName}:`, error);
    throw new Error('No se pudo generar el documento .docx.');
  }
};

module.exports = {
  generateDocFromTemplate,
};