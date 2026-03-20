const router = require('express').Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

router.post('/register', authController.register);
router.post('/setup-admin', authController.setupAdmin);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.patch('/change-password', authenticate, authController.changePassword);

module.exports = router;
