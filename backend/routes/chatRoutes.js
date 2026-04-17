const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Website Chat Endpoint
router.post('/', chatController.handleChat);

// WhatsApp Webhook Endpoints
router.get('/whatsapp', chatController.verifyWhatsApp);
router.post('/whatsapp', chatController.handleWhatsAppWebhook);

module.exports = router;
