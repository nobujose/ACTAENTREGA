const handleRedirect = (req, res) => {
  // En una aplicación real, aquí se procesaría un token (ej. de verificación)
  // y se redirigiría al frontend con un estado.
  // Por ahora, es una simple redirección de marcador de posición.
  const frontendUrl = 'http://localhost:3001/verification-status'; // URL de ejemplo del frontend
  res.redirect(`${frontendUrl}?status=success`);
};

module.exports = {
  handleRedirect,
};
