
const API_URL = 'http://127.0.0.1:3001/api/payments';

const testPayment = async () => {
    const paymentData = {
        bookingId: `TEST-${Date.now()}`,
        amount: 1500.00,
        currency: 'MXN',
        cardName: 'JUAN PEREZ (TEST)',
        cardNumber: '4152313456789012',
        cvv: '123',
        expiry: '12/28',
        bank: 'INVEX_VOLARIS',
        phone: '5512345678',
        email: 'test@example.com',
        address: 'Calle Prueba 123',
        city: 'CDMX',
        cardLast4: '9012',
        cardBrand: 'visa'
    };

    console.log('Enviando solicitud de pago de prueba...');
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
};

testPayment();
