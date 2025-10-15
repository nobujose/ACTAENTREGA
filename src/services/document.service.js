const fs = require('fs').promises;
const path = require('path');
const HTMLToDOCX = require('html-to-docx');

/**
 * Genera un documento .docx a partir de una plantilla HTML con estilos en línea.
 */
const generateDocFromTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', templateName);
    let htmlContent = await fs.readFile(templatePath, 'utf-8');

    for (const key in data) {
      const placeholder = `{{${key}}}`;
      const value = data[key] || '';
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    }

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