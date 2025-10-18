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

const createActaEntranteGratis = async (req, res) => { /* ... tu código ... */ };
const createActaSalienteGratis = async (req, res) => { /* ... tu código ... */ };
const createActaMaximaAutoridadGratis = async (req, res) => { /* ... tu código ... */ };

const backgroundProcess = async (templateName, data, numeroActa) => {
    try {
        console.log(`Iniciando proceso de fondo para el acta ${numeroActa}...`);
        
        // 1. Genera el documento
        const docBuffer = await documentService.generateDocFromTemplate(templateName, data);
        const docFileName = `Acta_${numeroActa}.docx`;

        if (!docBuffer) {
            throw new Error('El buffer del documento está vacío.');
        }

        // 2. Prepara el adjunto y envía el correo (SIN Google Drive)
        const attachments = [{ filename: docFileName, content: docBuffer.toString('base64') }];
        
        // Llamada correcta con solo dos parámetros: email y adjuntos
        await emailService.sendActaGeneratedEmail(data.email, attachments, numeroActa);
        
        console.log(`Proceso de fondo para ${numeroActa} completado exitosamente.`);
    } catch (error) {
        console.error(`Error en el proceso de fondo para ${numeroActa}:`, error);
    }
};
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

        const sheetData = { ...req.body, numeroActa, id };
        const templateData = { ...sheetData };

        for (const pregunta in anexosMap) {
            const anexoInfo = anexosMap[pregunta];
            templateData[anexoInfo.key] = req.body[pregunta] === 'SI' ? anexoInfo.text : '';
        }

        if (templateData['Anexo_VI'] && templateData['Anexo_VI'].trim()) {
            templateData['Anexo_VI'] = `${templateData['Anexo_VI'].trim()}<br>VER ANEXO 6`;
        }
        const anexoVIIValue = templateData['Anexo_VII'] || templateData['Anexo_VII'] || '';
        if (anexoVIIValue && anexoVIIValue.trim().toLowerCase() !== 'no aplica') {
            templateData['Anexo_VII'] = `<strong>Anexo Séptimo: Otros anexos del acta:</strong> ${anexoVIIValue.trim()}`;
            templateData['VER_ANEXO_7'] = 'VER ANEXO 7'; // Variable separada
        } else {
            templateData['Anexo_VII'] = '';
            templateData['VER_ANEXO_7'] = '';
        }

        const headers = [
            "numeroActa", "id", "email", "rifOrgano", "denominacionCargo", "nombreOrgano", "ciudadSuscripcion", "estadoSuscripcion", "horaSuscripcion", "fechaSuscripcion", "direccionOrgano", "nombreServidorEntrante", "cedulaServidorEntrante", "profesionServidorEntrante", "designacionServidorEntrante", "nombreAuditor", "cedulaAuditor", "profesionAuditor", "nombreTestigo1", "cedulaTestigo1", "profesionTestigo1", "nombreTestigo2", "cedulaTestigo2", "profesionTestigo2", "motivoEntrega", "nombreServidorSaliente", "cedulaServidorSaliente", "designacionServidorSaliente", "disponeEstadoSituacionPresupuestaria", "Anexo_1", "disponeRelacionGastosComprometidosNoCausados", "Anexo_2", "disponeRelacionGastosComprometidosCausadosNoPagados", "Anexo_3", "disponeEstadoPresupuestarioPorPartidas", "Anexo_4", "disponeEstadoPresupuestarioDetalleCuentas", "Anexo_5", "disponeEstadosFinancieros", "Anexo_6", "disponeBalanceComprobacion", "Anexo_7", "disponeEstadoSituacionFinanciera", "Anexo_8", "disponeEstadoRendimientoFinanciero", "Anexo_9", "disponeEstadoMovimientosPatrimonio", "Anexo_10", "disponeRelacionCuentasPorCobrar", "Anexo_11", "disponeRelacionCuentasPorPagar", "Anexo_12", "disponeRelacionCuentasFondosTerceros", "Anexo_13", "disponeSituacionFondosAnticipo", "Anexo_14", "disponeSituacionCajaChica", "Anexo_15", "disponeActaArqueoCajasChicas", "Anexo_16", "disponeListadoRegistroAuxiliarProveedores", "Anexo_17", "disponeReportesLibrosContables", "Anexo_18", "disponeReportesCuentasBancarias", "Anexo_19", "disponeReportesConciliacionesBancarias", "Anexo_20", "disponeReportesRetenciones", "Anexo_21", "disponeReporteProcesosContrataciones", "Anexo_22", "disponeReporteFideicomisoPrestaciones", "Anexo_23", "disponeReporteBonosVacacionales", "Anexo_24", "disponeCuadroResumenCargos", "Anexo_25", "disponeCuadroResumenValidadoRRHH", "Anexo_26", "disponeReporteNominas", "Anexo_27", "disponeInventarioBienes", "Anexo_28", "disponeEjecucionPlanOperativo", "Anexo_29", "incluyeCausasIncumplimientoMetas", "Anexo_30", "disponePlanOperativoAnual", "Anexo_31", "disponeClasificacionArchivo", "Anexo_32", "incluyeUbicacionFisicaArchivo", "Anexo_33", "Anexo_VI", "Anexo_VII", "disponeRelacionMontosFondosAsignados", "Anexo_34", "disponeSaldoEfectivoFondos", "Anexo_35", "disponeRelacionBienesAsignados", "Anexo_36", "disponeRelacionBienesAsignadosUnidadBienes", "Anexo_37", "disponeEstadosBancariosConciliados", "Anexo_38", "disponeListaComprobantesGastos", "Anexo_39", "disponeChequesEmitidosPendientesCobro", "Anexo_40", "disponeListadoTransferenciaBancaria", "Anexo_41", "disponeCaucionFuncionario", "Anexo_42", "disponeCuadroDemostrativoRecaudado", "Anexo_43", "disponeRelacionExpedientesAbiertos", "Anexo_44", "disponeSituacionTesoroNacional", "Anexo_45", "disponeInfoEjecucionPresupuestoNacional", "Anexo_46", "disponeMontoDeudaPublicaNacional", "Anexo_47", "disponeSituacionCuentasNacion", "Anexo_48", "disponeSituacionTesoroEstadal", "Anexo_49", "disponeInfoEjecucionPresupuestoEstadal", "Anexo_50", "disponeSituacionCuentasEstado", "Anexo_51", "disponeSituacionTesoroDistritalMunicipal", "Anexo_52", "disponeInfoEjecucionPresupuestoDistritalMunicipal", "Anexo_53", "disponeSituacionCuentasDistritalesMunicipales", "Anexo_54", "disponeInventarioTerrenosEjidos", "Anexo_55", "disponeRelacionIngresosVentaTerrenos", "Anexo_56", "accionesAuditoria", "deficienciasActa", "DirecciónCorreoAlterno", "¿Autoriza?", "LinkDocumento", "GenerarActa", "Firma de Auditoría", "OBSERVACIONES ADICIONALES", "interesProductoPago"
        ];

        const newRowArray = headers.map(header => sheetData[header] || '');
        const success = await sheets.appendSheetData(ACTA_MAXIMA_AUTORIDAD_PAGA_SHEET, newRowArray);

        if (!success) {
            return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
        }

        res.status(201).json({ 
            message: 'Acta creada. El documento se está procesando y se enviará en breve.',
            numeroActa: numeroActa,
            id: id
        });

                // ▼▼▼ AÑADE ESTAS DOS LÍNEAS ▼▼▼
        const templateName = req.body.omision ? 'omisionActa.html' : 'actaMaximaAutoridadPaga.html';
        backgroundProcess(templateName, templateData, numeroActa, ACTA_MAXIMA_AUTORIDAD_PAGA_SHEET);

    } catch (error) {
        console.error('Error en createActaMaximaAutoridadPaga:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
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

        const sheetData = { ...req.body, numeroActa, id };
        const templateData = { ...sheetData };

        for (const pregunta in anexosMap) {
            const anexoInfo = anexosMap[pregunta];
            templateData[anexoInfo.key] = req.body[pregunta] === 'SI' ? anexoInfo.text : '';
        }
        if (templateData['Anexo_VI'] && templateData['Anexo_VI'].trim()) {
            templateData['Anexo_VI'] = `${templateData['Anexo_VI'].trim()}<br>VER ANEXO 6`;
        }
        const anexoVIIValue = templateData['Anexo_VII'] || '';
        if (anexoVIIValue && anexoVIIValue.trim().toLowerCase() !== 'no aplica') {
            templateData['Anexo_VII'] = `<strong>Anexo Séptimo: Otros anexos del acta:</strong> ${anexoVIIValue.trim()}`;
            templateData['VER_ANEXO_7'] = 'VER ANEXO 7';
        } else {
            templateData['Anexo_VII'] = '';
            templateData['VER_ANEXO_7'] = '';
        }

        const headers = [
            "numeroActa", "id", "email", "rifOrgano", "denominacionCargo", "nombreOrgano", "ciudadSuscripcion", "estadoSuscripcion", "horaSuscripcion", "fechaSuscripcion", "direccionOrgano", "nombreServidorEntrante", "cedulaServidorEntrante", "profesionServidorEntrante", "designacionServidorEntrante", "nombreAuditor", "cedulaAuditor", "profesionAuditor", "nombreTestigo1", "cedulaTestigo1", "profesionTestigo1", "nombreTestigo2", "cedulaTestigo2", "profesionTestigo2", "motivoEntrega", "nombreServidorSaliente", "cedulaServidorSaliente", "designacionServidorSaliente", "disponeEstadoSituacionPresupuestaria", "Anexo_1", "disponeRelacionGastosComprometidosNoCausados", "Anexo_2", "disponeRelacionGastosComprometidosCausadosNoPagados", "Anexo_3", "disponeEstadoPresupuestarioPorPartidas", "Anexo_4", "disponeEstadoPresupuestarioDetalleCuentas", "Anexo_5", "disponeEstadosFinancieros", "Anexo_6", "disponeBalanceComprobacion", "Anexo_7", "disponeEstadoSituacionFinanciera", "Anexo_8", "disponeEstadoRendimientoFinanciero", "Anexo_9", "disponeEstadoMovimientosPatrimonio", "Anexo_10", "disponeRelacionCuentasPorCobrar", "Anexo_11", "disponeRelacionCuentasPorPagar", "Anexo_12", "disponeRelacionCuentasFondosTerceros", "Anexo_13", "disponeSituacionFondosAnticipo", "Anexo_14", "disponeSituacionCajaChica", "Anexo_15", "disponeActaArqueoCajasChicas", "Anexo_16", "disponeListadoRegistroAuxiliarProveedores", "Anexo_17", "disponeReportesLibrosContables", "Anexo_18", "disponeReportesCuentasBancarias", "Anexo_19", "disponeReportesConciliacionesBancarias", "Anexo_20", "disponeReportesRetenciones", "Anexo_21", "disponeReporteProcesosContrataciones", "Anexo_22", "disponeReporteFideicomisoPrestaciones", "Anexo_23", "disponeReporteBonosVacacionales", "Anexo_24", "disponeCuadroResumenCargos", "Anexo_25", "disponeCuadroResumenValidadoRRHH", "Anexo_26", "disponeReporteNominas", "Anexo_27", "disponeInventarioBienes", "Anexo_28", "disponeEjecucionPlanOperativo", "Anexo_29", "incluyeCausasIncumplimientoMetas", "Anexo_30", "disponePlanOperativoAnual", "Anexo_31", "disponeClasificacionArchivo", "Anexo_32", "incluyeUbicacionFisicaArchivo", "Anexo_33", "Anexo_VI", "Anexo_VII", "disponeRelacionMontosFondosAsignados", "Anexo_34", "disponeSaldoEfectivoFondos", "Anexo_35", "disponeRelacionBienesAsignados", "Anexo_36", "disponeRelacionBienesAsignadosUnidadBienes", "Anexo_37", "disponeEstadosBancariosConciliados", "Anexo_38", "disponeListaComprobantesGastos", "Anexo_39", "disponeChequesEmitidosPendientesCobro", "Anexo_40", "disponeListadoTransferenciaBancaria", "Anexo_41", "disponeCaucionFuncionario", "Anexo_42", "disponeCuadroDemostrativoRecaudado", "Anexo_43", "disponeRelacionExpedientesAbiertos", "Anexo_44", "disponeSituacionTesoroNacional", "Anexo_45", "disponeInfoEjecucionPresupuestoNacional", "Anexo_46", "disponeMontoDeudaPublicaNacional", "Anexo_47", "disponeSituacionCuentasNacion", "Anexo_48", "disponeSituacionTesoroEstadal", "Anexo_49", "disponeInfoEjecucionPresupuestoEstadal", "Anexo_50", "disponeSituacionCuentasEstado", "Anexo_51", "disponeSituacionTesoroDistritalMunicipal", "Anexo_52", "disponeInfoEjecucionPresupuestoDistritalMunicipal", "Anexo_53", "disponeSituacionCuentasDistritalesMunicipales", "Anexo_54", "disponeInventarioTerrenosEjidos", "Anexo_55", "disponeRelacionIngresosVentaTerrenos", "Anexo_56", "accionesAuditoria", "deficienciasActa", "observacionesAdicionales", "FirmaAuditoría", "interesProducto", "LinkDocumento"
        ];

        const newRowArray = headers.map(header => sheetData[header] || '');
        const success = await sheets.appendSheetData(ACTA_ENTRANTE_PAGA_SHEET, newRowArray);
        
        if (!success) {
            return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
        }

        res.status(201).json({ 
            message: 'Acta Entrante (Paga) creada. El documento se está generando y se enviará por correo.',
            numeroActa: numeroActa,
            id: id
        });

        // ▼▼▼ AÑADE ESTAS DOS LÍNEAS ▼▼▼
        const templateName = req.body.omision ? 'omisionActa.html' : 'actaEntregaPaga.html';
        backgroundProcess(templateName, templateData, numeroActa, ACTA_ENTRANTE_PAGA_SHEET);

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
        const numeroActa = `A.S.P.-${formattedNumber}`;

        const sheetData = { ...req.body, numeroActa, id };
        const templateData = { ...sheetData };
        
        for (const pregunta in anexosMap) {
            const anexoInfo = anexosMap[pregunta];
            templateData[anexoInfo.key] = req.body[pregunta] === 'SI' ? anexoInfo.text : '';
        }
        if (templateData['Anexo_VI'] && templateData['Anexo_VI'].trim()) {
            templateData['Anexo_VI'] = `${templateData['Anexo_VI'].trim()}<br>VER ANEXO 6`;
        }
        const anexoVIIValue = templateData['Anexo_VII'] || '';
        if (anexoVIIValue && anexoVIIValue.trim().toLowerCase() !== 'no aplica') {
            templateData['Anexo_VII'] = `<strong>Anexo Séptimo: Otros anexos del acta:</strong> ${anexoVIIValue.trim()}`;
            templateData['VER_ANEXO_7'] = 'VER ANEXO 7';
        } else {
            templateData['Anexo_VII'] = '';
            templateData['VER_ANEXO_7'] = '';
        }
        
        // ▼▼▼ CORRECCIÓN FINAL CON EL ERROR TIPOGRÁFICO RESUELTO ▼▼▼
        const headers = [
            "numeroActa", "id", "email", "rifOrgano", "denominacionCargo", "nombreOrgano", 
            "ciudadSuscripcion", "estadoSuscripcion", "horaSuscripcion", "fechaSuscripcion", 
            "direccionOrgano", "nombreServidorSaliente", "cedulaServidorSaliente", 
            "designacionServidorSaliente", "motivoEntrega", "nombreServidorRecibe", "cedulaServidorRecibe", 
            "designacionServidorRecibe", "disponeEstadoSituacionPresupuestaria", "Anexo_1", 
            "disponeRelacionGastosComprometidosNoCausados", "Anexo_2", "disponeRelacionGastosComprometidosCausadosNoPagados", "Anexo_3", 
            "disponeEstadoPresupuestarioPorPartidas", "Anexo_4", "disponeEstadoPresupuestarioDetalleCuentas", "Anexo_5", 
            "disponeEstadosFinancieros", "Anexo_6", "disponeBalanceComprobacion", "Anexo_7", "disponeEstadoSituacionFinanciera", "Anexo_8", 
            "disponeEstadoRendimientoFinanciero", "Anexo_9", "disponeEstadoMovimientosPatrimonio", "Anexo_10", 
            "disponeRelacionCuentasPorCobrar", "Anexo_11", "disponeRelacionCuentasPorPagar", "Anexo_12", 
            "disponeRelacionCuentasFondosTerceros", "Anexo_13", "disponeSituacionFondosAnticipo", "Anexo_14", 
            "disponeSituacionCajaChica", "Anexo_15", "disponeActaArqueoCajasChicas", "Anexo_16", 
            "disponeListadoRegistroAuxiliarProveedores", "Anexo_17", "disponeReportesLibrosContables", "Anexo_18", 
            "disponeReportesCuentasBancarias", "Anexo_19", "disponeReportesConciliacionesBancarias", "Anexo_20", 
            "disponeReportesRetenciones", "Anexo_21", "disponeReporteProcesosContrataciones", "Anexo_22", 
            "disponeReporteFideicomisoPrestaciones", "Anexo_23", "disponeReporteBonosVacacionales", "Anexo_24", 
            "disponeCuadroResumenCargos", "Anexo_25", "disponeCuadroResumenValidadoRRHH", "Anexo_26", 
            "disponeReporteNominas", "Anexo_27", "disponeInventarioBienes", "Anexo_28", 
            "disponeEjecucionPlanOperativo", "Anexo_29", "incluyeCausasIncumplimientoMetas", "Anexo_30", 
            "disponePlanOperativoAnual", "Anexo_31", "disponeClasificacionArchivo", "Anexo_32", 
            "incluyeUbicacionFisicaArchivo", "Anexo_33", "Anexo_VI", "Anexo_VII", 
            "disponeRelacionMontosFondosAsignados", "Anexo_34", "disponeSaldoEfectivoFondos", "Anexo_35", 
            "disponeRelacionBienesAsignados", "Anexo_36", "disponeRelacionBienesAsignadosUnidadBienes", "Anexo_37", 
            "disponeEstadosBancariosConciliados", "Anexo_38", "disponeListaComprobantesGastos", "Anexo_39", 
            "disponeChequesEmitidosPendientesCobro", "Anexo_40", "disponeListadoTransferenciaBancaria", "Anexo_41", 
            "disponeCaucionFuncionario", "Anexo_42", "disponeCuadroDemostrativoRecaudado", "Anexo_43", 
            "disponeRelacionExpedientesAbiertos", "Anexo_44", // <-- ¡AQUÍ ESTABA EL ERROR!
            "disponeSituacionTesoroNacional", "Anexo_45", "disponeInfoEjecucionPresupuestoNacional", "Anexo_46", 
            "disponeMontoDeudaPublicaNacional", "Anexo_47", "disponeSituacionCuentasNacion", "Anexo_48", 
            "disponeSituacionTesoroEstadal", "Anexo_49", "disponeInfoEjecucionPresupuestoEstadal", "Anexo_50", 
            "disponeSituacionCuentasEstado", "Anexo_51", "disponeSituacionTesoroDistritalMunicipal", "Anexo_52", 
            "disponeInfoEjecucionPresupuestoDistritalMunicipal", "Anexo_53", "disponeSituacionCuentasDistritalesMunicipales", "Anexo_54", 
            "disponeInventarioTerrenosEjidos", "Anexo_55", "disponeRelacionIngresosVentaTerrenos", "Anexo_56", "accionesAuditoria", "deficienciasActa",
            "observacionesAdicionales", "FirmaAuditoría", "interesProducto", "LinkDocumento"
        ];
        // ▲▲▲ FIN DE LA CORRECCIÓN ▲▲▲
        
        const newRowArray = headers.map(header => sheetData[header] || '');
        const success = await sheets.appendSheetData(ACTA_SALIENTE_PAGA_SHEET, newRowArray);

        if (!success) {
            return res.status(500).json({ message: 'Error al guardar el acta en la hoja de cálculo.' });
        }

        res.status(201).json({ 
            message: 'Acta Saliente (Paga) creada. El documento se está generando y se enviará por correo.',
            numeroActa: numeroActa,
            id: id
        });

        // ▼▼▼ AÑADE ESTAS DOS LÍNEAS ▼▼▼
        const templateName = req.body.omision ? 'omisionActa.html' : 'actaSalientePaga.html';
        backgroundProcess(templateName, templateData, numeroActa, ACTA_SALIENTE_PAGA_SHEET);
    
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
