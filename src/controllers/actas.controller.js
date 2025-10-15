const sheets = require('../services/sheets.service');
const documentService = require('../services/document.service');
const emailService = require('../services/email.service');

// Nombres de las hojas de cálculo de destino
const ACTA_ENTRANTE_GRATIS_SHEET = 'ActaEntranteGratis';
const ACTA_SALIENTE_GRATIS_SHEET = 'ActaSalienteGratis';
const ACTA_MAXIMA_AUTORIDAD_GRATIS_SHEET = 'ActamaximaautoridadGratis';
const ACTA_MAXIMA_AUTORIDAD_PAGA_SHEET = 'ActaMáximaAutoridadPaga';
const ACTA_ENTRANTE_PAGA_SHEET = 'ActaEntrantePaga';
const ACTA_SALIENTE_PAGA_SHEET = 'ActaSalientePaga';

// Objeto que mapea las preguntas del formulario al texto completo de los Anexos
const anexosMap = {
    disponeEstadoSituacionPresupuestaria: { key: 'Anexo_1', text: '-El Estado de Situación Presupuestaria muestra todos los momentos presupuestarios y sus detalles. Incluye: Presupuesto Original, Modificaciones, Presupuesto Modificado, Compromisos, Causado, Pagado, Por Pagar y Presupuesto Disponible a la fecha de entrega.' },
    disponeRelacionGastosComprometidosNoCausados: { key: 'Anexo_2', text: '-Relación de Gastos Comprometidos, no causados a la fecha de entrega.' },
    disponeRelacionGastosComprometidosCausadosNoPagados: { key: 'Anexo_3', text: '-Relación de Gastos Comprometidos, causados y no pagados a la fecha de entrega.' },
    disponeEstadoPresupuestarioPorPartidas: { key: 'Anexo_4', text: '-El Estado Presupuestario del Ejercicio vigente por partidas.' },
    disponeEstadoPresupuestarioDetalleCuentas: { key: 'Anexo_5', text: '-El Estado Presupuestario del Ejercicio con los detalles de sus cuentas.' },
    disponeEstadosFinancieros: { key: 'Anexo_6', text: '-Estados Financieros a la fecha de entrega.' },
    disponeBalanceComprobacion: { key: 'Anexo_7', text: '-El Balance de Comprobación a la fecha de elaboración de los Estados Financieros y sus notas explicativas a la fecha de entrega.' },
    disponeEstadoSituacionFinanciera: { key: 'Anexo_8', text: '-Estado de Situación Financiera / Balance General y sus notas explicativas a la fecha de entrega.' },
    disponeEstadoRendimientoFinanciero: { key: 'Anexo_9', text: '-Estado de Rendimiento Financiero / Estado de Ganancia y Pérdidas y sus notas explicativas a la fecha de entrega.' },
    disponeEstadoMovimientosPatrimonio: { key: 'Anexo_10', text: '-Estado de Movimientos de las Cuentas de Patrimonio y sus notas explicativas a la fecha de entrega.' },
    disponeRelacionCuentasPorCobrar: { key: 'Anexo_11', text: '-Relación de Cuentas por Cobrar a la fecha del Acta de Entrega.' },
    disponeRelacionCuentasPorPagar: { key: 'Anexo_12', text: '-Relación de Cuentas por Pagar a la fecha del Acta de Entrega.' },
    disponeRelacionCuentasFondosTerceros: { key: 'Anexo_13', text: '-Relación de las Cuentas de los Fondos de Terceros.' },
    disponeSituacionFondosAnticipo: { key: 'Anexo_14', text: '-La Situación de los Fondos en Anticipo.' },
    disponeSituacionCajaChica: { key: 'Anexo_15', text: '-La Situación de la Caja Chica.' },
    disponeActaArqueoCajasChicas: { key: 'Anexo_16', text: '-Acta de arqueo de las Cajas Chicas a la fecha de entrega.' },
    disponeListadoRegistroAuxiliarProveedores: { key: 'Anexo_17', text: '-Listado del Registro Auxiliar de Proveedores.' },
    disponeReportesLibrosContables: { key: 'Anexo_18', text: '-Reportes de Libros Contables (Diario y mayores analíticos) a la fecha del cese de funciones.' },
    disponeReportesCuentasBancarias: { key: 'Anexo_19', text: '-Reportes de las Cuentas Bancarias (Movimientos a la fecha del cese de funciones).' },
    disponeReportesConciliacionesBancarias: { key: 'Anexo_20', text: '-Reportes de las Conciliaciones Bancarias a la fecha del cese de funciones.' },
    disponeReportesRetenciones: { key: 'Anexo_21', text: '-Reportes de Retenciones de pagos pendientes por enterar correspondientes a ISLR, IVA y Retenciones por Contratos (obras, bienes y servicios) a la fecha del cese de funciones.' },
    disponeReporteProcesosContrataciones: { key: 'Anexo_22', text: '-Reporte de los Procesos de Contrataciones Públicas a la fecha del cese de funciones.' },
    disponeReporteFideicomisoPrestaciones: { key: 'Anexo_23', text: '-Reporte del Fideicomiso de Prestaciones Sociales a la fecha del cese de funciones.' },
    disponeReporteBonosVacacionales: { key: 'Anexo_24', text: '-Reporte de Bonos Vacacionales a la fecha del cese de funciones.' },
    disponeCuadroResumenCargos: { key: 'Anexo_25', text: '-Cuadro resumen indicando el número de cargos existentes, clasificados en empleados, obreros, fijos o contratados.' },
    disponeCuadroResumenValidadoRRHH: { key: 'Anexo_26', text: '-Cuadro resumen validado por la Oficina de Recursos Humanos.' },
    disponeReporteNominas: { key: 'Anexo_27', text: '-Reporte de Nóminas a la fecha del cese de funciones.' },
    disponeInventarioBienes: { key: 'Anexo_28', text: '-Inventario de Bienes e Inmuebles elaborado a la fecha de entrega debe contener: comprobación física, condición de los bienes, responsable patrimonial, responsable por uso, fecha de verificación, número del acta de verificación, código, descripción, marca, modelo, número del serial, estado de conservación, ubicación y valor de mercado de los bienes.' },
    disponeEjecucionPlanOperativo: { key: 'Anexo_29', text: '-Ejecución del Plan Operativo a la fecha de entrega.' },
    incluyeCausasIncumplimientoMetas: { key: 'Anexo_30', text: '-Detalles de las causas que originaron el incumplimiento de algunas metas.' },
    disponePlanOperativoAnual: { key: 'Anexo_31', text: '-Plan Operativo Anual.' },
    disponeClasificacionArchivo: { key: 'Anexo_32', text: '-Clasificación del archivo.' },
    incluyeUbicacionFisicaArchivo: { key: 'Anexo_33', text: '-Indica ubicación física.' },
    disponeRelacionMontosFondosAsignados: { key: 'Anexo_34', text: '-Relación de los montos de los fondos asignados.' },
    disponeSaldoEfectivoFondos: { key: 'Anexo_35', text: '-Saldo en efectivo de dichos fondos.' },
    disponeRelacionBienesAsignados: { key: 'Anexo_36', text: '-Relación de los bienes asignados.' },
    disponeRelacionBienesAsignadosUnidadBienes: { key: 'Anexo_37', text: '-Relación de los Bienes asignados emitida por la Unidad de Bienes.' },
    disponeEstadosBancariosConciliados: { key: 'Anexo_38', text: '-Estados bancarios actualizados y conciliados a la fecha de entrega.' },
    disponeListaComprobantesGastos: { key: 'Anexo_39', text: '-Lista de comprobantes de gastos.' },
    disponeChequesEmitidosPendientesCobro: { key: 'Anexo_40', text: '-Cheques emitidos pendientes de cobro.' },
    disponeListadoTransferenciaBancaria: { key: 'Anexo_41', text: '-Listado o reporte de Transferencia Bancaria.' },
    disponeCaucionFuncionario: { key: 'Anexo_42', text: '-Caución del funcionario encargado de la Administración de los Recursos Financieros a la fecha del cese de funciones.' },
    disponeCuadroDemostrativoRecaudado: { key: 'Anexo_43', text: '-Cuadro demostrativo del detalle de lo liquidado y recaudado por los rubros respectivos, y de los derechos pendientes de recaudación de años anteriores.' },
    disponeRelacionExpedientesAbiertos: { key: 'Anexo_44', text: '-Relación de los expedientes abiertos con ocasión del ejercicio de la potestad de investigación, así como de los procedimientos administrativos para la determinación de responsabilidades.' },
    disponeSituacionTesoroNacional: { key: 'Anexo_45', text: '-Situación del Tesoro Nacional.' },
    disponeInfoEjecucionPresupuestoNacional: { key: 'Anexo_46', text: '-Información de la ejecución del presupuesto nacional de ingresos y egresos del ejercicio presupuestario en curso y de los derechos pendientes de recaudación de años anteriores.' },
    disponeMontoDeudaPublicaNacional: { key: 'Anexo_47', text: '-Monto de la deuda pública nacional interna y externa.' },
    disponeSituacionCuentasNacion: { key: 'Anexo_48', text: '-Situación de las cuentas de la Nación.' },
    disponeSituacionTesoroEstadal: { key: 'Anexo_49', text: '-Situación del Tesoro Estadal.' },
    disponeInfoEjecucionPresupuestoEstadal: { key: 'Anexo_50', text: '-Información de la ejecución del presupuesto estadal de ingresos y egresos del ejercicio presupuestario en curso y de los derechos pendientes de recaudación de años anteriores.' },
    disponeSituacionCuentasEstado: { key: 'Anexo_51', text: '-Situación de las cuentas del respectivo estado.' },
    disponeSituacionTesoroDistritalMunicipal: { key: 'Anexo_52', text: '-Situación del Tesoro Distrital o Municipal.' },
    disponeInfoEjecucionPresupuestoDistritalMunicipal: { key: 'Anexo_53', text: '-Información de la ejecución del presupuesto distrital o municipal de ingresos y egresos del ejercicio presupuestario en curso y de los derechos pendientes de recaudación de años anteriores.' },
    disponeSituacionCuentasDistritalesMunicipales: { key: 'Anexo_54', text: '-Situación de las cuentas distritales o municipales.' },
    disponeInventarioTerrenosEjidos: { key: 'Anexo_55', text: '-Inventario detallado de los terrenos ejidos y de los terrenos propios distritales o municipales.' },
    disponeRelacionIngresosVentaTerrenos: { key: 'Anexo_56', text: '-Relación de Ingresos producto de las ventas de terrenos ejidos o terrenos propios distritales o municipales.' }
};

/**
 * Crea un Acta de Entrega Entrante (Gratuita).
 */
const createActaEntranteGratis = async (req, res) => {
  try {
    const id = Math.random().toString(36).substring(2, 10).toUpperCase();
    const allData = await sheets.getSheetData(ACTA_ENTRANTE_GRATIS_SHEET);
    let nextNumber = 1;
    if (allData && allData.length > 1) {
      const lastRow = allData[allData.length - 1];
      const lastActaNumber = lastRow[0];
      const lastNumberMatch = lastActaNumber.match(/-(\d+)$/);
      if (lastNumberMatch) {
        nextNumber = parseInt(lastNumberMatch[1], 10) + 1;
      }
    }
    const formattedNumber = String(nextNumber).padStart(3, '0');
    const numeroActa = `A.E.E.G-${formattedNumber}`;
    const {
      email, rifEntidad, cargoEntregado, nombreEntidad,
      ciudad, estado, hora, fecha, direccionEntidad, nombreServidorEntrante,
      cedulaServidorEntrante, profesionServidorEntrante, designacionServidorEntrante,
      nombreAuditor, cedulaAuditor, profesionAuditor, nombreTestigo1,
      cedulaTestigo1, profesionTestigo1, nombreTestigo2, cedulaTestigo2,
      profesionTestigo2, motivoEntrega, nombreServidorSaliente,
      cedulaServidorSaliente, designacionServidorSaliente, interesProductoPago
    } = req.body;
    if (!email || !nombreEntidad) {
      return res.status(400).json({ message: 'Faltan campos obligatorios como email o nombreEntidad.' });
    }
    const newRow = [
      numeroActa, id, email, rifEntidad, cargoEntregado, nombreEntidad,
      ciudad, estado, hora, fecha, direccionEntidad, nombreServidorEntrante,
      cedulaServidorEntrante, profesionServidorEntrante, designacionServidorEntrante,
      nombreAuditor, cedulaAuditor, profesionAuditor, nombreTestigo1,
      cedulaTestigo1, profesionTestigo1, nombreTestigo2, cedulaTestigo2,
      profesionTestigo2, motivoEntrega, nombreServidorSaliente,
      cedulaServidorSaliente, designacionServidorSaliente, interesProductoPago
    ];
    const success = await sheets.appendSheetData(ACTA_ENTRANTE_GRATIS_SHEET, newRow);
    if (!success) {
      return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
    }
    res.status(201).json({ 
        message: 'Acta de Entrega Entrante (Gratis) creada exitosamente.',
        numeroActa: numeroActa,
        id: id
    });
  } catch (error) {
    console.error('Error en createActaEntranteGratis:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * Crea un Acta de Entrega Saliente (Gratuita).
 */
const createActaSalienteGratis = async (req, res) => {
  try {
    const id = Math.random().toString(36).substring(2, 10).toUpperCase();
    const allData = await sheets.getSheetData(ACTA_SALIENTE_GRATIS_SHEET);
    let nextNumber = 1;
    if (allData && allData.length > 1) {
      const lastRow = allData[allData.length - 1];
      const lastActaNumber = lastRow[0];
      const lastNumberMatch = lastActaNumber.match(/-(\d+)$/);
      if (lastNumberMatch) {
        nextNumber = parseInt(lastNumberMatch[1], 10) + 1;
      }
    }
    const formattedNumber = String(nextNumber).padStart(3, '0');
    const numeroActa = `A.E.S.G-${formattedNumber}`;
    const {
      email, rifEntidad, cargoEntregado, nombreEntidad,
      ciudad, estado, hora, fecha, direccionEntidad, nombreServidorEntregador,
      cedulaServidorEntregador, designacionServidorEntregador, motivoEntrega,
      nombreServidorRecibe, cedulaServidorRecibe, designacionServidorRecibe,
      interesProductoPago, consejoIA
    } = req.body;
    if (!email || !nombreEntidad) {
      return res.status(400).json({ message: 'Faltan campos obligatorios como email o nombreEntidad.' });
    }
    const newRow = [
      numeroActa, id, email, rifEntidad, cargoEntregado, nombreEntidad,
      ciudad, estado, hora, fecha, direccionEntidad, nombreServidorEntregador,
      cedulaServidorEntregador, designacionServidorEntregador, motivoEntrega,
      nombreServidorRecibe, cedulaServidorRecibe, designacionServidorRecibe,
      interesProductoPago, consejoIA
    ];
    const success = await sheets.appendSheetData(ACTA_SALIENTE_GRATIS_SHEET, newRow);
    if (!success) {
      return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
    }
    res.status(201).json({ 
        message: 'Acta de Entrega Saliente (Gratis) creada exitosamente.',
        numeroActa: numeroActa,
        id: id
    });
  } catch (error) {
    console.error('Error en createActaSalienteGratis:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * Crea un Acta de Máxima Autoridad (Gratuita).
 */
const createActaMaximaAutoridadGratis = async (req, res) => {
  try {
    const id = Math.random().toString(36).substring(2, 10).toUpperCase();
    const allData = await sheets.getSheetData(ACTA_MAXIMA_AUTORIDAD_GRATIS_SHEET);
    let nextNumber = 1;
    if (allData && allData.length > 1) {
      const lastRow = allData[allData.length - 1];
      const lastActaNumber = lastRow[0];
      const lastNumberMatch = lastActaNumber.match(/-(\d+)$/);
      if (lastNumberMatch) {
        nextNumber = parseInt(lastNumberMatch[1], 10) + 1;
      }
    }
    const formattedNumber = String(nextNumber).padStart(3, '0');
    const numeroActa = `A.M.A.G-${formattedNumber}`;
    const {
      email, rifEntidad, denominacionCargo, nombreEntidad, ciudad, estado, hora, fecha,
      direccionEntidad, nombreServidorEntrante, cedulaServidorEntrante, profesionServidorEntrante,
      designacionServidorEntrante, nombreAuditor, cedulaAuditor, profesionAuditor,
      nombreTestigo1, cedulaTestigo1, profesionTestigo1, nombreTestigo2, cedulaTestigo2,
      profesionTestigo2, motivoEntrega, nombreServidorSaliente, cedulaServidorSaliente,
      designacionServidorSaliente, interesProducto, precondicion, condicionSi, cumpleNo
    } = req.body;
    if (!email || !nombreEntidad) {
      return res.status(400).json({ message: 'Faltan campos obligatorios como email o nombreEntidad.' });
    }
    const newRow = [
      numeroActa, id, email, rifEntidad, denominacionCargo, nombreEntidad, ciudad, estado, hora, fecha,
      direccionEntidad, nombreServidorEntrante, cedulaServidorEntrante, profesionServidorEntrante,
      designacionServidorEntrante, nombreAuditor, cedulaAuditor, profesionAuditor,
      nombreTestigo1, cedulaTestigo1, profesionTestigo1, nombreTestigo2, cedulaTestigo2,
      profesionTestigo2, motivoEntrega, nombreServidorSaliente, cedulaServidorSaliente,
      designacionServidorSaliente, interesProducto, precondicion, condicionSi, cumpleNo
    ];
    const success = await sheets.appendSheetData(ACTA_MAXIMA_AUTORIDAD_GRATIS_SHEET, newRow);
    if (!success) {
      return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
    }
    res.status(201).json({ 
        message: 'Acta Máxima Autoridad (Gratis) creada exitosamente.',
        numeroActa: numeroActa,
        id: id
    });
  } catch (error) {
    console.error('Error en createActaMaximaAutoridadGratis:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * Crea un Acta de Máxima Autoridad (de Pago) y la envía por correo.
 */
const createActaMaximaAutoridadPaga = async (req, res) => {
    try {
        const id = Math.random().toString(36).substring(2, 10).toUpperCase();
        const allData = await sheets.getSheetData(ACTA_MAXIMA_AUTORIDAD_PAGA_SHEET);
        let nextNumber = 1;
        if (allData && allData.length > 1) {
            const lastRow = allData[allData.length - 1];
            const lastActaNumber = lastRow[0];
            const lastNumberMatch = lastActaNumber.match(/-(\d+)$/);
            if (lastNumberMatch) {
                nextNumber = parseInt(lastNumberMatch[1], 10) + 1;
            }
        }
        const formattedNumber = String(nextNumber).padStart(3, '0');
        const numeroActa = `A.M.A.P-${formattedNumber}`;

        const headers = [
            // --- CAMPOS BÁSICOS ---
            "numeroActa", "id", "email", "rifOrgano", "denominacionCargo", "nombreOrgano",
            "ciudadSuscripcion", "estadoSuscripcion", "horaSuscripcion", "fechaSuscripcion", "direccionOrgano",
            "nombreServidorEntrante", "cedulaServidorEntrante", "profesionServidorEntrante", "designacionServidorEntrante",
            "nombreAuditor", "cedulaAuditor", "profesionAuditor", "nombreTestigo1", "cedulaTestigo1", "profesionTestigo1",
            "nombreTestigo2", "cedulaTestigo2", "profesionTestigo2", "motivoEntrega", "nombreServidorSaliente",
            "cedulaServidorSaliente", "designacionServidorSaliente",

            // --- CAMPOS DE ANEXOS (SE GENERAN AUTOMÁTICAMENTE) ---
            // Esto añade todas las preguntas (ej: "disponeEstadoSituacionPresupuestaria")
            ...Object.keys(anexosMap),
            // Esto añade todos los nombres de Anexo (ej: "Anexo_1")
            ...Object.values(anexosMap).map(a => a.key),

            // --- CAMPOS ADICIONALES ---
            "Anexo_VI", "Anexo_VII", "OBSERVACIONES ADICIONALES", "interesProductoPago"
        
        // Esta línea final limpia la lista para que no haya duplicados
        ].filter((v, i, a) => a.indexOf(v) === i);

        const newRowData = {};
        
        // Poblar datos básicos desde el cuerpo de la solicitud
        Object.keys(req.body).forEach(key => {
            newRowData[key] = req.body[key] || '';
        });

        // Lógica para poblar los anexos dinámicamente
        for (const pregunta in anexosMap) {
            const anexoInfo = anexosMap[pregunta];
            if (req.body[pregunta] === 'SI') {
                newRowData[anexoInfo.key] = anexoInfo.text;
            } else {
                newRowData[anexoInfo.key] = ''; // Dejar vacío si la respuesta no es 'SI'
            }
        }
        
        newRowData['numeroActa'] = numeroActa;
        newRowData['id'] = id;

        // Lógica para Anexo VI y VII
        if (newRowData['Anexo_VI'] && newRowData['Anexo_VI'].trim()) {
            newRowData['Anexo_VI'] = `${newRowData['Anexo_VI']}\nVER ANEXO 6`;
        } else {
            newRowData['Anexo_VI'] = '';
        }

        if (newRowData['Anexo_VII'] && newRowData['Anexo_VII'].trim().toLowerCase() !== 'no aplica' && newRowData['Anexo_VII'].trim()) {
            newRowData['Anexo_VII'] = `Anexo Séptimo: Otros anexos del acta: ${newRowData['Anexo_VII']}`;
        } else {
            newRowData['Anexo_VII'] = '';
        }
        
        const newRowArray = headers.map(header => newRowData[header] || '');
        const success = await sheets.appendSheetData(ACTA_MAXIMA_AUTORIDAD_PAGA_SHEET, newRowArray);

        if (!success) {
            return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
        }

        res.status(201).json({ 
            message: 'Acta creada. El documento se está procesando y se enviará en breve.',
            numeroActa: numeroActa,
            id: id
        });

        (async () => {
            try {
                const docBuffer = await documentService.generateDocFromTemplate('actaMaximaAutoridadPaga.html', newRowData);
                const docFileName = `Acta_Maxima_Autoridad_${numeroActa}.docx`;
                if (!docBuffer || docBuffer.length === 0) throw new Error('El buffer del documento está vacío.');
                
                const attachments = [{ filename: docFileName, content: docBuffer.toString('base64') }];
                const emailHtml = `<h1>Felicidades</h1><p>Tu Acta de Máxima Autoridad ha sido generada. La encontrarás adjunta.</p>`;
                await emailService.sendEmail(req.body.email, 'Tu Acta de Máxima Autoridad ha sido Generada', emailHtml, attachments);
                
                console.log(`Proceso de documento y correo para ${numeroActa} completado.`);
            } catch (backgroundError) {
                console.error(`Error en el proceso de fondo para el acta ${numeroActa}:`, backgroundError);
            }
        })();

    } catch (error) {
        console.error('Error en createActaMaximaAutoridadPaga:', error);
    }
       
};


/**
 * Crea un Acta Entrante (de Pago) o un Acta de Omisión y la envía por correo.
 */
const createActaEntrantePaga = async (req, res) => {
    try {
        const id = Math.random().toString(36).substring(2, 10).toUpperCase();
        const allData = await sheets.getSheetData(ACTA_ENTRANTE_PAGA_SHEET);
        let nextNumber = 1;
        if (allData && allData.length > 1) {
            const lastRow = allData[allData.length - 1];
            const lastActaNumber = lastRow[0];
            const lastNumberMatch = lastActaNumber.match(/-(\d+)$/);
            if (lastNumberMatch) {
                nextNumber = parseInt(lastNumberMatch[1], 10) + 1;
            }
        }
        const formattedNumber = String(nextNumber).padStart(3, '0');
        const numeroActa = `A.E.P.-${formattedNumber}`;

        // --- INICIO DE LA LÓGICA CORRECTA (IGUAL A MÁXIMA AUTORIDAD) ---

        // 1. Objeto para manejar todos los datos de forma flexible.
        const newRowData = {};
        Object.keys(req.body).forEach(key => {
            newRowData[key] = req.body[key] || '';
        });

        // 2. Lógica CLAVE para poblar los anexos dinámicamente.
        for (const pregunta in anexosMap) {
            const anexoInfo = anexosMap[pregunta];
            if (req.body[pregunta] === 'SI') {
                newRowData[anexoInfo.key] = anexoInfo.text; // Añade el texto del anexo
            } else {
                // Deja el valor vacío para que el generador de documentos elimine la línea
                newRowData[anexoInfo.key] = '';
            }
        }
        
        // 3. Asignar valores generados y procesar anexos especiales VI y VII.
        newRowData['numeroActa'] = numeroActa;
        newRowData['id'] = id;

        if (newRowData['Anexo_VI'] && newRowData['Anexo_VI'].trim()) {
            newRowData['Anexo_VI'] = `${newRowData['Anexo_VI']}\nVER ANEXO 6`;
        }
        
        if (newRowData['Anexos_VII'] && newRowData['Anexos_VII'].trim().toLowerCase() !== 'no aplica' && newRowData['Anexos_VII'].trim()) {
            newRowData['Anexo_VII'] = `Anexo Séptimo: Otros anexos del acta: ${newRowData['Anexos_VII']}`;
        } else {
            newRowData['Anexo_VII'] = '';
        }
        
        // 4. Preparar la fila para Google Sheets.
        // Se crea un array ordenado a partir de un objeto, lo que es más propenso a errores.
        // Es mejor definir los 'headers' explícitamente para asegurar el orden correcto.
        const headers = Object.keys(anexosMap).concat(Object.values(anexosMap).map(a => a.key)); // y otros campos...
        // Para simplificar y asegurar, vamos a construir el array en el orden que ya definiste.
        const allHeadersForSheet = [
             "numeroActa", "id", "email", "rifOrgano", "denominacionCargo", "nombreOrgano", "ciudadSuscripcion",
            "estadoSuscripcion", "horaSuscripcion", "fechaSuscripcion", "direccionOrgano", "nombreServidorEntrante",
            "cedulaServidorEntrante", "profesionServidorEntrante", "designacionServidorEntrante", "nombreAuditor",
            "cedulaAuditor", "profesionAuditor", "nombreTestigo1", "cedulaTestigo1", "profesionTestigo1",
            "nombreTestigo2", "cedulaTestigo2", "profesionTestigo2", "motivoEntrega", "nombreServidorSaliente",
            "cedulaServidorSaliente", "designacionServidorSaliente",
            ...Object.keys(anexosMap), ...Object.values(anexosMap).map(a => a.key),
            "Anexo_VI", "Anexos_VII", "observacionesAdicionales", "interesProducto", "omision"
        ].filter((v, i, a) => a.indexOf(v) === i);

        const newRowArray = allHeadersForSheet.map(header => newRowData[header] || '');
        const success = await sheets.appendSheetData(ACTA_ENTRANTE_PAGA_SHEET, newRowArray);

        // --- FIN DE LA LÓGICA CORRECTA ---

        if (!success) {
            return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
        }

        res.status(201).json({ 
            message: 'Acta Entrante (Paga) creada. El documento se está generando y se enviará por correo.',
            numeroActa: numeroActa,
            id: id
        });

        // El proceso en segundo plano no necesita cambios.
        (async () => {
            try {
                
                const templateName = 'actaEntregaPaga.html';
                const docBuffer = await documentService.generateDocFromTemplate(templateName, newRowData);
                const docFileName = `Acta_Entrante_${numeroActa}.docx`;

                if (!docBuffer || docBuffer.length === 0) {
                    throw new Error('El buffer del documento está vacío.');
                }

                const attachments = [{ filename: docFileName, content: docBuffer.toString('base64') }];
                const emailHtml = `<h1>Felicidades</h1><p>Tu Acta de Entrega Entrante ha sido generada. La encontrarás adjunta en este correo.</p>`;
                await emailService.sendEmail(req.body.email, 'Tu Acta de Entrega Entrante ha sido Generada', emailHtml, attachments);
                console.log(`Proceso de documento y correo para ${numeroActa} completado.`);
            } catch (backgroundError) {
                console.error(`Error en el proceso de fondo para el acta ${numeroActa}:`, backgroundError);
            }
        })();

    } catch (error) {
        console.error('Error en createActaEntrantePaga:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * Crea un Acta de Entrega Saliente (de Pago) y la envía por correo.
 */
const createActaSalientePaga = async (req, res) => {
  try {
    const id = Math.random().toString(36).substring(2, 10).toUpperCase();
    const allData = await sheets.getSheetData(ACTA_SALIENTE_PAGA_SHEET);
    let nextNumber = 1;
    if (allData && allData.length > 1) {
      const lastRow = allData[allData.length - 1];
      const lastActaNumber = lastRow[0];
      const lastNumberMatch = lastActaNumber.match(/-(\d+)$/);
      if (lastNumberMatch) {
        nextNumber = parseInt(lastNumberMatch[1], 10) + 1;
      }
    }
    const formattedNumber = String(nextNumber).padStart(3, '0');
    // Corregido el prefijo para "Acta Saliente Paga"
    const numeroActa = `A.S.P.-${formattedNumber}`;

    // 1. Objeto para manejar los datos
    const newRowData = {};
    Object.keys(req.body).forEach(key => {
        newRowData[key] = req.body[key] || '';
    });

    // 2. Lógica para poblar anexos dinámicamente
    for (const pregunta in anexosMap) {
        const anexoInfo = anexosMap[pregunta];
        if (req.body[pregunta] === 'SI') {
            newRowData[anexoInfo.key] = anexoInfo.text;
        } else {
            newRowData[anexoInfo.key] = '';
        }
    }
    
    // 3. Asignar valores generados
    newRowData['numeroActa'] = numeroActa;
    newRowData['id'] = id;

    // 4. Definir los encabezados en el orden correcto para la hoja de cálculo
    //    Asegúrate de que estos coincidan con los campos de tu formulario y la hoja de Google
    const headers = [
      "numeroActa", "id", "email", "rifOrgano", "denominacionCargo", "nombreOrgano",
      "ciudadSuscripcion", "estadoSuscripcion", "horaSuscripcion", "fechaSuscripcion", "direccionOrgano",
      "nombreServidorEntregador", "cedulaServidorEntregador", "designacionServidorEntregador", "motivoEntrega",
      "nombreServidorRecibe", "cedulaServidorRecibe", "designacionServidorRecibe",
      ...Object.keys(anexosMap), ...Object.values(anexosMap).map(a => a.key),
      "Anexo_VI", "Anexos_VII", "observacionesAdicionales", "interesProducto"
    ].filter((v, i, a) => a.indexOf(v) === i); // Evita duplicados

    // 5. Crear el array para Google Sheets y guardar
    const newRowArray = headers.map(header => newRowData[header] || '');
    const success = await sheets.appendSheetData(ACTA_SALIENTE_PAGA_SHEET, newRowArray);

    if (!success) {
      return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
    }
    
    // 6. Responder al usuario
    res.status(201).json({ 
        message: 'Acta Saliente (Paga) creada. El documento se está generando y se enviará por correo.',
        numeroActa: numeroActa,
        id: id
    });
    
    // 7. Proceso en segundo plano para generar y enviar el documento
    (async () => {
        try {
            // Usamos la nueva plantilla que creamos en el Paso 1
            const templateName = 'actaSalientePaga.html';
            
            const docBuffer = await documentService.generateDocFromTemplate(templateName, newRowData);
            const docFileName = `Acta_Saliente_${numeroActa}.docx`;

            if (!docBuffer || docBuffer.length === 0) {
                throw new Error('El buffer del documento está vacío.');
            }

            const attachments = [{ filename: docFileName, content: docBuffer.toString('base64') }];
            const emailHtml = `<h1>Felicidades</h1><p>Tu Acta de Entrega Saliente ha sido generada. La encontrarás adjunta.</p>`;
            await emailService.sendEmail(req.body.email, 'Tu Acta de Entrega Saliente ha sido Generada', emailHtml, attachments);
            
            console.log(`Proceso de documento y correo para ${numeroActa} completado.`);
        } catch (backgroundError) {
            console.error(`Error en el proceso de fondo para el acta ${numeroActa}:`, backgroundError);
        }
    })();
    
  } catch (error) {
    console.error('Error en createActaSalientePaga:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  createActaEntranteGratis,
  createActaSalienteGratis,
  createActaMaximaAutoridadGratis,
  createActaMaximaAutoridadPaga,
  createActaEntrantePaga,
  createActaSalientePaga,
};
