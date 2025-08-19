const { findUserByEmail, deleteUserByEmail } = require('./user.service');

const scheduledJobs = {};

/**
 * Programa la eliminación de un usuario si no confirma su email en 10 minutos.
 * @param {string} email - El email del usuario.
 */
const scheduleUserDeletion = (email) => {
    const tenMinutesInMillis = 10 * 60 * 1000;

    const job = setTimeout(async () => {
        console.log(`[Scheduler] Ejecutando tarea de limpieza para ${email}...`);
        try {
            const userToDelete = await findUserByEmail(email);
            console.log(`[Scheduler] Usuario encontrado para posible eliminación:`, userToDelete);
            // Verificar si el usuario existe y no ha sido verificado
            if (userToDelete && userToDelete['email_confirmation'] === 'FALSE') {
                console.log(`[Scheduler] Eliminando usuario ${email} por no confirmar su email.`);
                await deleteUserByEmail(email);
                console.log(`[Scheduler] Usuario ${email} eliminado exitosamente.`);
            } else {
                console.log(`[Scheduler] Usuario ${email} ya verificado o no encontrado, no se elimina.`);
            }
        } catch (error) {
            console.error(`[Scheduler] Error al intentar eliminar usuario no confirmado ${email}:`, error);
        } finally {
            // Limpiar el job del objeto de jobs programados
            delete scheduledJobs[email];
        }
    }, tenMinutesInMillis);

    // Guardar el job para poder cancelarlo si el usuario confirma a tiempo
    scheduledJobs[email] = job;
    console.log(`[Scheduler] Tarea de eliminación programada para el usuario ${email}.`);
};

/**
 * Cancela la eliminación programada de un usuario.
 * @param {string} email - El email del usuario.
 */
const cancelUserDeletion = (email) => {
    if (scheduledJobs[email]) {
        clearTimeout(scheduledJobs[email]);
        delete scheduledJobs[email];
        console.log(`[Scheduler] Tarea de eliminación cancelada para el usuario ${email}.`);
    }
};

module.exports = {
    scheduleUserDeletion,
    cancelUserDeletion,
};
