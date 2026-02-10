import TelegramBot from 'node-telegram-bot-api';
const token = '7541984113:AAEEHU_jwdN_6XmImOnthItO7xHrPOBnz1E';
const chatId = '6065537099';
const bot = new TelegramBot(token, { polling: false });
console.log('Iniciando prueba de envío a Telegram...');
console.log(`Token: ${token}`);
console.log(`Chat ID: ${chatId}`);
bot.sendMessage(chatId, '🔔 *PRUEBA DE CONEXIÓN* \n\nEl sistema de notificaciones está activo.', { parse_mode: 'Markdown' })
    .then((msg) => {
    console.log('Mensaje enviado correctamente:', msg.message_id);
    process.exit(0);
})
    .catch((error) => {
    console.error('Error al enviar mensaje:', error.message);
    if (error.response) {
        console.error('Detalles del error:', error.response.body);
    }
    process.exit(1);
});
//# sourceMappingURL=test-telegram.js.map