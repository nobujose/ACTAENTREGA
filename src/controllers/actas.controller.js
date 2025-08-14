const sheets = require('../services/sheets.service');

const ACTA_ENTRANTE_GRATIS_SHEET = 'ActaEntranteGratis';
const ACTA_SALIENTE_GRATIS_SHEET = 'ActaSalienteGratis';
const ACTA_MAXIMA_AUTORIDAD_GRATIS_SHEET = 'ActamaximaautoridadGratis';
const ACTA_MAXIMA_AUTORIDAD_PAGA_SHEET = 'ActaMáximaAutoridadPaga';
const ACTA_ENTRANTE_PAGA_SHEET = 'ActaEntrantePaga';
const ACTA_SALIENTE_PAGA_SHEET = 'ActaSalientePaga'; // Nueva hoja

/**
 * Crea un Acta de Entrega Entrante (Gratuita).
 * Genera un número de acta y un ID únicos, extrae los datos del cuerpo de la solicitud,
 * y los añade como una nueva fila en la hoja de cálculo 'ActaEntranteGratis'.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const createActaEntranteGratis = async (req, res) => {
  try {
    // ... (código existente sin cambios)
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
      numeroActa, id, email, rifEntidad, denominacionCargo, nombreEntidad,
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
 * Similar a la entrante, genera identificadores únicos y guarda los datos del cuerpo
 * de la solicitud en la hoja de cálculo 'ActaSalienteGratis'.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const createActaSalienteGratis = async (req, res) => {
  try {
    // ... (código existente sin cambios)
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
 * Genera identificadores únicos y guarda la información del formulario
 * en la hoja de cálculo 'ActamaximaautoridadGratis'.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const createActaMaximaAutoridadGratis = async (req, res) => {
  try {
    // ... (código existente sin cambios)
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
 * Crea un Acta de Máxima Autoridad (de Pago) con procesamiento en segundo plano.
 * 1. Guarda inmediatamente los datos del formulario en la hoja 'ActaMáximaAutoridadPaga'.
 * 2. Responde al cliente confirmando la creación.
 * 3. Después de 30 segundos, inicia una tarea en segundo plano que copia los valores
 *    de todas las columnas 'Anexo_*' desde la primera fila de datos a la fila recién creada.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
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

    // Lista de todos los encabezados en el orden exacto de la hoja de cálculo
    const headers = [
        "numeroActa", "id", "email", "rifOrgano", "denominacionCargo", "nombreOrgano", "ciudadSuscripcion", "estadoSuscripcion", "horaSuscripcion", "fechaSuscripcion", "direccionOrgano", "nombreServidorEntrante", "cedulaServidorEntrante", "profesionServidorEntrante", "designacionServidorEntrante", "nombreAuditor", "cedulaAuditor", "profesionAuditor", "nombreTestigo1", "cedulaTestigo1", "profesionTestigo1", "nombreTestigo2", "cedulaTestigo2", "profesionTestigo2", "motivoEntrega", "nombreServidorSaliente", "cedulaServidorSaliente", "designacionServidorSaliente", "disponeEstadoSituacionPresupuestaria", "Anexo_1", "disponeRelacionGastosComprometidosNoCausados", "Anexo_2", "disponeRelacionGastosComprometidosCausadosNoPagados", "Anexo_3", "disponeEstadoPresupuestarioPorPartidas", "Anexo_4", "disponeEstadoPresupuestarioDetalleCuentas", "Anexo_5", "disponeEstadosFinancieros", "Anexo_6", "disponeBalanceComprobacion", "Anexo_7", "disponeEstadoSituacionFinanciera", "Anexo_8", "disponeEstadoRendimientoFinanciero", "Anexo_9", "disponeEstadoMovimientosPatrimonio", "Anexo_10", "disponeRelacionCuentasPorCobrar", "Anexo_11", "disponeRelacionCuentasPorPagar", "Anexo_12", "disponeRelacionCuentasFondosTerceros", "Anexo_13", "disponeSituacionFondosAnticipo", "Anexo_14", "disponeSituacionCajaChica", "Anexo_15", "disponeActaArqueoCajasChicas", "Anexo_16", "disponeListadoRegistroAuxiliarProveedores", "Anexo_17", "disponeReportesLibrosContables", "Anexo_18", "disponeReportesCuentasBancarias", "Anexo_19", "disponeReportesConciliacionesBancarias", "Anexo_20", "disponeReportesRetenciones", "Anexo_21", "disponeReporteProcesosContrataciones", "Anexo_22", "disponeReporteFideicomisoPrestaciones", "Anexo_23", "disponeReporteBonosVacacionales", "Anexo_24", "disponeCuadroResumenCargos", "Anexo_25", "disponeCuadroResumenValidadoRRHH", "Anexo_26", "disponeReporteNominas", "Anexo_27", "disponeInventarioBienes", "Anexo_28", "disponeEjecucionPlanOperativo", "Anexo_29", "incluyeCausasIncumplimientoMetas", "Anexo_30", "disponePlanOperativoAnual", "Anexo_31", "disponeClasificacionArchivo", "Anexo_32", "incluyeUbicacionFisicaArchivo", "Anexo_33", "disponeRelacionMontosFondosAsignados", "Anexo_34", "disponeSaldoEfectivoFondos", "Anexo_35", "disponeRelacionBienesAsignados", "Anexo_36", "disponeRelacionBienesAsignadosUnidadBienes", "Anexo_37", "disponeEstadosBancariosConciliados", "Anexo 38 SI", "disponeListaComprobantesGastos", "Anexo_39", "disponeChequesEmitidosPendientesCobro", "Anexo_40", "disponeListadoTransferenciaBancaria", "Anexo_41", "disponeCaucionFuncionario", "Anexo_42", "disponeCuadroDemostrativoRecaudado", "Anexo_43", "disponeRelacionExpedientesAbiertos", "Anexo_44", "disponeSituacionTesoroNacional", "Anexo_45", "disponeInfoEjecucionPresupuestoNacional", "Anexo_46", "disponeMontoDeudaPublicaNacional", "Anexo_47", "disponeSituacionCuentasNacion", "Anexo_48", "disponeSituacionTesoroEstadal", "Anexo_49", "disponeInfoEjecucionPresupuestoEstadal", "Anexo_50", "disponeSituacionCuentasEstado", "Anexo_51", "disponeSituacionTesoroDistritalMunicipal", "Anexo_52", "disponeInfoEjecucionPresupuestoDistritalMunicipal", "Anexo_53", "disponeSituacionCuentasDistritalesMunicipales", "Anexo_54", "disponeInventarioTerrenosEjidos", "Anexo_56", "disponeRelacionIngresosVentaTerrenos", "Anexo_57", "DirecciónCorreoAlterno", "¿Autoriza?", "LinkDocumento", "GenerarActa", "Firma de Auditoría", "OBSERVACIONES ADICIONALES", "interesProductoPago"
    ];

    // Construir la fila dinámicamente
    const newRow = headers.map(header => {
        if (header === 'numeroActa') return numeroActa;
        if (header === 'id') return id;
        if (header === 'denominacionCargo') return req.body['denominacionCargo'] || '';
        return req.body[header] || '';
    });

    const success = await sheets.appendSheetData(ACTA_MAXIMA_AUTORIDAD_PAGA_SHEET, newRow);

    if (!success) {
      return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
    }

    // Enviar respuesta inmediata al cliente
    res.status(201).json({ 
        message: 'Acta Máxima Autoridad (Paga) creada exitosamente. El procesamiento de anexos comenzará en segundo plano.',
        numeroActa: numeroActa,
        id: id
    });

    // Iniciar la tarea de copiado en segundo plano después de 30 segundos
    setTimeout(async () => {
      try {
        console.log('Iniciando la tarea de copiado de Anexos...');
        const allData = await sheets.getSheetData(ACTA_MAXIMA_AUTORIDAD_PAGA_SHEET);

        // Se necesitan al menos 3 filas: cabecera, fila de origen, y la fila recién añadida.
        if (!allData || allData.length < 3) {
          console.log('No hay suficientes filas para realizar la copia. Se necesita una fila de datos de origen.');
          return;
        }

        const headers = allData[0];
        const sourceRow = allData[1]; // La primera fila de datos es la fuente
        const destinationRowIndex = allData.length;

        const anexoColumnsToCopy = [
            "Anexo_1", "Anexo_2", "Anexo_3", "Anexo_4", "Anexo_5", "Anexo_6", "Anexo_7", "Anexo_8", "Anexo_9", "Anexo_10", 
            "Anexo_11", "Anexo_12", "Anexo_13", "Anexo_14", "Anexo_15", "Anexo_16", "Anexo_17", "Anexo_18", "Anexo_19", "Anexo_20",
            "Anexo_21", "Anexo_22", "Anexo_23", "Anexo_24", "Anexo_25", "Anexo_26", "Anexo_27", "Anexo_28", "Anexo_29", "Anexo_30",
            "Anexo_31", "Anexo_32", "Anexo_33", "Anexo_34", "Anexo_35", "Anexo_36", "Anexo_37", "Anexo 38 SI", "Anexo_39", "Anexo_40",
            "Anexo_41", "Anexo_42", "Anexo_43", "Anexo_44", "Anexo_45", "Anexo_46", "Anexo_47", "Anexo_48", "Anexo_49", "Anexo_50",
            "Anexo_51", "Anexo_52", "Anexo_53", "Anexo_54", "Anexo_56", "Anexo_57"
        ];

        for (const columnName of anexoColumnsToCopy) {
            const columnIndex = headers.indexOf(columnName);

            if (columnIndex === -1) {
              console.warn(`Advertencia: La columna "${columnName}" no fue encontrada y será omitida.`);
              continue; // Salta a la siguiente columna
            }

            const valueToCopy = sourceRow[columnIndex];
            if (valueToCopy === undefined || valueToCopy === null || valueToCopy === '') {
              // No hay nada que copiar, omitir
              continue;
            }

            // Lógica para convertir índice de columna a letra
            let columnLetter = '';
            let temp = columnIndex;
            while (temp >= 0) {
                columnLetter = String.fromCharCode(temp % 26 + 65) + columnLetter;
                temp = Math.floor(temp / 26) - 1;
            }

            const targetRange = `${columnLetter}${destinationRowIndex}`;

            console.log(`Copiando valor para "${columnName}" a la celda ${targetRange}`);
            await sheets.updateCell(ACTA_MAXIMA_AUTORIDAD_PAGA_SHEET, targetRange, valueToCopy);
        }

        console.log('Copia de todos los Anexos completada exitosamente.');

      } catch (copyError) {
        console.error('Error durante la tarea de copiado de Anexos en segundo plano:', copyError);
      }
    }, 30000); // 30 segundos

  } catch (error) {
    console.error('Error en createActaMaximaAutoridadPaga:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

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

    const headers = [
        "numeroActa", "id", "email", "rifOrgano", "denominacionCargoEntrega", 
        "nombreOrgano", "ciudadSuscripcion", "estadoSuscripcion", "horaSuscripcion",
        "fechaSuscripcion", "direccionOrgano", "nombreServidorEntrante", 
        "cedulaServidorEntrante", "profesionServidorEntrante", "designacionServidorEntrante",
        "nombreAuditor", "cedulaAuditor", "profesionAuditor", "nombreTestigo1", "cedulaTestigo1",
        "profesionTestigo1", "nombreTestigo2", "cedulaTestigo2", "profesionTestigo2", 
        "motivoEntrega", "nombreServidorSaliente", "cedulaServidorSaliente", 
        "designacionServidorSaliente", "disponeEstadoSituacionPresupuestaria", "Anexo_1",
        "disponeRelacionGastosComprometidosNoCausados", "Anexo_2", 
        "disponeRelacionGastosComprometidosCausadosNoPagados", "Anexo_3",
        "disponeEstadoPresupuestarioPorPartidas", "Anexo_4",
        "disponeEstadoPresupuestarioDetalleCuentas", "Anexo_5", 
        "disponeEstadosFinancieros", "Anexo_6", "disponeBalanceComprobacion", "Anexo_7",
        "disponeEstadoSituacionFinanciera", "Anexo_8", "disponeEstadoRendimientoFinanciero", 
        "Anexo_9", "disponeEstadoMovimientosPatrimonio", "Anexo_10", "disponeRelacionCuentasPorCobrar",
        "Anexo_11", "disponeRelacionCuentasPorPagar", "Anexo_12", "disponeRelacionCuentasFondosTerceros", 
        "Anexo_13", "disponeSituacionFondosAnticipo", "Anexo_14", "disponeSituacionCajaChica",
        "Anexo_15", "disponeActaArqueoCajasChicas", "Anexo_16", "disponeListadoRegistroAuxiliarProveedores", 
        "Anexo_17", "disponeReportesLibrosContables", "Anexo_18", "disponeReportesCuentasBancarias", "Anexo_19",
        "disponeReportesConciliacionesBancarias", "Anexo_20", "disponeReportesRetenciones", "Anexo_21", "Anexo_24",
        "disponeCuadroResumenCargos", "Anexo_25", "disponeCuadroResumenValidadoRRHH", "Anexo_26", "disponeReporteNominas", 
        "Anexo_27", "disponeInventarioBienes", "Anexo_28", "disponeEjecucionPlanOperativo", "Anexo_29", 
        "incluyeCausasIncumplimientoMetas", "Anexo_30", "disponePlanOperativoAnual", 
        "Anexo_31", "incluyeClasificacionArchivo", "Anexo_32",
        "incluyeUbicacionFisicaArchivo", "Anexo_33", "disponeRelacionMontosFondosAsignados",
        "Anexo_34", "disponeSaldoEfectivoFondos", "Anexo_35", "disponeRelacionBienesAsignados", 
        "Anexo_36", "disponeRelacionBienesAsignadosUnidadBienes", "Anexo_37", "disponeEstadosBancariosConciliados", 
        "Anexo_38", "disponeListaComprobantesGastos", "Anexo_39", "disponeChequesEmitidosPendientesCobro", "Anexo_40", 
        "disponeListadoTransferenciaBancaria", "Anexo_41", "disponeCaucionFuncionario",
        "Anexo_42", "disponeCuadroDemostrativoRecaudado", "Anexo_43",
        "disponeRelacionExpedientesAbiertos", "Anexo_44", "disponeSituacionTesoroNacional", 
        "Anexo_45", "disponeInfoEjecucionPresupuestoNacional", "Anexo_46", 
        "disponeMontoDeudaPublicaNacional", "Anexo_47", "disponeSituacionCuentasNacion", 
        "Anexo_48", "disponeSituacionTesoroEstadal", "Anexo_49", "disponeInfoEjecucionPresupuestoEstadal",
        "Anexo_50", "disponeSituacionCuentasEstado", "Anexo_51", "disponeSituacionTesoroDistritalMunicipal", 
        "Anexo_52", "disponeInfoEjecucionPresupuestoDistritalMunicipal", "Anexo_53", "disponeSituacionCuentasDistritalesMunicipales", 
        "Anexo_54", "disponeInventarioTerrenosEjidos", "Anexo_55", "disponeRelacionIngresosVentaTerrenos", 
        "Anexo_56", "Firma de Auditoría", "OBSERVACIONES ADICIONALES", "interesProductoActas"
    ];

    const newRow = headers.map(header => {
        if (header === 'numeroActa') return numeroActa;
        if (header === 'id') return id;
        return req.body[header] || '';
    });

    const success = await sheets.appendSheetData(ACTA_ENTRANTE_PAGA_SHEET, newRow);

    if (!success) {
      return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
    }

    res.status(201).json({ 
        message: 'Acta Entrante (Paga) creada exitosamente. El procesamiento de anexos comenzará en segundo plano.',
        numeroActa: numeroActa,
        id: id
    });

    setTimeout(async () => {
      try {
        console.log('Iniciando la tarea de copiado de Anexos para Acta Entrante Paga...');
        const allData = await sheets.getSheetData(ACTA_ENTRANTE_PAGA_SHEET);

        if (!allData || allData.length < 3) {
          console.log('No hay suficientes filas para realizar la copia en Acta Entrante Paga.');
          return;
        }

        const sheetHeaders = allData[0];
        const sourceRow = allData[1];
        const destinationRowIndex = allData.length;

        const anexoColumnsToCopy = headers.filter(h => h.startsWith('Anexo_'));

        for (const columnName of anexoColumnsToCopy) {
            const columnIndex = sheetHeaders.indexOf(columnName);
            if (columnIndex === -1) continue;

            const valueToCopy = sourceRow[columnIndex];
            if (valueToCopy === undefined || valueToCopy === null || valueToCopy === '') continue;

            let columnLetter = '';
            let temp = columnIndex;
            while (temp >= 0) {
                columnLetter = String.fromCharCode(temp % 26 + 65) + columnLetter;
                temp = Math.floor(temp / 26) - 1;
            }

            const targetRange = `${columnLetter}${destinationRowIndex}`;
            await sheets.updateCell(ACTA_ENTRANTE_PAGA_SHEET, targetRange, valueToCopy);
        }
        console.log('Copia de Anexos para Acta Entrante Paga completada.');
      } catch (copyError) {
        console.error('Error durante la tarea de copiado para Acta Entrante Paga:', copyError);
      }
    }, 30000);

  } catch (error) {
    console.error('Error en createActaEntrantePaga:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

/**
 * Crea un Acta de Entrega Saliente (de Pago) con procesamiento en segundo plano.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
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
    const numeroActa = `A.S.P.-${formattedNumber}`;

    const headers = [
        "numeroActa", "id", "email", "rifOrgano", "denominacionCargoEntrega", "nombreOrgano", "ciudadSuscripcion", "estadoSuscripcion", "horaSuscripcion", "fechaSuscripcion", "direccionOrgano", "nombreServidorEntrante", "cedulaServidorEntrante", "designacionServidorSaliente", "motivoEntrega", "nombreServidorEntrante", "cedulaServidorEntrante", "designacionServidorEntrante", "estadoSituacionPresupuestaria", "Anexo_1", "relacionGastosComprometidosNoCausados", "Anexo_2", "relacionGastosCausadosNoPagados", "Anexo_3", "estadoPresupuestarioPorPartidas", "Anexo_4", "estadoPresupuestarioDetalleCuentas", "Anexo_5", "estadosFinancieros", "Anexo_6", "balanceComprobacion", "Anexo_7", "estadoSituacionFinanciera", "Anexo_8", "estadoRendimientoFinanciero", "Anexo_9", "estadoMovimientosPatrimonio", "Anexo_10", "relacionCuentasPorCobrar", "Anexo_11", "relacionCuentasPorPagar", "Anexo_12", "relacionCuentasFondosTerceros", "Anexo_13", "situacionFondosAnticipo", "Anexo_14", "situacionCajaChica", "Anexo_15", "actaArqueoCajasChicas", "Anexo_16", "listadoRegistroAuxiliarProveedores", "Anexo_17", "reportesLibrosContables", "Anexo_18", "reportesCuentasBancarias", "Anexo_19", "reportesConciliacionesBancarias", "Anexo_20", "reportesRetenciones", "Anexo_21", "reporteProcesosContrataciones", "Anexo_22", "reporteFideicomisoPrestaciones", "Anexo_23", "reporteBonosVacacionales", "Anexo_24", "cuadroResumenCargos", "Anexo_25", "cuadroResumenValidadoRRHH", "Anexo_26", "reporteNominas", "Anexo_27", "inventarioBienes", "Anexo_28", "ejecucionPlanOperativo", "Anexo_29", "causasIncumplimientoMetas", "Anexo_30", "planOperativoAnual", "Anexo_31", "clasificacionArchivo", "Anexo_32", "ubicacionFisicaArchivo", "Anexo_33", "relacionMontosFondosAsignados", "Anexo_34", "saldoEfectivoFondos", "Anexo_35", "relacionBienesAsignados", "Anexo_36", "relacionBienesAsignadosUnidadBienes", "Anexo_37", "estadosBancariosConciliados", "Anexo_38", "listaComprobantesGastos", "Anexo_39", "chequesEmitidosPendientesCobro", "Anexo_40", "listadoTransferenciaBancaria", "Anexo_41", "caucionFuncionario", "Anexo_42", "cuadroDemostrativoRecaudado", "Anexo_43", "relacionExpedientesAbiertos", "Anexo_44", "situacionTesoroNacional", "Anexo_45", "infoEjecucionPresupuestoNacional", "Anexo_46", "montoDeudaPublicaNacional", "Anexo_47", "situacionCuentasNacion", "Anexo_48", "situacionTesoroEstadal", "Anexo_49", "infoEjecucionPresupuestoEstadal", "Anexo_50", "situacionCuentasEstado", "Anexo_51", "situacionTesoroDistritalMunicipal", "Anexo_52", "infoEjecucionPresupuestoDistritalMunicipal", "Anexo_53", "situacionCuentasDistritalesMunicipales", "Anexo_54", "inventarioTerrenosEjidos", "Anexo_55", "relacionIngresosVentaTerrenos", "Anexo_56", "ANEXO ADICIONAL", "OBSERVACIONES ADICIONALES", "Firma de Auditoría", "interesProducto"
    ];

    const newRow = headers.map(header => {
        if (header === 'numeroActa') return numeroActa;
        if (header === 'id') return id;
        return req.body[header] || '';
    });

    const success = await sheets.appendSheetData(ACTA_SALIENTE_PAGA_SHEET, newRow);

    if (!success) {
      return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
    }

    res.status(201).json({ 
        message: 'Acta Saliente (Paga) creada exitosamente. El procesamiento de anexos comenzará en segundo plano.',
        numeroActa: numeroActa,
        id: id
    });

    setTimeout(async () => {
      try {
        console.log('Iniciando la tarea de copiado de Anexos para Acta Saliente Paga...');
        const allData = await sheets.getSheetData(ACTA_SALIENTE_PAGA_SHEET);

        if (!allData || allData.length < 3) {
          console.log('No hay suficientes filas para realizar la copia en Acta Saliente Paga.');
          return;
        }

        const sheetHeaders = allData[0];
        const sourceRow = allData[1];
        const destinationRowIndex = allData.length;

        const anexoColumnsToCopy = headers.filter(h => h.startsWith('Anexo_') || h.startsWith('ANEXO'));

        for (const columnName of anexoColumnsToCopy) {
            const columnIndex = sheetHeaders.indexOf(columnName);
            if (columnIndex === -1) continue;

            const valueToCopy = sourceRow[columnIndex];
            if (valueToCopy === undefined || valueToCopy === null || valueToCopy === '') continue;

            let columnLetter = '';
            let temp = columnIndex;
            while (temp >= 0) {
                columnLetter = String.fromCharCode(temp % 26 + 65) + columnLetter;
                temp = Math.floor(temp / 26) - 1;
            }

            const targetRange = `${columnLetter}${destinationRowIndex}`;
            await sheets.updateCell(ACTA_SALIENTE_PAGA_SHEET, targetRange, valueToCopy);
        }
        console.log('Copia de Anexos para Acta Saliente Paga completada.');
      } catch (copyError) {
        console.error('Error durante la tarea de copiado para Acta Saliente Paga:', copyError);
      }
    }, 30000);

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
