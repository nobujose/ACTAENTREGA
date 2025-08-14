const { Router } = require('express');
const { handleRedirect } = require('../controllers/redirect.controller');
const router = Router();

router.get('/', handleRedirect);

module.exports = router;
