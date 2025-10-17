const fs = require('fs').promises;
const path = require('path');
const HTMLToDOCX = require('html-to-docx');

/**
 * Genera un documento .docx, buscando y reemplazando un placeholder
 * por un salto de página nativo de Word.
 */
const generateDocFromTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', templateName);
    let htmlContent = await fs.readFile(templatePath, 'utf-8');

    // Reemplaza los datos del usuario (ej: {{nombre}})
    for (const key in data) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const value = data[key] || '';
      htmlContent = htmlContent.replace(placeholder, value);
    }

    // --- LÓGICA DEL SALTO DE PÁGINA (VERSIÓN FINAL Y CORRECTA) ---
    // Define el código que Word entiende como un salto de página.
    const wordPageBreak = '<p style="page-break-before: always;"></p>';

    // Busca nuestro "código mágico" y lo reemplaza por el código de Word.
    htmlContent = htmlContent.replace('', wordPageBreak);
    // --- FIN DE LA CORRECCIÓN ---

    // Limpieza final para eliminar cualquier marcador {{...}} que haya quedado.
    htmlContent = htmlContent.replace(/{{[^}}]+}}/g, '');

    const docxBuffer = await HTMLToDOCX(htmlContent, null, {
      table: { row: { cantSplit: true } },
      footer: false,
      header: false,
    });

    console.log(`Documento .docx generado desde ${templateName} con salto de página forzado.`);
    return docxBuffer;

  } catch (error) {
    console.error(`Error al generar el .docx desde la plantilla ${templateName}:`, error);
    throw new Error('No se pudo generar el documento .docx.');
  }
};

module.exports = {
  generateDocFromTemplate,
};